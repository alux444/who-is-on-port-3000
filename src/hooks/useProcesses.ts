import { usePolling } from './usePolling'
import type { Process } from '../types'

const API_BASE = 'http://localhost:3001/api'

// Poll processes every 3 seconds
export function useProcesses() {
  const { data, loading, error, refetch } = usePolling<Process[]>(
    '/processes',
    3000,
    []
  )

  const stopProcess = async (pid: number) => {
    await fetch(`${API_BASE}/processes/${pid}/stop`, { method: 'POST' })
    refetch()
  }

  return {
    processes: data,
    loading,
    error,
    stopProcess,
  }
}
