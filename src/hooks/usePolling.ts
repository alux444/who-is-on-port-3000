import { useState, useEffect, useCallback } from 'react'

const API_BASE = 'http://localhost:3001/api'

// Generic hook for polling an API endpoint
export function usePolling<T>(
  endpoint: string,
  interval: number,
  initialValue: T
): { data: T; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, interval)
    return () => clearInterval(id)
  }, [fetchData, interval])

  return { data, loading, error, refetch: fetchData }
}
