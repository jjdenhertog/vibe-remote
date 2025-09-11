# Example Documentation

This example demonstrates the Vibe Remote Workstation - an autonomous AI-driven development environment that transforms manual coding workflows into preference-guided automation.

## Project Overview

The Vibe Remote Workstation is a sophisticated Docker-based development environment that combines:
- **Preference-driven AI development** where documented standards guide all AI decisions
- **Claude MCP server integration** for direct task management via SSH
- **Automated PR workflows** that handle code review and submission
- **Persistent configuration** across container restarts

## Key Features

- **Preference System** - Human-defined coding standards stored in `/workspace/data/preferences/`
- **Autonomous Workflows** - AI agents handle task execution based on documented preferences
- **Claude MCP Integration** - Direct SSH access at port 2222 for Claude to manage tasks
- **Web Configuration UI** - Monaco editor interface at port 3000 for preference management
- **Vibe Kanban API** - Task management system at port 9091 with full CRUD operations
- **Automated PR Creation** - `vibe-kanban-cleanup` triggers automatic pull request generation

## Architecture

The project follows a strict monorepo structure using pnpm workspaces with TypeScript project references:

```
vibe-remote-workstation/
├── apps/
│   └── web/                      # Next.js 14 frontend with App Router
├── packages/
│   ├── claude-wrapper/           # CLI tool for AI prompt management
│   ├── vibe-kanban-api/         # API client for task management
│   ├── vibe-kanban-cleanup/     # Automated PR creation tool
│   ├── vibe-kanban-taskpicker/  # Task selection interface
│   ├── shared-types/            # Common TypeScript type definitions
│   └── shared-utils/            # Shared utility functions
├── docs/
│   ├── goal/                    # Project vision and planning
│   └── rules/                   # Coding standards and guidelines
└── config/                      # Shared TypeScript configurations
```

## Development Workflow

1. **Start the web environment:**
   ```bash
   pnpm run dev:web
   ```

2. **Type checking:**
   ```bash
   pnpm run -r type-check
   ```

3. **Linting:**
   ```bash
   pnpm run -r lint
   ```

4. **Build packages:**
   ```bash
   pnpm run build:clean
   pnpm run build:packages
   ```

## Coding Standards

The project enforces **STRICT** coding standards documented in `docs/rules/CODING_GUIDELINES.md`:

### Critical Rules
- **NO barrel exports (index.ts)** - Every import must use full path to specific file
- **One export per file** - Each file exports exactly ONE function OR ONE type
- **No 'src' in import paths** - Import from package root, not src directory
- **useCallback for ALL event handlers** - No inline functions in React components
- **Explicit boolean coercion** - Always use `!!` for conditional rendering
- **async/await with errorBoundary** - Centralized error handling, no try-catch blocks

### Import Pattern
```typescript
// ✅ CORRECT - Full path without 'src'
import { createConnection } from '@vibe-remote/shared-utils/connection/createConnection';

// ❌ WRONG - Barrel import or 'src' in path
import { createConnection } from '@vibe-remote/shared-utils';
import { createConnection } from '@vibe-remote/shared-utils/src/connection';
```

## Quality Assurance

The project uses automated checks to maintain code quality:

- **Type Checking**: `pnpm run type-check` - TypeScript strict mode validation
- **Linting**: `pnpm run lint` - ESLint with custom rules for barrel exports
- **Build Verification**: `pnpm run build:packages` - Ensures all packages compile
- **Pre-commit Validation**: Always run type-check and lint before committing

## Deployment

The workstation runs as a multi-architecture Docker container supporting both AMD64 and ARM64:

### Docker Commands
```bash
# Build and push multi-platform image
pnpm run docker:push

# Run locally with exposed ports
docker run -d \
  -p 2222:22 \      # SSH for Claude MCP
  -p 3000:3000 \    # Web UI
  -p 8443:8443 \    # Alternative HTTPS
  -p 9091:9091 \    # Vibe Kanban API
  -e DEVELOPER_PASSWORD=changeme \
  jjdenhertog/viberemote:latest
```

### Persistent Storage
- `/workspace/data/` - Preferences and configuration
- `/workspace/.ssh/` - SSH keys and known hosts
- `/workspace/.config/` - Application configurations

## Automation Workflows

### 1. Task Execution Flow
```
Human defines task → AI reads preferences → Claude executes with context → Auto PR creation
```

### 2. PR Creation Automation
- Triggered by `vibe-kanban-cleanup` when tasks complete
- Reads task descriptions from Vibe Kanban API
- Generates comprehensive PR with task context
- Includes automated code review process

### 3. Preference Injection
- `claude-wrapper` reads all preference files
- Injects context into every AI prompt
- Ensures consistent decision-making across sessions

## Important Notes

- **Always run** `pnpm run type-check` and `pnpm run lint` before committing
- **Gitignore patterns** include `claude-flow-prompt*` and `vibe-prompt-*` for temporary files
- **Follow strict import patterns** - no barrel exports, full paths only
- **Preference files** in `/workspace/data/preferences/` override default behaviors
- **Container persistence** - All auth tokens and configs survive container recreation