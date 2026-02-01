import { Router } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'
import { GIT_SCAN_DIRS, GIT_MAX_DEPTH, GIT_MAX_REPOS } from '../config.js'

// Convert callback-based exec to Promise-based so we can use async/await
const execAsync = promisify(exec)

export const gitRouter = Router()

interface GitRepo {
  path: string
  name: string
  branch: string
  dirty: boolean           // Has uncommitted changes?
  uncommittedCount: number // Number of modified/new files
  unpushedCount: number    // Commits made locally but not pushed
  behindCount: number      // Commits on remote we haven't pulled
}

// Searches a directory for git repositories
// Returns array of repo root paths (e.g., ["/Users/alex/Developer/myproject"])
async function findGitRepos(baseDir: string): Promise<string[]> {
  try {
    // find = search for files/directories
    // -maxdepth N = don't go more than N levels deep (avoids node_modules etc)
    // -type d     = only directories
    // -name .git  = named ".git" (the hidden folder that makes it a git repo)
    // 2>/dev/null = suppress "permission denied" errors
    //
    // Example output:
    // /Users/alex/Developer/myproject/.git
    // /Users/alex/Developer/another/.git
    const { stdout } = await execAsync(
      `find "${baseDir}" -maxdepth ${GIT_MAX_DEPTH} -type d -name .git 2>/dev/null`,
      { timeout: 10000 } // 10s timeout in case of slow filesystem
    )
    return stdout
      .trim()
      .split('\n')
      .filter(line => line)
      .map(gitDir => gitDir.replace(/\/\.git$/, '')) // Remove /.git suffix to get repo root
  } catch {
    return []
  }
}

// Gets the git status for a single repository
async function getRepoStatus(repoPath: string): Promise<GitRepo | null> {
  try {
    // Get the current branch name
    // git rev-parse --abbrev-ref HEAD returns just the branch name (e.g., "main")
    const { stdout: branchOut } = await execAsync(
      'git rev-parse --abbrev-ref HEAD',
      { cwd: repoPath } // Run command in the repo directory
    )
    const branch = branchOut.trim()

    // Get list of changed files
    // git status --porcelain outputs one line per changed file in a machine-readable format
    // Example output:
    //  M src/App.tsx        (modified)
    // ?? newfile.ts         (untracked)
    // A  staged.ts          (added/staged)
    const { stdout: statusOut } = await execAsync(
      'git status --porcelain',
      { cwd: repoPath }
    )
    const uncommittedCount = statusOut.trim().split('\n').filter(l => l).length
    const dirty = uncommittedCount > 0

    // Count commits that exist locally but haven't been pushed
    // @{u} = "upstream" (the remote branch we track, usually origin/main)
    // @{u}..HEAD = commits reachable from HEAD but not from upstream
    // --count = just give us the number
    let unpushedCount = 0
    try {
      const { stdout: unpushedOut } = await execAsync(
        `git rev-list @{u}..HEAD --count 2>/dev/null`,
        { cwd: repoPath }
      )
      unpushedCount = parseInt(unpushedOut.trim(), 10) || 0
    } catch {
      // Fails if no upstream is configured (e.g., new repo not pushed yet)
    }

    // Count commits on remote that we haven't pulled
    // HEAD..@{u} = commits reachable from upstream but not from HEAD
    let behindCount = 0
    try {
      const { stdout: behindOut } = await execAsync(
        `git rev-list HEAD..@{u} --count 2>/dev/null`,
        { cwd: repoPath }
      )
      behindCount = parseInt(behindOut.trim(), 10) || 0
    } catch {
      // Fails if no upstream configured
    }

    // Extract repo name from path (last folder name)
    const name = repoPath.split('/').pop() || repoPath

    return {
      path: repoPath,
      name,
      branch,
      dirty,
      uncommittedCount,
      unpushedCount,
      behindCount,
    }
  } catch {
    return null // Repo might be corrupted or not a valid git repo
  }
}

// GET /api/git/repos
// Scans for git repos and returns their status
gitRouter.get('/repos', async (_req, res) => {
  try {
    const allRepos: string[] = []

    // Search each potential project directory (configured in config.ts)
    for (const dir of GIT_SCAN_DIRS) {
      const repos = await findGitRepos(dir)
      allRepos.push(...repos)
    }

    // Remove duplicates (in case directories overlap)
    const uniqueRepos = [...new Set(allRepos)]

    // Get status for each repo
    // Limit to GIT_MAX_REPOS to avoid taking forever on machines with tons of repos
    const repos: GitRepo[] = []
    for (const repoPath of uniqueRepos.slice(0, GIT_MAX_REPOS)) {
      const status = await getRepoStatus(repoPath)
      if (status) repos.push(status)
    }

    // Sort so repos needing attention appear first:
    // 1. Dirty repos (uncommitted changes) first
    // 2. Then alphabetically by name
    repos.sort((a, b) => {
      if (a.dirty !== b.dirty) return a.dirty ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    res.json(repos)
  } catch {
    res.json([])
  }
})
