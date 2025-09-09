# Claude Task Start Instructions

## Starting Tasks in Vibe Kanban

When you need to start working on a task in Vibe Kanban, you have two methods available:

### Method 1: Using MCP Tool (Preferred)

The vibe_kanban MCP server provides a direct tool to update task status:

```javascript
// To start a task (set status to "inprogress"):
mcp__vibe_kanban__update_task({
    project_id: "your-project-id",  // Required
    task_id: "your-task-id",        // Required  
    status: "inprogress"            // Set to "inprogress" to start
})
```

**Available Status Values:**
- `"todo"` - Task is pending
- `"inprogress"` - Task is being worked on (use this to start)
- `"inreview"` - Task is under review
- `"done"` - Task is completed
- `"cancelled"` - Task was cancelled

### Method 2: Using Curl Command (Fallback)

If MCP is not available, use this curl command:

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"status": "inprogress"}' \
  http://localhost:3000/api/projects/${PROJECT_ID}/tasks/${TASK_ID}
```

### CLI Command

A helper command is also available:

```bash
# Using MCP (default)
npx vibe-kanban-cleanup start-task <project-id> <task-id>

# Using curl fallback
npx vibe-kanban-cleanup start-task <project-id> <task-id> --use-curl
```

## Usage Examples

### Example 1: Starting a Task via MCP

```javascript
// First, list projects to get project_id
mcp__vibe_kanban__list_projects()

// List tasks in the project to get task_id
mcp__vibe_kanban__list_tasks({
    project_id: "proj-123",
    status: "todo"  // Optional: filter by status
})

// Start the task
mcp__vibe_kanban__update_task({
    project_id: "proj-123",
    task_id: "task-456",
    status: "inprogress"
})
```

### Example 2: Batch Starting Multiple Tasks

```javascript
// Start multiple tasks in parallel (use Claude Code's BatchTool)
[Single Message]:
  mcp__vibe_kanban__update_task({project_id: "proj-123", task_id: "task-1", status: "inprogress"})
  mcp__vibe_kanban__update_task({project_id: "proj-123", task_id: "task-2", status: "inprogress"})
  mcp__vibe_kanban__update_task({project_id: "proj-123", task_id: "task-3", status: "inprogress"})
```

### Example 3: Complete Task Workflow

```javascript
// 1. Get task details
mcp__vibe_kanban__get_task({
    project_id: "proj-123",
    task_id: "task-456"
})

// 2. Start working on it
mcp__vibe_kanban__update_task({
    project_id: "proj-123",
    task_id: "task-456",
    status: "inprogress"
})

// 3. Update title/description if needed
mcp__vibe_kanban__update_task({
    project_id: "proj-123",
    task_id: "task-456",
    title: "Updated task title",
    description: "Added more details about the implementation"
})

// 4. Mark as done when complete
mcp__vibe_kanban__update_task({
    project_id: "proj-123",
    task_id: "task-456",
    status: "done"
})
```

## Error Handling

The implementation includes:
- Logging of all actions for debugging
- Graceful error handling with descriptive messages
- Success/failure status in responses

## Integration with Claude Flow

When using Claude Flow swarms, you can coordinate task status updates:

```javascript
// Store task info in swarm memory
mcp__claude-flow__memory_store({
    key: "current_task",
    value: {
        project_id: "proj-123",
        task_id: "task-456",
        status: "inprogress"
    }
})

// Update task status via MCP
mcp__vibe_kanban__update_task({
    project_id: "proj-123",
    task_id: "task-456",
    status: "inprogress"
})

// Notify swarm of task start
mcp__claude-flow__agent_communicate({
    to: "all",
    message: "Started task-456, beginning implementation"
})
```

## Debugging

All task start operations are logged with the `[startTask]` prefix for easy debugging:

```
[startTask] Starting task task-456 in project proj-123 using MCP
[startTask] MCP implementation - params: { project_id: 'proj-123', task_id: 'task-456', status: 'inprogress' }
```

## Notes

- Always pass both `project_id` and `task_id` as they are required
- The MCP method is preferred as it's more reliable
- The curl fallback is provided for environments where MCP is not available
- Task status changes are immediate and don't require confirmation