import { useDocker } from '../hooks/useDocker'

export function DockerPanel() {
  const { containers, loading, startContainer, stopContainer } = useDocker()

  if (loading) {
    return <PanelShell title="Docker Containers">Loading...</PanelShell>
  }

  if (containers.length === 0) {
    return <PanelShell title="Docker Containers">No containers</PanelShell>
  }

  return (
    <PanelShell title="Docker Containers">
      <ul className="space-y-2">
        {containers.map((c) => (
          <li key={c.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  c.state === 'running' ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
              <span className="font-medium truncate">{c.name}</span>
              <span className="text-gray-500 truncate hidden sm:inline">
                {c.image}
              </span>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {c.state === 'running' ? (
                <button
                  onClick={() => stopContainer(c.id)}
                  className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
                >
                  Stop
                </button>
              ) : (
                <button
                  onClick={() => startContainer(c.id)}
                  className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
                >
                  Start
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </PanelShell>
  )
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-gray-800 rounded-lg p-4 overflow-hidden">
      <h2 className="text-lg font-semibold mb-3 text-blue-400">{title}</h2>
      <div className="text-gray-300">{children}</div>
    </section>
  )
}
