import { Router } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'

// Convert callback-based exec to Promise-based so we can use async/await
const execAsync = promisify(exec)

export const dockerRouter = Router()

interface PortMapping {
  host: number | null
  container: number
  protocol: string
}

interface Container {
  id: string
  name: string
  image: string
  status: string      // "Up 2 hours", "Exited (0) 3 days ago"
  state: string       // "running", "exited", "paused"
  ports: PortMapping[]
  created: string
  cpu: string | null  // "0.5%" (only for running containers)
  memory: string | null // "50MiB / 512MiB" (only for running containers)
}

// Parse port string like "0.0.0.0:8080->80/tcp, 443/tcp" into structured data
function parsePorts(portStr: string): PortMapping[] {
  if (!portStr) return []

  return portStr.split(', ').map(part => {
    // Format: "0.0.0.0:8080->80/tcp" or "80/tcp"
    const match = part.match(/(?:[\d.]+:(\d+)->)?(\d+)\/(\w+)/)
    if (!match) return null
    return {
      host: match[1] ? parseInt(match[1], 10) : null,
      container: parseInt(match[2], 10),
      protocol: match[3],
    }
  }).filter((p): p is PortMapping => p !== null)
}

// GET /api/docker/containers
// Lists all Docker containers (running + stopped)
dockerRouter.get('/containers', async (_req, res) => {
  try {
    // Get basic container info
    const { stdout } = await execAsync(
      'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.State}}|{{.Ports}}|{{.CreatedAt}}"'
    )

    const containers: Container[] = stdout
      .trim()
      .split('\n')
      .filter(line => line)
      .map(line => {
        const [id, name, image, status, state, ports, created] = line.split('|')
        return {
          id,
          name,
          image,
          status,
          state,
          ports: parsePorts(ports),
          created,
          cpu: null,
          memory: null,
        }
      })

    // Get stats for running containers
    const runningIds = containers.filter(c => c.state === 'running').map(c => c.id)
    if (runningIds.length > 0) {
      try {
        const { stdout: statsOut } = await execAsync(
          `docker stats --no-stream --format "{{.ID}}|{{.CPUPerc}}|{{.MemUsage}}" ${runningIds.join(' ')}`
        )
        const statsMap = new Map<string, { cpu: string; memory: string }>()
        statsOut.trim().split('\n').forEach(line => {
          const [id, cpu, memory] = line.split('|')
          statsMap.set(id, { cpu, memory })
        })

        containers.forEach(c => {
          const stats = statsMap.get(c.id)
          if (stats) {
            c.cpu = stats.cpu
            c.memory = stats.memory
          }
        })
      } catch {
        // Stats failed, continue without them
      }
    }

    res.json(containers)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' ||
        (error as Error).message?.includes('Cannot connect')) {
      res.json([])
    } else {
      res.status(500).json({ error: 'Failed to fetch containers' })
    }
  }
})

// POST /api/docker/containers/:id/start
dockerRouter.post('/containers/:id/start', async (req, res) => {
  try {
    await execAsync(`docker start ${req.params.id}`)
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to start container' })
  }
})

// POST /api/docker/containers/:id/stop
dockerRouter.post('/containers/:id/stop', async (req, res) => {
  try {
    await execAsync(`docker stop ${req.params.id}`)
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to stop container' })
  }
})

// POST /api/docker/containers/:id/restart
dockerRouter.post('/containers/:id/restart', async (req, res) => {
  try {
    await execAsync(`docker restart ${req.params.id}`)
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to restart container' })
  }
})

// GET /api/docker/containers/:id/logs
dockerRouter.get('/containers/:id/logs', async (req, res) => {
  try {
    const { stdout } = await execAsync(`docker logs --tail 100 ${req.params.id}`)
    res.json({ logs: stdout })
  } catch {
    res.status(500).json({ error: 'Failed to fetch logs' })
  }
})
