// Docker container from /api/docker/containers
export interface PortMapping {
  host: number | null
  container: number
  protocol: string
}

export interface Container {
  id: string
  name: string
  image: string
  status: string         // e.g., "Up 2 hours", "Exited (0) 3 days ago"
  state: string          // "running" | "exited" | "paused" etc.
  ports: PortMapping[]
  created: string
  cpu: string | null     // e.g., "0.5%"
  memory: string | null  // e.g., "50MiB / 512MiB"
}

// Listening port from /api/ports
export interface Port {
  protocol: string
  localAddress: string
  port: number
  pid: number
  process: string
  command: string | null   // Full command line
  cwd: string | null       // Working directory (project path)
  user: string | null      // User running the process
  startTime: string | null // When the process started
}

// Dev process from /api/processes
export interface Process {
  pid: number
  name: string
  cpu: number    // percentage
  memory: number // percentage
  command: string
  cwd: string | null
}

// Git repository from /api/git/repos
export interface GitRepo {
  path: string
  name: string
  branch: string
  dirty: boolean
  uncommittedCount: number
  unpushedCount: number
  behindCount: number
}
