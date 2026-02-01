# TODO

## Project Setup

- [x] Initialize React + TypeScript project
- [x] Configure Tailwind CSS
- [ ] Set up Node.js backend
- [x] Create project directory structure (`components/`, `hooks/`, `services/`, `types/`, `utils/`)
- [x] Configure npm scripts (`dev`, `build`, `test`)

## Services Layer

### Docker Service (`services/docker.ts`)

- [ ] Connect to Docker API
- [ ] Fetch all containers (running and stopped)
- [ ] Parse container data (name, image, status, ports, resource usage)
- [ ] Implement start container action
- [ ] Implement stop container action
- [ ] Implement restart container action
- [ ] Implement view logs action
- [ ] Implement open shell action
- [ ] Add real-time log streaming

### Ports Service (`services/ports.ts`)

- [ ] Create lsof wrapper for port scanning
- [ ] Parse port data (process name, PID, protocol, addresses)
- [ ] Map ports to owning projects/services
- [ ] Handle macOS-specific lsof output
- [ ] Handle Linux-specific lsof output

### Processes Service (`services/processes.ts`)

- [ ] List running processes
- [ ] Group processes by project directory
- [ ] Identify dev servers, watchers, build processes
- [ ] Fetch CPU usage per process
- [ ] Fetch memory usage per process
- [ ] Implement stop process action
- [ ] Implement view output action

### Git Service (`services/git.ts`)

- [ ] Scan common project directories for git repos
- [ ] Get current branch for each repo
- [ ] Detect uncommitted changes
- [ ] Detect unpushed commits
- [ ] Check if repo is behind remote
- [ ] Implement open in editor action
- [ ] Implement open terminal at path action

## Custom Hooks

- [ ] Create `useDocker` hook with 2s polling interval
- [ ] Create `usePorts` hook with 5s polling interval
- [ ] Create `useProcesses` hook with 3s polling interval
- [ ] Create `useGitRepos` hook with 30s polling interval
- [ ] Add configurable polling intervals
- [ ] Implement Docker events API as alternative to polling

## React Components

### Layout

- [x] Create main dashboard layout
- [ ] Ensure everything fits without scrolling on typical screen
- [x] Add responsive grid for feature panels

### Docker Panel

- [ ] Create container list component
- [ ] Display container name, image, status
- [ ] Display port mappings
- [ ] Display resource usage (CPU, memory)
- [ ] Add start/stop/restart buttons
- [ ] Add view logs button
- [ ] Add open shell button
- [ ] Create log viewer modal with streaming

### Ports Panel

- [ ] Create ports list component
- [ ] Display process name, PID, protocol
- [ ] Display local/remote addresses
- [ ] Show owning project/service
- [ ] Make HTTP ports clickable to open in browser

### Processes Panel

- [ ] Create process list grouped by project
- [ ] Display process type (dev server, watcher, build)
- [ ] Display CPU/memory usage
- [ ] Add stop process button
- [ ] Add view output button

### Git Panel

- [ ] Create git repo list component
- [ ] Display branch name
- [ ] Display uncommitted changes count
- [ ] Display unpushed commits count
- [ ] Add visual indicator for repos needing attention
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

- [ ] Define `Container` interface
- [ ] Define `Port` interface
- [ ] Define `Process` interface
- [ ] Define `GitRepo` interface
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
