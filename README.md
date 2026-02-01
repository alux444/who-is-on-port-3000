# localhost-ui

A single-page dashboard showing everything running on your local machine.

## Overview

localhost-ui replaces the constant need to run `docker ps`, `lsof -i`, `ps aux`, and `git status` across projects. One glance shows what's running, what's listening, and what needs attention.

## Core Features

### Docker Containers

- List all containers (running and stopped)
- Show container name, image, status, ports, resource usage
- Actions: start, stop, restart, view logs, open shell
- Real-time log streaming

### Listening Ports

- Show all ports with active listeners
- Display process name, PID, protocol, local/remote address
- Identify which project/service owns each port
- Click port to open in browser (for HTTP services)

### Running Processes by Project

- Group processes by project directory
- Show dev servers, watchers, build processes
- Display CPU/memory usage per process
- Actions: stop process, view output

### Git Repository Status

- Scan common project directories for git repos
- Show branch, uncommitted changes, unpushed commits
- Indicate repos that need attention (dirty, behind remote)
- Quick actions: open in editor, open terminal at path

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Node.js with native bindings for system calls
- **Data**: Real-time polling with configurable intervals
- **Platform**: macOS primary, Linux secondary

## Project Structure

```
src/
  components/     # React components
  hooks/          # Custom hooks for data fetching
  services/       # System interaction layer
    docker.ts     # Docker API integration
    ports.ts      # Port scanning (lsof wrapper)
    processes.ts  # Process listing and management
    git.ts        # Git status checks
  types/          # TypeScript interfaces
  utils/          # Helpers
```

## Key Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm test         # Run tests
```

## Design Principles

1. **Instant overview** - Everything visible without scrolling on a typical screen
2. **Zero config** - Works out of the box, discovers projects automatically
3. **Non-destructive** - Dangerous actions (stop, kill) require confirmation
4. **Low overhead** - Minimal resource usage, smart polling intervals
5. **Keyboard-first** - Navigate and act without mouse

## Data Refresh Strategy

- Docker: Poll every 2s (or use Docker events API)
- Ports: Poll every 5s
- Processes: Poll every 3s
- Git: Poll every 30s (expensive operation)

## Security Considerations

- Runs locally only, no network exposure
- No elevated privileges required for basic features
- Optional sudo prompt for operations requiring root
