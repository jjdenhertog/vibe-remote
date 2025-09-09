# Vibe Kanban API Documentation

## Base URL
All endpoints are prefixed with `/api`

## Authentication
- GitHub OAuth token required for PR operations
- Stored in config: `github.oauth_token` or `github.pat`

---

## 📁 Project Management APIs

### 1. List Projects
**GET** `/api/projects`

Retrieve all projects in the system.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "git_repo_path": "string",
      "setup_script": "string | null",
      "dev_script": "string | null", 
      "cleanup_script": "string | null",
      "copy_files": "string[] | null",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. Get Project
**GET** `/api/projects/{id}`

Retrieve a specific project by ID.

### 3. Create Project
**POST** `/api/projects`

Create a new project.

**Request Body:**
```json
{
  "name": "string",
  "git_repo_path": "string",
  "use_existing_repo": "boolean",
  "setup_script": "string | null",
  "dev_script": "string | null",
  "cleanup_script": "string | null",
  "copy_files": "string[] | null"
}
```

### 4. Update Project
**PUT** `/api/projects/{id}`

Update an existing project.

### 5. Delete Project
**DELETE** `/api/projects/{id}`

Delete a project permanently.

### 6. Get Project Branches
**GET** `/api/projects/{id}/branches`

Retrieve all Git branches for the project.

### 7. Search Project Files
**GET** `/api/projects/{id}/search?q={query}`

Search for files within the project repository. Supports fuzzy matching on file names and paths.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "path": "string",
      "is_file": "boolean",
      "match_type": "FileName" | "DirectoryName" | "FullPath"
    }
  ]
}
```

### 8. Open Project in Editor
**POST** `/api/projects/{id}/open-editor`

Open the project in the configured code editor.

**Request Body:**
```json
{
  "editor_type": "string | null"
}
```

---

## 🖼️ Image Management APIs

### 9. Upload Image
**POST** `/api/images/upload`

Upload an image file (multipart/form-data, max 20MB).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_path": "string",
    "original_name": "string",
    "mime_type": "string | null",
    "size_bytes": "number",
    "hash": "string",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 10. Serve Image
**GET** `/api/images/{id}/file`

Serve an uploaded image file by ID.

### 11. Delete Image
**DELETE** `/api/images/{id}`

Delete an uploaded image.

### 12. Get Task Images
**GET** `/api/images/task/{task_id}`

Retrieve all images associated with a specific task.

---

## ⚙️ Configuration APIs

### 13. Get System Info & Config
**GET** `/api/info`

Retrieve comprehensive system information, user configuration, and executor profiles.

**Response:**
```json
{
  "success": true,
  "data": {
    "config": {
      "github": {
        "username": "string | null",
        "primary_email": "string | null",
        "oauth_token": "string | null",
        "default_pr_base": "string | null"
      },
      "executor_profile": {
        "executor": "CLAUDE_CODE" | "GEMINI" | "CODEX" | "AMP" | "OPENCODE" | "CURSOR" | "QWEN_CODE",
        "variant": "string | null"
      },
      "editor": {
        "type": "string",
        "args": "string[]"
      },
      "analytics_enabled": "boolean",
      "github_login_acknowledged": "boolean"
    },
    "profiles": {
      "coding_agents": {
        "CLAUDE_CODE": {
          "display_name": "string",
          "supports_mcp": "boolean"
        }
      }
    },
    "environment": {
      "os_type": "string",
      "os_version": "string",
      "os_architecture": "string",
      "bitness": "string"
    }
  }
}
```

### 14. Update Configuration
**PUT** `/api/config`

Update user configuration settings.

### 15. Get Sound File
**GET** `/api/sounds/{sound}`

Serve notification sound files.

### 16. Get MCP Servers
**GET** `/api/mcp-config?executor={executor}`

Retrieve MCP (Model Context Protocol) server configuration for a specific executor.

### 17. Update MCP Servers  
**POST** `/api/mcp-config?executor={executor}`

Update MCP server configuration for a specific executor.

### 18. Get Executor Profiles
**GET** `/api/profiles`

Retrieve executor profiles configuration as editable JSON.

### 19. Update Executor Profiles
**PUT** `/api/profiles`

Update executor profiles configuration.

---

## 🔐 Authentication APIs

### 20. Start GitHub Device Flow
**POST** `/api/auth/github/device/start`

Initiate GitHub OAuth device authorization flow.

**Response:**
```json
{
  "success": true,
  "data": {
    "device_code": "string",
    "user_code": "string",
    "verification_uri": "string",
    "expires_in": "number",
    "interval": "number"
  }
}
```

### 21. Poll GitHub Device Flow
**POST** `/api/auth/github/device/poll`

Poll for GitHub OAuth device authorization completion.

**Response:**
```json
{
  "success": true,
  "data": "SLOW_DOWN" | "AUTHORIZATION_PENDING" | "SUCCESS"
}
```

### 22. Check GitHub Token
**GET** `/api/auth/github/check`

Validate the current GitHub token.

**Response:**
```json
{
  "success": true,
  "data": "VALID" | "INVALID"
}
```

---

## 🗂️ Task Templates APIs

### 23. List Task Templates
**GET** `/api/templates`
**GET** `/api/templates?global=true`
**GET** `/api/templates?project_id={uuid}`

Retrieve task templates. Can filter for global templates or project-specific templates.

### 24. Get Task Template
**GET** `/api/templates/{template_id}`

Retrieve a specific task template.

### 25. Create Task Template
**POST** `/api/templates`

Create a new task template.

### 26. Update Task Template
**PUT** `/api/templates/{template_id}`

Update an existing task template.

### 27. Delete Task Template
**DELETE** `/api/templates/{template_id}`

Delete a task template.

---

## 📋 Task Management APIs

### 28. List Tasks
**GET** `/api/tasks?project_id={uuid}`

List all tasks for a specific project with execution status.

**Query Parameters:**
- `project_id` (required): UUID of the project

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid", 
      "title": "string",
      "description": "string | null",
      "status": "todo" | "inprogress" | "inreview" | "done" | "cancelled",
      "parent_task_attempt": "uuid | null",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "has_in_progress_attempt": boolean,
      "has_merged_attempt": boolean,
      "last_attempt_failed": boolean,
      "executor": "string"
    }
  ],
  "error_data": null,
  "message": null
}
```

### 29. Create Task
**POST** `/api/tasks`

Create a new task without starting execution.

**Request Body:**
```json
{
  "project_id": "uuid",
  "title": "string",
  "description": "string | null",
  "parent_task_attempt": "uuid | null",
  "image_ids": ["uuid"] | null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "project_id": "uuid",
    "title": "string", 
    "description": "string | null",
    "status": "todo",
    "parent_task_attempt": "uuid | null",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 30. Create and Start Task  
**POST** `/api/tasks/create-and-start`

Create a new task and immediately start execution with the default executor.

**Request Body:** Same as Create Task

**Response:** Same as List Tasks response (with execution status)

---

## 🚀 Task Execution APIs

### 31. Get Task
**GET** `/api/tasks/{task_id}`

Retrieve a specific task by ID.

### 32. Update Task
**PUT** `/api/tasks/{task_id}`

Update an existing task.

**Request Body:**
```json
{
  "title": "string | null",
  "description": "string | null",
  "status": "todo" | "inprogress" | "inreview" | "done" | "cancelled",
  "parent_task_attempt": "uuid | null",
  "image_ids": ["uuid"] | null
}
```

---

## 🚀 Task Execution APIs

### 33. List Task Attempts
**GET** `/api/task-attempts`
**GET** `/api/task-attempts?task_id={uuid}`

Retrieve all task attempts, optionally filtered by task ID.

### 34. Get Task Attempt
**GET** `/api/task-attempts/{id}`

Retrieve a specific task attempt by ID.

### 35. Start Task Attempt
**POST** `/api/task-attempts`

Start a new execution attempt for an existing task.

**Request Body:**
```json
{
  "task_id": "uuid",
  "executor_profile_id": {
    "executor": "CLAUDE_CODE" | "GEMINI" | "CODEX" | "AMP" | "OPENCODE" | "CURSOR" | "QWEN_CODE",
    "variant": "string | null"
  },
  "base_branch": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "task_id": "uuid",
    "executor": "string",
    "base_branch": "string",
    "branch": "string | null",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 36. Follow Up on Task Attempt
**POST** `/api/task-attempts/{attempt_id}/follow-up`

Send a follow-up prompt to continue working on a task attempt.

**Request Body:**
```json
{
  "prompt": "string",
  "variant": "string | null", 
  "image_ids": ["uuid"] | null
}
```

---

### 37. Get Task Attempt Branch Status
**GET** `/api/task-attempts/{attempt_id}/branch-status`

Get current branch status, merge information, and commit differences.

**Response:**
```json
{
  "success": true,
  "data": {
    "commits_behind": "number | null",
    "commits_ahead": "number | null", 
    "has_uncommitted_changes": "boolean | null",
    "base_branch_name": "string",
    "remote_commits_behind": "number | null",
    "remote_commits_ahead": "number | null",
    "merges": []
  }
}
```

### 38. Rebase Task Attempt
**POST** `/api/task-attempts/{attempt_id}/rebase`

Rebase the task attempt branch onto a new base branch.

**Request Body:**
```json
{
  "new_base_branch": "string | null"
}
```

### 39. Push Task Attempt Branch
**POST** `/api/task-attempts/{attempt_id}/push`

Push the task attempt branch to GitHub.

### 40. Open Task Attempt in Editor
**POST** `/api/task-attempts/{attempt_id}/open-editor`

Open the task attempt worktree in a code editor.

**Request Body:**
```json
{
  "editor_type": "string | null",
  "file_path": "string | null"
}
```

### 41. Delete Task Attempt File
**POST** `/api/task-attempts/{attempt_id}/delete-file?file_path={path}`

Delete a file from the task attempt worktree and commit the change.

### 42. Start Dev Server
**POST** `/api/task-attempts/{attempt_id}/start-dev-server`

Start the project's development server for this task attempt.

### 43. Get Task Attempt Children
**GET** `/api/task-attempts/{attempt_id}/children`

Retrieve child tasks created from this task attempt.

---

## 🔀 Pull Request APIs

### 44. Create PR
**POST** `/api/task-attempts/{attempt_id}/pr`

Create a GitHub pull request for a completed task attempt.

**Request Body:**
```json
{
  "title": "string",
  "body": "string | null",
  "base_branch": "string | null"
}
```

**Response:**
```json
{
  "success": true,
  "data": "https://github.com/owner/repo/pull/123"
}
```

**Error Response:**
```json
{
  "success": false,
  "error_data": "TOKEN_INVALID" | "INSUFFICIENT_PERMISSIONS" | "REPO_NOT_FOUND_OR_NO_ACCESS",
  "message": "string"
}
```

### 45. Direct Merge (No PR)
**POST** `/api/task-attempts/{attempt_id}/merge`

Directly merge task attempt changes to base branch without creating a PR.

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "data": null
}
```

**Note:** This creates a commit with format: `"{task_title} (vibe-kanban {task_id_prefix})"` and automatically sets task status to "done".

---

## 📊 Monitoring & Streaming APIs

### 46. Stream Tasks (SSE)
**GET** `/api/tasks/stream?project_id={uuid}`

Server-sent events stream for real-time task updates.

### 47. Get Task Attempt Diff (SSE)
**GET** `/api/task-attempts/{attempt_id}/diff`

Streaming diff of file changes made by the task attempt.

### 48. Stream Events (SSE)
**GET** `/api/events`

General event stream for system-wide updates.

---

## ⚡ Execution Process APIs

### 49. List Execution Processes
**GET** `/api/execution-processes?task_attempt_id={uuid}`

Retrieve all execution processes for a task attempt.

### 50. Get Execution Process
**GET** `/api/execution-processes/{id}`

Retrieve a specific execution process.

### 51. Stop Execution Process
**POST** `/api/execution-processes/{id}/stop`

Stop a running execution process.

### 52. Stream Raw Logs (SSE)
**GET** `/api/execution-processes/{id}/raw-logs`

Stream raw execution logs from a process.

### 53. Stream Normalized Logs (SSE) 
**GET** `/api/execution-processes/{id}/normalized-logs`

Stream normalized/formatted execution logs from a process.

---

## 📁 Filesystem APIs

### 54. List Directory
**GET** `/api/filesystem/directory?path={path}`

List contents of a filesystem directory.

**Response:**
```json
{
  "success": true,
  "data": {
    "current_path": "string",
    "parent_path": "string | null",
    "entries": [
      {
        "name": "string",
        "path": "string", 
        "is_directory": "boolean",
        "size": "number | null",
        "modified": "string | null"
      }
    ]
  }
}
```

### 55. List Git Repositories
**GET** `/api/filesystem/git-repos?path={path}`

Find Git repositories within a directory (searches up to 4 levels deep).

---

## 🐳 Container APIs

### 56. Get Container Info
**GET** `/api/containers/info?ref={container_ref}`

Resolve container reference to task attempt, task, and project IDs.

**Response:**
```json
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "task_id": "uuid", 
    "project_id": "uuid"
  }
}
```

---

## 🗑️ Cleanup APIs

### 57. Delete Task
**DELETE** `/api/tasks/{task_id}`

Permanently delete a task and all its execution attempts.

**Response:**
```json
{
  "success": true,
  "data": null
}
```

**Note:** This operation:
- Deletes all task attempts and their containers
- Removes all execution history
- Cleans up worktrees and temporary files
- Cannot be undone

### 58. Stop Task Execution
**POST** `/api/task-attempts/{attempt_id}/stop`

Stop a currently running task attempt execution.

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "data": null
}
```

**Note:** This gracefully stops the AI agent execution but preserves all progress made so far.

### 59. Health Check
**GET** `/api/health`

Basic health check endpoint.

---

## 🔄 Retry/Restart Patterns

### Retry a Failed Task
To retry a failed task or restart with different parameters, create a new task attempt:

**POST** `/api/task-attempts`

**Request Body:**
```json
{
  "task_id": "uuid",
  "executor_profile_id": {
    "executor": "CLAUDE_CODE",
    "variant": "string | null"  
  },
  "base_branch": "string"
}
```

This creates a fresh execution attempt while preserving the original task and any previous attempt history.

---

## 🔧 Automation Examples

### Complete Workflow Example
```bash
# 1. Create and start task
curl -X POST "http://localhost:3000/api/tasks/create-and-start" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "your-project-uuid",
    "title": "Implement user authentication",
    "description": "Add login/logout functionality"
  }'

# Response includes attempt_id

# 2. Wait for completion or monitor via SSE
# 3. Create PR automatically
curl -X POST "http://localhost:3000/api/task-attempts/{attempt_id}/pr" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "feat: implement user authentication", 
    "body": "Adds login/logout functionality with proper session management"
  }'
```

### Alternative: Direct Merge
```bash
# Skip PR creation, merge directly
curl -X POST "http://localhost:3000/api/task-attempts/{attempt_id}/merge"
```

### Task Management Examples
```bash
# Stop a running task
curl -X POST "http://localhost:3000/api/task-attempts/{attempt_id}/stop"

# Delete a task completely
curl -X DELETE "http://localhost:3000/api/tasks/{task_id}"

# Retry a failed task with different executor
curl -X POST "http://localhost:3000/api/task-attempts" \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "failed-task-uuid",
    "executor_profile_id": {
      "executor": "GEMINI",
      "variant": null
    },
    "base_branch": "main"
  }'
```

**Note:** PR merging is handled externally via GitHub - the system only creates PRs and tracks their status. Use GitHub's API or web interface to actually merge PRs.

---

## 🎯 Automation Strategy

### For Streamlined AI Development Workflow:

1. **Task Creation**: Use `/api/tasks/create-and-start` for immediate execution
2. **Monitoring**: Poll `/api/task-attempts/{id}/branch-status` or use SSE streams
3. **Auto-PR**: When task completes successfully, automatically call `/api/task-attempts/{id}/pr`
4. **Auto-Merge**: For trusted workflows, use `/api/task-attempts/{id}/merge` to skip PR review

### Available Executors:
- `CLAUDE_CODE`: Anthropic's Claude with code capabilities
- `GEMINI`: Google's Gemini model
- `CODEX`: OpenAI Codex
- `AMP`: AMP executor
- `OPENCODE`: Open source code model
- `CURSOR`: Cursor IDE integration
- `QWEN_CODE`: Qwen code model

### Error Handling:
All endpoints return standardized `ApiResponse<T, E>` format with `success` boolean, optional `data`, `error_data`, and `message` fields for consistent error handling in automation scripts.