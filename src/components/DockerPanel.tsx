import { useState } from 'react'
import { useDocker } from '../hooks/useDocker'
import type { PortMapping } from '../types'

export function DockerPanel() {
  const { containers, loading, startContainer, stopContainer, restartContainer, getLogs } = useDocker()
  const [logsModal, setLogsModal] = useState<{ name: string; logs: string } | null>(null)

  const handleLogs = async (id: string, name: string) => {
    const logs = await getLogs(id)
    setLogsModal({ name, logs })
  }

  if (loading) {
    return <PanelShell title="Docker Containers">Loading...</PanelShell>
  }

  if (containers.length === 0) {
    return <PanelShell title="Docker Containers">No containers</PanelShell>
  }

  return (
    <>
      <PanelShell title="Docker Containers">
        <ul className="space-y-2">
          {containers.map((c) => (
            <li key={c.id} className="text-sm py-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      c.state === 'running' ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  />
                  <span className="font-medium truncate">{c.name}</span>
                  <span className="text-gray-500 text-xs truncate">{c.image}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {c.state === 'running' ? (
                    <>
                      <button
                        onClick={() => stopContainer(c.id)}
                        className="px-2 py-0.5 text-xs bg-red-600 hover:bg-red-700 rounded"
                      >
                        Stop
                      </button>
                      <button
                        onClick={() => restartContainer(c.id)}
                        className="px-2 py-0.5 text-xs bg-yellow-600 hover:bg-yellow-700 rounded"
                      >
                        Restart
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startContainer(c.id)}
                      className="px-2 py-0.5 text-xs bg-green-600 hover:bg-green-700 rounded"
                    >
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => handleLogs(c.id, c.name)}
                    className="px-2 py-0.5 text-xs bg-gray-600 hover:bg-gray-500 rounded"
                  >
                    Logs
                  </button>
                </div>
              </div>

              {/* Second row: ports, cpu, memory */}
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                {Array.isArray(c.ports) && c.ports.length > 0 && (
                  <span>
                    {c.ports.map((p, i) => (
                      <span key={i}>
                        {i > 0 && ', '}
                        <PortLink port={p} />
                      </span>
                    ))}
                  </span>
                )}
                {c.cpu && <span>{c.cpu} CPU</span>}
                {c.memory && <span>{c.memory.split(' / ')[0]}</span>}
                {c.state !== 'running' && <span>{c.status}</span>}
              </div>
            </li>
          ))}
        </ul>
      </PanelShell>

      {/* Logs Modal */}
      {logsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="font-semibold text-blue-400">Logs: {logsModal.name}</h3>
              <button
                onClick={() => setLogsModal(null)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <pre className="p-4 overflow-auto flex-1 text-xs text-gray-300 font-mono whitespace-pre-wrap">
              {logsModal.logs}
            </pre>
          </div>
        </div>
      )}
    </>
  )
}

function PortLink({ port }: { port: PortMapping }) {
  if (port.host) {
    return (
      <a
        href={`http://localhost:${port.host}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:underline"
      >
        :{port.host}→{port.container}
      </a>
    )
  }
  return <span>:{port.container}</span>
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-gray-800 rounded-lg p-4 overflow-hidden">
      <h2 className="text-lg font-semibold mb-2 text-blue-400">{title}</h2>
      <div className="text-gray-300">{children}</div>
    </section>
  )
}
