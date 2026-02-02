import { usePolling } from './usePolling'
import type { Port } from '../types'

// Poll listening ports every 5 seconds
export function usePorts() {
  return usePolling<Port[]>('/ports', 5000, [])
}
