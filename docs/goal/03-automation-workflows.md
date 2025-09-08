# Automation Workflows

## Core Discovery: Task Prompt Injection

**Key Finding**: Vibe Kanban can execute additional prompts on existing tasks, which then auto-commit to the associated PR.

**Workflow**: Task gets new prompt → executes → commits changes to PR

## Automation Scenarios

### 1. Code Review Automation

**Trigger**: PR is created (via existing vibe-kanban-cleanup)
**Process**:
1. PR creation triggers webhook or detection
2. System injects code review prompt into the completed task
3. Task executes with review instructions + project preferences
4. Review feedback auto-commits to PR

**Code Review Prompt Example**:
```
Review the code changes in this PR against our coding standards and project requirements. 
Check for: compliance with preferences, security issues, performance concerns.
Provide specific feedback as PR comments or code suggestions.
```

### 2. PR Comment Response  

**Trigger**: Comment added to PR
**Process**:
1. GitHub webhook detects PR comment
2. System creates new task or re-prompts existing task with:
   - Original task context
   - PR comment content  
   - Instruction to address the comment
3. Task executes response (code changes, clarifications, etc.)
4. Changes auto-commit to PR

**Response Prompt Example**:
```
A comment was made on the PR: "[comment text]"
Address this feedback by making the necessary code changes or providing clarification.
Follow our project preferences and coding standards.
```

### 3. GitHub Issue to Task Creation

**Trigger**: New GitHub issue created
**Process**:
1. GitHub webhook captures issue creation
2. System analyzes issue content
3. Determines if task should be `[AI]` or `[HUMAN]` prefixed
4. Creates Vibe Kanban task via API

**Task Classification Logic**:
- `[AI]`: Implementation, bug fixes, code changes
- `[HUMAN]`: Architecture decisions, requirement clarification, design reviews

**API Call Example** (with priority/labels for task selection):
```bash
curl -X POST "http://localhost:9091/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "[AI] Fix authentication bug in user login",
    "description": "GitHub Issue #123: Users cannot login with special characters in passwords",
    "priority": "high",
    "labels": ["bug", "authentication", "urgent"]
  }'
```

## Technical Implementation

### Required Components

#### GitHub Integration Assumptions
- **Project Location**: Always `/workspace/project`
- **Authentication**: User has `gh cli` authenticated
- **Scope**: One setup per project
- **Repository**: Uses current project's GitHub repo

#### GitHub Webhook Listener
- **Process**: Background service (supervisord)  
- **Function**: Listen for issue creation, PR comments
- **Action**: Trigger appropriate automation workflow

#### Vibe Kanban API Integration
- **Known Endpoints**: 
  - `GET /api/tasks/{id}` (existing)
  - Need to discover: `POST /api/tasks` for creation
  - Need to discover: Task prompt injection endpoint

#### Web UI Configuration (Lean & Clean)
- **Feature Toggles**: Enable/disable each automation
- **Preference Management**: View/edit with Monaco editor
- **No Status Displays**: Keep UI minimal and focused

### Configuration Options

#### Automation Dashboard (Web UI)
```
┌─ Automation Features ─────────────────┐
│ ☑ Code Review Automation             │
│ ☑ PR Comment Response                │  
│ ☑ GitHub Issue → Task Creation       │
│ ☐ Intelligent Task Selection         │
│                                       │
│ GitHub Webhook URL: [_______________] │
│ Vibe Kanban API: [localhost:9091]    │
└───────────────────────────────────────┘
```

#### Per-Feature Settings
- **Code Review**: Custom review prompt template
- **PR Comments**: Auto-response vs human notification
- **Issue Classification**: Rules for `[AI]` vs `[HUMAN]` determination

## Integration with Existing System

### Current Working Components
- ✅ **vibe-kanban-cleanup**: Already creates PRs when tasks complete
- ✅ **claude-wrapper**: Already processes prompts with templates
- ✅ **Vibe Kanban API**: Already provides task and container information

### Enhancement Requirements
1. **GitHub webhook handling**: New background process
2. **Task prompt injection**: Discover/use Vibe Kanban API endpoint
3. **Web UI controls**: Add automation dashboard to existing Next.js app

### Supervisord Process Structure
```ini
# supervisor/conf.d/github-automation.conf
[program:github-webhook-listener]
command=node /workspace/project/dist/automation/github-webhook-listener.js
autostart=true
autorestart=true
user=developer
```

## Success Metrics

### Reduced Manual Intervention
- **Before**: Manual PR review, manual task creation from issues
- **After**: Automated reviews, automatic task generation, autonomous comment response

### Enhanced Development Flow
- **Code Review**: Every PR gets consistent review based on preferences
- **Issue Response**: GitHub issues automatically become actionable tasks
- **PR Iteration**: Comments trigger automatic responses and fixes

## Intelligent Task Selection

**Approach**: One-by-one task execution. Claude selects and completes one task fully before choosing the next.

**Selection Criteria**: Claude analyzes available `[AI]` tasks and considers:
- **Task status**: Only select from available/ready tasks
- **Priority levels**: High, medium, low (set during task creation)
- **Labels**: Bug, feature, urgent, etc. (for context)
- **Project context**: What makes logical sense to work on next
- **Natural dependencies**: Inferred from task descriptions and project understanding

**Task Creation Enhancement**: Include priority and labels for better selection:
```bash
# During issue → task conversion or manual creation
curl -X POST "http://localhost:9091/api/tasks" \
  -d '{
    "title": "[AI] Implement user authentication",
    "priority": "high", 
    "labels": ["feature", "security", "backend"]
  }'
```

**Selection Logic**: 
1. Complete current task fully
2. Analyze all available `[AI]` tasks 
3. Select next task based on priority, context, and logical sequence
4. Repeat