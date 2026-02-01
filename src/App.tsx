function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">localhost-ui</h1>
        <p className="text-gray-400 text-sm">Everything running on your machine</p>
      </header>

      <main className="grid grid-cols-2 gap-4">
        <section className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-blue-400">Docker Containers</h2>
          <p className="text-gray-500 text-sm">No containers</p>
        </section>

        <section className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-green-400">Listening Ports</h2>
          <p className="text-gray-500 text-sm">No ports</p>
        </section>

        <section className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-yellow-400">Processes</h2>
          <p className="text-gray-500 text-sm">No processes</p>
        </section>

        <section className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-purple-400">Git Repositories</h2>
          <p className="text-gray-500 text-sm">No repositories</p>
        </section>
      </main>
    </div>
  )
}

export default App
