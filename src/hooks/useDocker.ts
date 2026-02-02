import { usePolling } from './usePolling'
import type { Container } from '../types'

const API_BASE = 'http://localhost:3001/api'

// Poll docker containers every 2 seconds
export function useDocker() {
  const { data, loading, error, refetch } = usePolling<Container[]>(
    '/docker/containers',
    2000,
    []
  )

  const startContainer = async (id: string) => {
    await fetch(`${API_BASE}/docker/containers/${id}/start`, { method: 'POST' })
    refetch()
  }

  const stopContainer = async (id: string) => {
    await fetch(`${API_BASE}/docker/containers/${id}/stop`, { method: 'POST' })
    refetch()
  }

  const restartContainer = async (id: string) => {
    await fetch(`${API_BASE}/docker/containers/${id}/restart`, { method: 'POST' })
    refetch()
  }

  const getLogs = async (id: string): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE}/docker/containers/${id}/logs`)
      const data = await res.json()
      return data.logs || 'No logs available'
    } catch {
      return 'Failed to fetch logs'
    }
  }

  return {
    containers: data,
    loading,
    error,
    startContainer,
    stopContainer,
    restartContainer,
    getLogs,
  }
}
