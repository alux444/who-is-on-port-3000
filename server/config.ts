import { homedir } from 'os'
import { join } from 'path'

// =============================================================================
// CONFIGURATION
// Edit these values to customize what localhost-ui scans and displays
// =============================================================================

// -----------------------------------------------------------------------------
// Git Repository Scanning
// -----------------------------------------------------------------------------

// Directories to scan for git repositories
// Add your own project folders here
export const GIT_SCAN_DIRS = [
  join(homedir(), 'Developer'),
  join(homedir(), 'Projects'),
]

// How deep to search for .git folders (higher = slower but finds nested repos)
export const GIT_MAX_DEPTH = 3

// Maximum number of repos to return (prevents slowdown with too many repos)
export const GIT_MAX_REPOS = 50

// -----------------------------------------------------------------------------
// Process Filtering
// -----------------------------------------------------------------------------

// Only show processes matching these patterns
// Add patterns for languages/tools you use
export const DEV_PROCESS_PATTERNS = [
  // JavaScript/TypeScript
  'node',
  'npm',
  'yarn',
  'pnpm',
  'vite',
  'webpack',
  'esbuild',
  'tsc',
  'next',
  'remix',

  // Python
  'python',
  'python3',
  'pip',
  'uvicorn',
  'gunicorn',
  'flask',
  'django',

  // Ruby
  'ruby',
  'rails',
  'bundle',
  'puma',

  // Rust
  'cargo',
  'rustc',

  // Go
  'go run',
  'go build',

  // Java/JVM
  'java',
  'gradle',
  'mvn',

  // PHP
  'php',
  'composer',
  'artisan',

  // Other
  'docker',
  'kubectl',
]

// -----------------------------------------------------------------------------
// Server Settings
// -----------------------------------------------------------------------------

// Port the backend API runs on
export const SERVER_PORT = process.env.PORT || 3001

// Frontend URL (for CORS)
export const FRONTEND_URL = 'http://localhost:5173'
