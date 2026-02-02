import { useState, useEffect } from 'react'
import { usePorts } from '../hooks/usePorts'

const STORAGE_KEY = 'localhost-ui:hidden-ports'

// Default hidden processes (background apps, system services)
const DEFAULT_HIDDEN = [
  'Spotify',
  'Discord',
  'OneDrive',
  'rapportd',
  'dartaotru',
  'Code\\x20H',
  'Code Helper',
]

function getHiddenProcesses(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return new Set(JSON.parse(stored))
  } catch {
    // Invalid JSON, use defaults
  }
  return new Set(DEFAULT_HIDDEN)
}

function saveHiddenProcesses(hidden: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...hidden]))
}

export function PortsPanel() {
  const { data: ports, loading } = usePorts()
  const [hidden, setHidden] = useState<Set<string>>(getHiddenProcesses)
  const [showHidden, setShowHidden] = useState(false)

  useEffect(() => {
    saveHiddenProcesses(hidden)
  }, [hidden])

  const toggleHide = (process: string) => {
    setHidden(prev => {
      const next = new Set(prev)
      if (next.has(process)) {
        next.delete(process)
      } else {
        next.add(process)
      }
      return next
    })
  }

  if (loading) {
    return <PanelShell title="Listening Ports" extra={null}>Loading...</PanelShell>
  }

  if (ports.length === 0) {
    return <PanelShell title="Listening Ports" extra={null}>No ports listening</PanelShell>
  }

  const visible = ports.filter(p => !hidden.has(p.process))
  const hiddenPorts = ports.filter(p => hidden.has(p.process))

  return (
    <PanelShell
      title="Listening Ports"
      extra={
        hiddenPorts.length > 0 && (
          <button
            onClick={() => setShowHidden(!showHidden)}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            {showHidden ? 'hide' : `+${hiddenPorts.length} hidden`}
          </button>
        )
      }
    >
      <ul className="space-y-1">
        {visible.map((p) => (
          <PortRow key={`${p.port}-${p.pid}`} port={p} onHide={() => toggleHide(p.process)} />
        ))}
        {showHidden && hiddenPorts.map((p) => (
          <PortRow
            key={`${p.port}-${p.pid}`}
            port={p}
            dimmed
            onHide={() => toggleHide(p.process)}
          />
        ))}
      </ul>
    </PanelShell>
  )
}

function PortRow({
  port: p,
  dimmed = false,
  onHide
}: {
  port: { port: number; localAddress: string; process: string; cwd: string | null; startTime: string | null; pid: number }
  dimmed?: boolean
  onHide: () => void
}) {
  return (
    <li className={`flex items-center justify-between text-sm py-0.5 group ${dimmed ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2 min-w-0">
        <PortLink port={p.port} address={p.localAddress} />
        <span className="text-gray-400 truncate">
          {p.process}
          {p.cwd && <span className="text-gray-600"> · {formatPath(p.cwd)}</span>}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onHide}
          className="text-xs text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100"
          title={dimmed ? 'Show' : 'Hide'}
        >
          {dimmed ? 'show' : 'hide'}
        </button>
        {p.startTime && (
          <span className="text-gray-600 text-xs w-6 text-right">
            {formatUptime(p.startTime)}
          </span>
        )}
      </div>
    </li>
  )
}

function PortLink({ port, address }: { port: number; address: string }) {
  const isLocalhost = address === '0.0.0.0' || address === '127.0.0.1' || address === '[::1]'
  const isHttpPort = port >= 3000 && port <= 9999

  if (isLocalhost && isHttpPort) {
    return (
      <a
        href={`http://localhost:${port}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-green-400 hover:underline w-12"
      >
        :{port}
      </a>
    )
  }

  return <span className="font-mono text-green-400 w-12">:{port}</span>
}

function formatPath(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 1] || path
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

function PanelShell({ title, extra, children }: { title: string; extra: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-green-400">{title}</h2>
        {extra}
      </div>
      <div className="text-gray-300">{children}</div>
    </section>
  )
}
