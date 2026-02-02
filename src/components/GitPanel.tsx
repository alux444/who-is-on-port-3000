import { useGitRepos } from '../hooks/useGitRepos'

export function GitPanel() {
  const { data: repos, loading } = useGitRepos()

  if (loading) {
    return <PanelShell title="Git Repositories">Loading...</PanelShell>
  }

  if (repos.length === 0) {
    return <PanelShell title="Git Repositories">No repositories found</PanelShell>
  }

  return (
    <PanelShell title="Git Repositories">
      <ul className="space-y-2">
        {repos.map((repo) => (
          <li key={repo.path} className="text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{repo.name}</span>
                <span className="text-purple-400 text-xs">{repo.branch}</span>
              </div>
              <div className="flex items-center gap-2">
                {repo.dirty && (
                  <span className="text-xs text-yellow-500">
                    {repo.uncommittedCount} changes
                  </span>
                )}
                {repo.unpushedCount > 0 && (
                  <span className="text-xs text-blue-400">
                    {repo.unpushedCount} unpushed
                  </span>
                )}
                {repo.behindCount > 0 && (
                  <span className="text-xs text-red-400">
                    {repo.behindCount} behind
                  </span>
                )}
                {!repo.dirty && repo.unpushedCount === 0 && repo.behindCount === 0 && (
                  <span className="text-xs text-green-500">clean</span>
                )}
              </div>
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
      <h2 className="text-lg font-semibold mb-3 text-purple-400">{title}</h2>
      <div className="text-gray-300">{children}</div>
    </section>
  )
}
