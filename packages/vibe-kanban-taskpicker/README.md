# Vibe Kanban Task Picker

Automated task selection and execution system for Vibe Kanban using Claude AI.

## Overview

This package provides an automated task picker that:
1. Fetches available tasks from Vibe Kanban projects
2. Uses Claude AI to intelligently select the most appropriate task
3. Executes the selected task using Claude
4. Updates task status automatically

## Installation

```bash
pnpm install
pnpm run build
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `CLAUDE_COMMAND`: Path to Claude CLI command (default: `claude`)
- `VIBE_API_URL`: Vibe Kanban API endpoint (default: `http://localhost:3001`)
- `TASK_CHECK_INTERVAL`: Seconds between task checks (default: `300`)

### Supervisord Setup

For automatic task picking at intervals:

1. Copy `supervisord.conf.example` to your supervisord configuration directory
2. Adjust paths and environment variables
3. Reload supervisord configuration

```bash
supervisorctl reread
supervisorctl update
supervisorctl start vibe-taskpicker
```

## Usage

### Manual Execution

```bash
node dist/index.js
```

### As a Module

```typescript
import { runTaskPicker } from '@vibe-remote/vibe-kanban-taskpicker';

await runTaskPicker({
    claudeCommand: 'claude',
    vibeApiUrl: 'http://localhost:3001',
    checkInterval: 300
});
```

## How It Works

1. **Project Discovery**: Fetches all available projects from Vibe Kanban
2. **Task Analysis**: For each project, identifies TODO tasks
3. **Intelligent Selection**: Uses Claude to analyze and select the most appropriate task based on:
   - Priority and dependencies
   - Complexity and clarity
   - Value to the project
4. **Execution**: Claude executes the selected task autonomously
5. **Status Updates**: Automatically updates task status (todo → in-progress → done)

## Development

```bash
# Watch mode for development
pnpm run dev

# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Build
pnpm run build
```

## Integration with Docker

When running in a Docker container with supervisord:

1. The package is built during the Docker image creation
2. Supervisord manages the process lifecycle
3. The process exits after completing one task
4. Supervisord automatically restarts it for the next cycle

## API Endpoints Used

- `GET /api/projects` - List all projects
- `GET /api/projects/:id/tasks` - List tasks for a project
- `PATCH /api/projects/:id/tasks/:taskId` - Update task status

## Error Handling

- Graceful handling of API connection errors
- Claude execution failures are logged but don't crash the process
- Automatic retry through supervisord on process exit

## Logging

Logs are written to stdout/stderr and captured by supervisord:
- `/var/log/supervisor/vibe-taskpicker.out.log` - Standard output
- `/var/log/supervisor/vibe-taskpicker.err.log` - Error output