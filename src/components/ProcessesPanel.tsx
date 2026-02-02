import { useProcesses } from '../hooks/useProcesses'

export function ProcessesPanel() {
  const { processes, loading, stopProcess } = useProcesses()

  if (loading) {
    return <PanelShell title="Dev Processes">Loading...</PanelShell>
  }

  if (processes.length === 0) {
    return <PanelShell title="Dev Processes">No dev processes running</PanelShell>
  }

  return (
    <PanelShell title="Dev Processes">
      <ul className="space-y-2">
        {processes.map((p) => (
          <li key={p.pid} className="text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium">{p.name}</span>
                <span className="text-gray-500 text-xs">PID {p.pid}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-500">
                  {p.cpu.toFixed(1)}% CPU
                </span>
                <button
                  onClick={() => stopProcess(p.pid)}
                  className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
                >
                  Kill
                </button>
              </div>
            </div>
            {p.cwd && (
              <div className="text-xs text-gray-600 truncate mt-1">
                {p.cwd}
              </div>
            )}
          </li>
        ))}
      </ul>
    </PanelShell>
  )
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-gray-800 rounded-lg p-4 overflow-hidden">
      <h2 className="text-lg font-semibold mb-3 text-yellow-400">{title}</h2>
      <div className="text-gray-300">{children}</div>
    </section>
  )
}
