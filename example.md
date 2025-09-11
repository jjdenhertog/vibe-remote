# Example

This is an example markdown file for the Vibe Remote Workstation project.

## Overview

This project is a vibe coding workstation deployed as a Docker container. It provides a remote development environment with task management capabilities through Claude MCP.

## Key Features

- **Remote Development**: Access your development environment from anywhere
- **Task Management**: Load and generate tasks using Claude MCP via SSH
- **Web Interface**: Test the web environment using `pnpm run dev:web`
- **Docker Deployment**: Full functionality requires running as a Docker container

## Project Structure

```
vibe-remote-workstation/
├── apps/                    # Application-level code
│   └── web/                # Next.js frontend application  
├── packages/               # Shared libraries and utilities
│   ├── claude-wrapper/     # TypeScript CLI tool
│   ├── shared-types/       # Common TypeScript types
│   └── shared-utils/       # Utility functions
└── config/                 # TypeScript configurations
```

## Development Commands

### Type Checking
```bash
pnpm run -r type-check
```

### Linting
```bash
pnpm run -r lint
```

### Build
```bash
pnpm run build:clean
pnpm run build:packages
```

## Coding Standards

The project follows strict coding guidelines:

- **No barrel exports**: Each import must use full paths
- **One function per file**: Every utility function gets its own file
- **Required patterns**:
  - `useCallback` for all event handlers
  - `!!` for conditional rendering
  - `errorBoundary` for all async operations in React
  - `type` over `interface` for TypeScript definitions

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run development server:
   ```bash
   pnpm run dev:web
   ```

3. Build the project:
   ```bash
   pnpm run build:clean
   pnpm run build:packages
   ```

## Testing

Note: This project does not use a test framework like Jest or Vitest. Testing is done through Docker container deployment.

## Docker Deployment

The application needs to run as a Docker container for full functionality. The web environment alone can be tested locally, but complete testing requires Docker deployment.

## Contributing

When contributing to this project, ensure you:

1. Follow the coding standards
2. Run type checking and linting before committing
3. Use full path imports (no barrel exports)
4. Implement proper error handling with `errorBoundary`
5. Follow the one-function-per-file rule for utilities

## License

[License information here]