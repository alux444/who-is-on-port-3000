# localhost-ui

A dashboard showing everything running on your local machine.

## Quick Start

```bash
# Install dependencies
npm install

# Run web UI (frontend + backend)
npm run dev

# Open http://localhost:5173
```

## CLI

```bash
# Run the terminal UI (requires server running)
npm run dev:server  # in one terminal
npm run cli         # in another terminal
```

**CLI Controls:**
- `←` `→` - Switch panels
- `↑` `↓` - Select item
- `Enter` - Action (start/stop, open in browser, kill, open terminal)
- `q` - Quit

## What it Shows

| Panel | Info | Actions |
|-------|------|---------|
| **Docker** | Containers, ports, CPU, memory | Start, Stop |
| **Ports** | Listening ports, process, project | Open in browser |
| **Processes** | Dev processes, CPU usage | Kill |
| **Git** | Repos, branch, dirty/unpushed status | Open terminal |

## Configuration

Edit `server/config.ts` to customize:

```ts
// Directories to scan for git repos
export const GIT_SCAN_DIRS = [
  join(homedir(), 'Developer'),
  join(homedir(), 'Projects'),
]

// Process patterns to show in Dev Processes
export const DEV_PROCESS_PATTERNS = [
  'node', 'npm', 'vite', 'python', ...
]
```

## Commands

```bash
npm run dev          # Start frontend + backend
npm run dev:client   # Frontend only (port 5173)
npm run dev:server   # Backend only (port 3001)
npm run cli          # Terminal UI
npm run build        # Production build
npm test             # Run tests
```

## Project Structure

```
src/                 # React frontend
  components/        # UI panels
  hooks/             # Data fetching with polling
  types/             # TypeScript interfaces

server/              # Express backend
  routes/            # API endpoints
  config.ts          # Configuration

cli/                 # Terminal UI
  index.ts           # TUI with keyboard nav
```

## Tech Stack

- React + TypeScript + Tailwind
- Express backend
- System calls via `docker`, `lsof`, `ps`, `git`
