# Vibe Kanban Task Picker

Automated task selection and analysis system for Vibe Kanban using Claude AI with MCP tools integration.

## Overview

This package provides an intelligent task picker that:
1. Uses Claude's MCP vibe_kanban tools to analyze tasks directly
2. Intelligently selects the most appropriate task based on multiple criteria
3. Automatically updates task status to "inprogress"
4. Stops if tasks are in review status (requiring attention first)

## Key Features

- **MCP Integration**: Direct integration with Claude's MCP vibe_kanban tools
- **Intelligent Analysis**: Multi-criteria task evaluation and selection
- **Priority System**: [AI] prefixed tasks prioritized over [HUMAN] tasks
- **Review Gate**: Automatic stop when tasks need review
- **Dependency Awareness**: Considers task dependencies for optimal ordering

## Installation

```bash
pnpm install
pnpm run build
```

## Configuration

### Required Setup

Ensure Claude has the MCP vibe_kanban server configured and accessible.

### Environment Variables

- `VIBE_PROJECT_ID`: The project ID to analyze (can also be passed as CLI argument)
- `TASK_CHECK_INTERVAL`: Seconds between task checks (default: 300)

## Usage

### Command Line

```bash
# Using command-line argument
vibe-kanban-taskpicker <project-id>

# Using environment variable
VIBE_PROJECT_ID=<project-id> vibe-kanban-taskpicker
```

### As a Module

```typescript
import { runTaskPicker } from '@vibe-remote/vibe-kanban-taskpicker';

await runTaskPicker({
    projectId: 'your-project-id',
    checkInterval: 300
});
```

## How It Works

### 1. Task Retrieval
Uses `mcp__vibe_kanban__list_tasks` to fetch all tasks in the specified project.

### 2. Review Check
**CRITICAL**: If any tasks have "inreview" status, the picker stops immediately. These tasks need to be reviewed and completed before new work begins.

### 3. Task Analysis
Evaluates TODO tasks based on:

- **Task Prefixes**
  - `[AI]` - Tasks suitable for AI/automated implementation (highest priority)
  - `[AI/HUMAN]` - Tasks that AI can execute AFTER human provides required input (medium priority)
  - `[HUMAN]` - Tasks requiring human intervention (skipped by taskpicker)
  
- **Dependencies**
  - Tasks that block other work are prioritized
  - Foundational tasks selected first
  
- **Complexity Balance**
  - Prefers tasks with clear scope and requirements
  - Balances between too simple and too complex
  
- **Status Distribution**
  - Considers current work distribution
  - Avoids overloading any phase

### 4. AI/HUMAN Task Handling
For `[AI/HUMAN]` tasks:
- The taskpicker checks if the "# HUMAN INPUT NEEDED" section has been answered
- If human input is pending, the task is skipped
- If human has provided responses (marked with "HUMAN RESPONSE:" or "ANSWERED:"), the task becomes eligible for AI execution
- This allows AI to work on complex tasks that need human clarification without blocking on simple questions

### 5. Task Selection & Update
- Selects the optimal task based on analysis
- Updates task status to "inprogress" using `mcp__vibe_kanban__update_task`
- Provides clear reasoning for the selection

## Task Selection Template

The analysis logic is defined in `templates/task-picker-prompt.md`. This template:
- Instructs Claude to use MCP tools
- Defines the analysis criteria
- Specifies the output format
- Ensures proper status updates

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

## Integration with Supervisord

For automatic task picking at intervals:

```ini
[program:vibe-taskpicker]
command=node /app/packages/vibe-kanban-taskpicker/dist/index.js
directory=/app/packages/vibe-kanban-taskpicker
environment=VIBE_PROJECT_ID="your-project-id",TASK_CHECK_INTERVAL="300"
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/vibe-taskpicker.out.log
stderr_logfile=/var/log/supervisor/vibe-taskpicker.err.log
```

## MCP Tools Used

- `mcp__vibe_kanban__list_tasks` - Retrieve all tasks in a project
- `mcp__vibe_kanban__update_task` - Update task status
- `mcp__vibe_kanban__get_task` - Get detailed task information (if needed)

## Error Handling

- Graceful handling of MCP tool failures
- Clear error messages for missing project IDs
- Automatic stop on review-required tasks
- Detailed logging for debugging

## Logging

All operations are logged with `[TaskPicker]` prefix:
- Task analysis progress
- Selected task details
- Status updates
- Error conditions

## Future Enhancements

- Support for multiple project analysis
- Task execution integration
- Custom priority weighting
- Historical task selection learning