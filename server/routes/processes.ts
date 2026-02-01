import { Router } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'
import { DEV_PROCESS_PATTERNS } from '../config.js'

// Convert callback-based exec to Promise-based so we can use async/await
const execAsync = promisify(exec)

export const processesRouter = Router()

interface Process {
  pid: number
  name: string
  cpu: number
  memory: number
  command: string
  cwd: string | null
}

// GET /api/processes
// Lists running dev-related processes with CPU/memory usage
processesRouter.get('/', async (_req, res) => {
  try {
    // ps = "process status" - lists running processes
    // -e           = show all processes (not just current user's)
    // -o           = custom output format:
    //   pid        = process ID
    //   pcpu       = CPU usage as percentage (e.g., 2.5)
    //   pmem       = memory usage as percentage
    //   comm       = command name only (e.g., "node")
    //   args       = full command with arguments (e.g., "node /path/to/server.js")
    // --sort=-pcpu = sort by CPU usage descending (highest first)
    // head -100    = limit to top 100 to avoid huge output
    //
    // Example output:
    //   PID  %CPU %MEM COMM            ARGS
    // 12345  5.2  1.3 node            node /Users/alex/project/server.js
    const { stdout } = await execAsync(
      'ps -eo pid,pcpu,pmem,comm,args --sort=-pcpu | head -100'
    )

    const lines = stdout.trim().split('\n').slice(1) // Skip header row
    const processes: Process[] = []

    for (const line of lines) {
      // Parse each line using regex
      // Format: "  PID  CPU  MEM  NAME  FULL_COMMAND..."
      const match = line.trim().match(/^(\d+)\s+([\d.]+)\s+([\d.]+)\s+(\S+)\s+(.*)$/)
      if (!match) continue

      const [, pidStr, cpuStr, memStr, name, command] = match
      const pid = parseInt(pidStr, 10)
      const cpu = parseFloat(cpuStr)
      const memory = parseFloat(memStr)

      // Only include processes that match our dev patterns (configured in config.ts)
      // Check both the short name and full command
      const isDevProcess = DEV_PROCESS_PATTERNS.some(
        pattern => name.includes(pattern) || command.includes(pattern)
      )
      if (!isDevProcess) continue

      // Try to get the process's working directory
      // This helps identify which project the process belongs to
      let cwd: string | null = null
      try {
        // lsof -p PID = show open files for this process
        // -Fn         = output just the name field
        // grep cwd    = find the "current working directory" entry
        //
        // Output looks like: "ncwd\n/Users/alex/myproject"
        // The 'n' prefix means "name", we strip it off
        const { stdout: cwdOut } = await execAsync(`lsof -p ${pid} -Fn 2>/dev/null | grep '^n/' | grep cwd | head -1`)
        cwd = cwdOut.replace(/^n/, '').trim() || null
      } catch {
        // Process may have exited, or we don't have permission - that's fine
      }

      processes.push({ pid, name, cpu, memory, command, cwd })
    }

    res.json(processes)
  } catch {
    res.json([])
  }
})

// POST /api/processes/:pid/stop
// Kills a process by PID
processesRouter.post('/:pid/stop', async (req, res) => {
  const pid = parseInt(req.params.pid, 10)
  if (isNaN(pid)) {
    return res.status(400).json({ error: 'Invalid PID' })
  }

  try {
    // kill sends SIGTERM by default (graceful shutdown request)
    // The process can catch this and clean up before exiting
    // Use "kill -9" for SIGKILL (force kill, can't be caught)
    await execAsync(`kill ${pid}`)
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to stop process' })
  }
})
