import readline from 'readline'

const API = 'http://localhost:3001/api'

// ANSI escape codes
const ESC = '\x1b'
const CLEAR = `${ESC}[2J${ESC}[H`
const HIDE_CURSOR = `${ESC}[?25l`
const SHOW_CURSOR = `${ESC}[?25h`
const BOLD = `${ESC}[1m`
const RESET = `${ESC}[0m`
const GREEN = `${ESC}[32m`
const YELLOW = `${ESC}[33m`
const BLUE = `${ESC}[34m`
const MAGENTA = `${ESC}[35m`
const CYAN = `${ESC}[36m`
const GRAY = `${ESC}[90m`
const RED = `${ESC}[31m`

type Panel = 'docker' | 'ports' | 'processes' | 'git'
const PANELS: Panel[] = ['docker', 'ports', 'processes', 'git']

interface PortMapping {
  host: number | null
  container: number
  protocol: string
}

interface Container {
  id: string
  name: string
  image: string
  state: string
  status: string
  ports: PortMapping[]
  cpu: string | null
  memory: string | null
}

interface Port {
  port: number
  process: string
  cwd: string | null
  startTime: string | null
  localAddress: string
}

interface Process {
  pid: number
  name: string
  cpu: number
}

interface GitRepo {
  name: string
  path: string
  branch: string
  dirty: boolean
  uncommittedCount: number
  unpushedCount: number
  behindCount: number
}

interface State {
  panel: number
  index: number
  docker: Container[]
  ports: Port[]
  processes: Process[]
  git: GitRepo[]
  actionMenu: { type: 'docker'; id: string; name: string } | null
}

const state: State = {
  panel: 1, // Start on ports
  index: 0,
  docker: [],
  ports: [],
  processes: [],
  git: [],
  actionMenu: null,
}

// Fetch data from API
async function fetchData() {
  try {
    const [docker, ports, processes, git] = await Promise.all([
      fetch(`${API}/docker/containers`).then(r => r.json()).catch(() => []),
      fetch(`${API}/ports`).then(r => r.json()).catch(() => []),
      fetch(`${API}/processes`).then(r => r.json()).catch(() => []),
      fetch(`${API}/git/repos`).then(r => r.json()).catch(() => []),
    ])
    state.docker = docker
    state.ports = ports
    state.processes = processes
    state.git = git
  } catch {
    // Server not running, keep existing state
  }
}

function getCurrentListLength(): number {
  const panel = PANELS[state.panel]
  return state[panel].length
}

function formatUptime(startTime: string): string {
  try {
    const start = new Date(startTime)
    const diffMs = Date.now() - start.getTime()
    const mins = Math.floor(diffMs / 60000)
    const hrs = Math.floor(mins / 60)
    const days = Math.floor(hrs / 24)
    if (days > 0) return `${days}d`
    if (hrs > 0) return `${hrs}h`
    if (mins > 0) return `${mins}m`
    return 'now'
  } catch {
    return ''
  }
}

function render() {
  let output = CLEAR

  // Header
  output += `${BOLD}localhost-ui${RESET} ${GRAY}← → panels  ↑ ↓ select  enter action  q quit${RESET}\n\n`

  // Panel tabs
  const tabs = [
    { name: 'Docker', color: BLUE, count: state.docker.length },
    { name: 'Ports', color: GREEN, count: state.ports.length },
    { name: 'Processes', color: YELLOW, count: state.processes.length },
    { name: 'Git', color: MAGENTA, count: state.git.length },
  ]

  output += tabs.map((t, i) => {
    const selected = i === state.panel
    const style = selected ? `${t.color}${BOLD}` : GRAY
    return `${style}${t.name}${RESET}${GRAY}(${t.count})${RESET}`
  }).join('  ') + '\n\n'

  // Current panel content
  const panel = PANELS[state.panel]

  const renderRow = (i: number, selected: boolean) => {
    const cursor = selected ? `${CYAN}▶${RESET} ` : '  '
    const style = selected ? BOLD : ''

    if (panel === 'docker') {
      const item = state.docker[i]
      const icon = item.state === 'running' ? `${GREEN}●${RESET}` : `${GRAY}○${RESET}`
      const ports = Array.isArray(item.ports) && item.ports.length > 0
        ? item.ports.map(p => p.host ? `${CYAN}:${p.host}${RESET}` : `:${p.container}`).join(' ')
        : ''
      const stats = item.cpu ? `${item.cpu}` : ''
      const mem = item.memory ? item.memory.split(' / ')[0] : ''
      const image = item.image.split(':')[0].split('/').pop() // Short image name

      let details = ''
      if (item.state === 'running') {
        const parts = [ports, stats, mem].filter(Boolean)
        details = parts.length > 0 ? ` ${GRAY}${parts.join(' · ')}${RESET}` : ''
      } else {
        details = ` ${GRAY}${item.status}${RESET}`
      }

      return `${cursor}${style}${icon} ${item.name} ${GRAY}${image}${RESET}${details}\n`
    } else if (panel === 'ports') {
      const item = state.ports[i]
      const port = `${GREEN}:${item.port}${RESET}`
      const proc = item.process
      const dir = item.cwd ? item.cwd.split('/').pop() : ''
      const time = item.startTime ? formatUptime(item.startTime) : ''
      return `${cursor}${style}${port} ${proc}${RESET}${dir ? ` ${GRAY}· ${dir}${RESET}` : ''}${time ? ` ${GRAY}${time}${RESET}` : ''}\n`
    } else if (panel === 'processes') {
      const item = state.processes[i]
      const cpu = `${item.cpu.toFixed(1)}%`
      return `${cursor}${style}${item.name}${RESET} ${GRAY}PID ${item.pid} · ${cpu}${RESET}\n`
    } else {
      const item = state.git[i]
      const branch = `${MAGENTA}${item.branch}${RESET}`
      let gitStatus = ''
      if (item.dirty) gitStatus += `${YELLOW}${item.uncommittedCount} changes${RESET} `
      if (item.unpushedCount > 0) gitStatus += `${BLUE}${item.unpushedCount} unpushed${RESET} `
      if (item.behindCount > 0) gitStatus += `${RED}${item.behindCount} behind${RESET} `
      if (!gitStatus) gitStatus = `${GREEN}clean${RESET}`
      return `${cursor}${style}${item.name}${RESET} ${branch} ${gitStatus}\n`
    }
  }

  const listLength = getCurrentListLength()
  if (listLength === 0) {
    output += `${GRAY}No items${RESET}\n`
  } else {
    for (let i = 0; i < Math.min(15, listLength); i++) {
      output += renderRow(i, i === state.index)
    }
  }

  // Action menu overlay
  if (state.actionMenu) {
    const container = state.docker.find(c => c.id === state.actionMenu!.id)
    const isRunning = container?.state === 'running'
    const hasPort = Array.isArray(container?.ports) && container.ports.some(p => p.host)
    output += `\n${BOLD}Actions for ${state.actionMenu.name}:${RESET}\n`
    if (isRunning) {
      output += `  ${RED}[s]${RESET} stop  ${YELLOW}[r]${RESET} restart  ${CYAN}[l]${RESET} logs`
      if (hasPort) output += `  ${BLUE}[o]${RESET} open`
      output += `  ${GRAY}[esc]${RESET} cancel\n`
    } else {
      output += `  ${GREEN}[s]${RESET} start  ${CYAN}[l]${RESET} logs  ${GRAY}[esc]${RESET} cancel\n`
    }
  } else {
    // Actions hint
    output += `\n${GRAY}`
    if (panel === 'docker' && state.docker[state.index]) {
      output += 'enter: actions'
    } else if (panel === 'ports' && state.ports[state.index]) {
      output += 'enter: open in browser'
    } else if (panel === 'processes' && state.processes[state.index]) {
      output += 'enter: kill process'
    } else if (panel === 'git' && state.git[state.index]) {
      output += 'enter: open in terminal'
    }
    output += RESET
  }

  process.stdout.write(output)
}

async function handleDockerAction(action: string) {
  if (!state.actionMenu) return
  const { id } = state.actionMenu

  if (action === 'logs') {
    // Fetch and display logs
    try {
      const res = await fetch(`${API}/docker/containers/${id}/logs`)
      const data = await res.json()
      process.stdout.write(CLEAR + SHOW_CURSOR)
      console.log(`${BOLD}Container Logs${RESET} (press any key to return)\n`)
      console.log(data.logs || 'No logs available')
      await new Promise<void>(resolve => {
        process.stdin.once('keypress', () => resolve())
      })
      process.stdout.write(HIDE_CURSOR)
    } catch {
      // ignore
    }
  } else {
    await fetch(`${API}/docker/containers/${id}/${action}`, { method: 'POST' })
  }

  state.actionMenu = null
  await fetchData()
  render()
}

async function handleAction() {
  const panel = PANELS[state.panel]

  if (panel === 'docker') {
    const item = state.docker[state.index]
    if (!item) return
    // Open the action menu
    state.actionMenu = { type: 'docker', id: item.id, name: item.name }
    render()
    return
  } else if (panel === 'ports') {
    const item = state.ports[state.index]
    if (!item) return
    const { spawn } = await import('child_process')
    spawn('open', [`http://localhost:${item.port}`], { detached: true })
  } else if (panel === 'processes') {
    const item = state.processes[state.index]
    if (!item) return
    await fetch(`${API}/processes/${item.pid}/stop`, { method: 'POST' })
  } else if (panel === 'git') {
    const item = state.git[state.index]
    if (!item) return
    const { spawn } = await import('child_process')
    spawn('open', ['-a', 'Terminal', item.path], { detached: true })
  }

  await fetchData()
  render()
}

async function main() {
  // Setup terminal
  process.stdout.write(HIDE_CURSOR)
  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY) process.stdin.setRawMode(true)

  // Initial fetch
  await fetchData()
  render()

  // Refresh data periodically
  const interval = setInterval(async () => {
    await fetchData()
    render()
  }, 3000)

  // Handle keyboard input
  process.stdin.on('keypress', async (str, key) => {
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      process.stdout.write(SHOW_CURSOR + CLEAR)
      clearInterval(interval)
      process.exit(0)
    }

    // Handle action menu
    if (state.actionMenu) {
      if (key.name === 'escape') {
        state.actionMenu = null
      } else if (str === 's') {
        const container = state.docker.find(c => c.id === state.actionMenu!.id)
        const action = container?.state === 'running' ? 'stop' : 'start'
        await handleDockerAction(action)
        return
      } else if (str === 'r') {
        const container = state.docker.find(c => c.id === state.actionMenu!.id)
        if (container?.state === 'running') {
          await handleDockerAction('restart')
          return
        }
      } else if (str === 'l') {
        await handleDockerAction('logs')
        return
      } else if (str === 'o') {
        const container = state.docker.find(c => c.id === state.actionMenu!.id)
        if (container?.state === 'running' && Array.isArray(container.ports)) {
          const portWithHost = container.ports.find(p => p.host)
          if (portWithHost) {
            const { spawn } = await import('child_process')
            spawn('open', [`http://localhost:${portWithHost.host}`], { detached: true })
            state.actionMenu = null
          }
        }
      }
      render()
      return
    }

    const len = getCurrentListLength()

    if (key.name === 'left') {
      state.panel = (state.panel - 1 + PANELS.length) % PANELS.length
      state.index = 0
    } else if (key.name === 'right') {
      state.panel = (state.panel + 1) % PANELS.length
      state.index = 0
    } else if (key.name === 'up' && len > 0) {
      state.index = (state.index - 1 + len) % len
    } else if (key.name === 'down' && len > 0) {
      state.index = (state.index + 1) % len
    } else if (key.name === 'return') {
      await handleAction()
    }

    render()
  })
}

main().catch(console.error)
