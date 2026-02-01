import { Router } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'

// Convert callback-based exec to Promise-based so we can use async/await
const execAsync = promisify(exec)

export const portsRouter = Router()

interface Port {
  protocol: string
  localAddress: string
  port: number
  pid: number
  process: string
}

// GET /api/ports
// Lists all TCP ports that are listening for connections
portsRouter.get('/', async (_req, res) => {
  try {
    // lsof = "list open files" (in Unix, network sockets are files too)
    // -iTCP        = only show TCP connections
    // -sTCP:LISTEN = only show sockets in LISTEN state (servers waiting for connections)
    // -P           = don't convert port numbers to names (show 80, not "http")
    // -n           = don't convert IP addresses to hostnames (faster)
    //
    // Example output:
    // COMMAND   PID    USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME
    // node    12345   alex   23u  IPv4  0x1234      0t0  TCP *:3000 (LISTEN)
    // postgres 2411   alex   5u  IPv4  0x5678      0t0  TCP 127.0.0.1:5432 (LISTEN)
    const { stdout } = await execAsync('lsof -iTCP -sTCP:LISTEN -P -n')

    const lines = stdout.trim().split('\n').slice(1) // slice(1) skips the header row
    const ports: Port[] = []
    const seen = new Set<string>() // Track duplicates (same port+pid can appear multiple times)

    for (const line of lines) {
      // Split on whitespace. Example parts:
      // ["node", "12345", "alex", "23u", "IPv4", "0x1234", "0t0", "TCP", "*:3000"]
      const parts = line.split(/\s+/)
      if (parts.length < 9) continue // Malformed line

      const process = parts[0]  // Process name (e.g., "node", "postgres")
      const pid = parseInt(parts[1], 10)  // Process ID
      const nameField = parts[8]  // The address:port part (e.g., "*:3000" or "127.0.0.1:5432")

      // Extract address and port using regex
      // Matches: "*:3000", "127.0.0.1:5432", "[::1]:3000" (IPv6)
      const match = nameField.match(/(.+):(\d+)$/)
      if (!match) continue

      const localAddress = match[1] === '*' ? '0.0.0.0' : match[1]  // * means "all interfaces"
      const port = parseInt(match[2], 10)
      const key = `${port}-${pid}`

      // Skip if we've already seen this port+pid combo
      if (seen.has(key)) continue
      seen.add(key)

      ports.push({
        protocol: 'TCP',
        localAddress,
        port,
        pid,
        process,
      })
    }

    // Sort by port number for consistent display
    res.json(ports.sort((a, b) => a.port - b.port))
  } catch {
    // If lsof fails (not installed, permissions, etc), return empty array
    res.json([])
  }
})
