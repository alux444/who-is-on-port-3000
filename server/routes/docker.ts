import { Router } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'

// Convert callback-based exec to Promise-based so we can use async/await
const execAsync = promisify(exec)

export const dockerRouter = Router()

interface Container {
  id: string
  name: string
  image: string
  status: string
  state: string
  ports: string
  created: string
}

// GET /api/docker/containers
// Lists all Docker containers (running + stopped)
dockerRouter.get('/containers', async (_req, res) => {
  try {
    // Run `docker ps -a` with a custom format
    // The --format flag uses Go templates to output exactly the fields we want
    // We use | as delimiter so we can easily split the output
    // Fields: ID | Name | Image | Status (e.g. "Up 2 hours") | State (running/exited) | Ports | CreatedAt
    const { stdout } = await execAsync(
      'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.State}}|{{.Ports}}|{{.CreatedAt}}"'
    )

    // Parse each line of output into a Container object
    // Example line: "abc123|my-container|nginx:latest|Up 2 hours|running|0.0.0.0:80->80/tcp|2024-01-15"
    const containers: Container[] = stdout
      .trim()
      .split('\n')
      .filter(line => line) // Remove empty lines
      .map(line => {
        const [id, name, image, status, state, ports, created] = line.split('|')
        return { id, name, image, status, state, ports, created }
      })

    res.json(containers)
  } catch (error) {
    // ENOENT = docker command not found
    // "Cannot connect" = Docker daemon not running
    // In both cases, just return empty array (Docker isn't available)
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' ||
        (error as Error).message?.includes('Cannot connect')) {
      res.json([])
    } else {
      res.status(500).json({ error: 'Failed to fetch containers' })
    }
  }
})

// POST /api/docker/containers/:id/start
// Starts a stopped container
dockerRouter.post('/containers/:id/start', async (req, res) => {
  try {
    // req.params.id is the container ID or name from the URL
    await execAsync(`docker start ${req.params.id}`)
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to start container' })
  }
})

// POST /api/docker/containers/:id/stop
// Stops a running container (sends SIGTERM, then SIGKILL after timeout)
dockerRouter.post('/containers/:id/stop', async (req, res) => {
  try {
    await execAsync(`docker stop ${req.params.id}`)
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to stop container' })
  }
})

// POST /api/docker/containers/:id/restart
// Restarts a container (stop + start)
dockerRouter.post('/containers/:id/restart', async (req, res) => {
  try {
    await execAsync(`docker restart ${req.params.id}`)
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to restart container' })
  }
})

// GET /api/docker/containers/:id/logs
// Gets the last 100 lines of logs from a container
dockerRouter.get('/containers/:id/logs', async (req, res) => {
  try {
    // --tail 100 limits output to last 100 lines (otherwise could be huge)
    const { stdout } = await execAsync(`docker logs --tail 100 ${req.params.id}`)
    res.json({ logs: stdout })
  } catch {
    res.status(500).json({ error: 'Failed to fetch logs' })
  }
})
