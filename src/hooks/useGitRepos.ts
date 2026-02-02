import { usePolling } from './usePolling'
import type { GitRepo } from '../types'

// Poll git repos every 30 seconds (expensive operation)
export function useGitRepos() {
  return usePolling<GitRepo[]>('/git/repos', 30000, [])
}
