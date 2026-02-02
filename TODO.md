# TODO

## Project Setup

- [x] Initialize React + TypeScript project
- [x] Configure Tailwind CSS
- [x] Set up Node.js backend
- [x] Create project directory structure (`components/`, `hooks/`, `services/`, `types/`, `utils/`)
- [x] Configure npm scripts (`dev`, `build`, `test`)

## Services Layer

### Docker Service (`server/routes/docker.ts`)

- [x] Connect to Docker API (via CLI)
- [x] Fetch all containers (running and stopped)
- [x] Parse container data (name, image, status, ports, resource usage)
- [x] Implement start container action
- [x] Implement stop container action
- [x] Implement restart container action
- [x] Implement view logs action
- [ ] Implement open shell action
- [ ] Add real-time log streaming

### Ports Service (`server/routes/ports.ts`)

- [x] Create lsof wrapper for port scanning
- [x] Parse port data (process name, PID, protocol, addresses)
- [ ] Map ports to owning projects/services
- [x] Handle macOS-specific lsof output
- [ ] Handle Linux-specific lsof output

### Processes Service (`server/routes/processes.ts`)

- [x] List running processes
- [x] Group processes by project directory
- [x] Identify dev servers, watchers, build processes
- [x] Fetch CPU usage per process
- [x] Fetch memory usage per process
- [x] Implement stop process action
- [ ] Implement view output action

### Git Service (`server/routes/git.ts`)

- [x] Scan common project directories for git repos
- [x] Get current branch for each repo
- [x] Detect uncommitted changes
- [x] Detect unpushed commits
- [x] Check if repo is behind remote
- [ ] Implement open in editor action
- [ ] Implement open terminal at path action

## Custom Hooks

- [x] Create `useDocker` hook with 2s polling interval
- [x] Create `usePorts` hook with 5s polling interval
- [x] Create `useProcesses` hook with 3s polling interval
- [x] Create `useGitRepos` hook with 30s polling interval
- [ ] Add configurable polling intervals
- [ ] Implement Docker events API as alternative to polling

## React Components

### Layout

- [x] Create main dashboard layout
- [ ] Ensure everything fits without scrolling on typical screen
- [x] Add responsive grid for feature panels

### Docker Panel

- [x] Create container list component
- [x] Display container name, image, status
- [ ] Display port mappings
- [ ] Display resource usage (CPU, memory)
- [x] Add start/stop/restart buttons
- [ ] Add view logs button
- [ ] Add open shell button
- [ ] Create log viewer modal with streaming

### Ports Panel

- [x] Create ports list component
- [x] Display process name, PID, protocol
- [x] Display local/remote addresses
- [ ] Show owning project/service
- [x] Make HTTP ports clickable to open in browser

### Processes Panel

- [x] Create process list grouped by project
- [ ] Display process type (dev server, watcher, build)
- [x] Display CPU/memory usage
- [x] Add stop process button
- [ ] Add view output button

### Git Panel

- [x] Create git repo list component
- [x] Display branch name
- [x] Display uncommitted changes count
- [x] Display unpushed commits count
- [x] Add visual indicator for repos needing attention
- [ ] Add open in editor button
- [ ] Add open terminal button

## UX Features

### Keyboard Navigation

- [ ] Implement keyboard navigation between panels
- [ ] Add keyboard shortcuts for common actions
- [ ] Support tab navigation within panels
- [ ] Add shortcut hints in UI

### Confirmations

- [ ] Add confirmation dialog component
- [ ] Require confirmation for stop container
- [ ] Require confirmation for kill process
- [ ] Require confirmation for other destructive actions

## TypeScript Types

- [x] Define `Container` interface
- [x] Define `Port` interface
- [x] Define `Process` interface
- [x] Define `GitRepo` interface
- [ ] Define action response types

## Security

- [ ] Ensure no network exposure (localhost only)
- [ ] Implement optional sudo prompt for root operations
- [ ] Validate all user inputs before system calls

## Testing

- [x] Set up test framework
- [ ] Write tests for Docker service
- [ ] Write tests for Ports service
- [ ] Write tests for Processes service
- [ ] Write tests for Git service
- [ ] Write component tests

## Platform Support

- [ ] Test and fix macOS-specific code paths
- [ ] Test and fix Linux-specific code paths
- [ ] Add platform detection utility
