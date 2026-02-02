import { DockerPanel } from './components/DockerPanel'
import { PortsPanel } from './components/PortsPanel'
import { ProcessesPanel } from './components/ProcessesPanel'
import { GitPanel } from './components/GitPanel'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">localhost-ui</h1>
        <p className="text-gray-400 text-sm">Everything running on your machine</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DockerPanel />
        <PortsPanel />
        <ProcessesPanel />
        <GitPanel />
      </main>
    </div>
  )
}

export default App
