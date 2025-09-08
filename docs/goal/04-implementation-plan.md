# Implementation Plan

## Current State (Confirmed)

### Working Components
- ✅ **claude-wrapper**: Template processing, prompt injection
- ✅ **vibe-kanban-cleanup**: Auto-triggered PR creation  
- ✅ **Vibe Kanban API**: `http://localhost:9091/api/` (tasks, containers, task-attempts)
- ✅ **Web App**: Blank Next.js scaffold
- ✅ **Persistent Storage**: `/workspace/data/` volume
- ✅ **Coding Guidelines**: Comprehensive rules in `docs/rules/CODING_GUIDELINES.md`

### New Discovery
- ✅ **Task Prompt Injection**: Vibe Kanban can execute additional prompts on tasks → auto-commits to PR

## Implementation Phases

### Phase 1: Preference Foundation

**Goal**: Establish preference-driven development

#### Human Sparring Session
1. **Analyze Existing Codebase**: Review current patterns, especially `CODING_GUIDELINES.md`
2. **Document Preferences**: Create comprehensive preference files in `/workspace/data/preferences/`
3. **Create Initial Tasks**: Use curl to create `[AI]` and `[HUMAN]` tasks in Vibe Kanban
4. **Establish Workflow**: Define how preferences will be maintained and updated

#### Technical Implementation
1. **Enhance claude-wrapper**: Read preferences from `/workspace/data/preferences/`, inject into all templates
2. **Build Web UI**: Preference viewer/editor using Monaco editor
3. **Test Integration**: Verify all prompts include relevant preferences

**Success Criteria**:
- All Claude prompts include project-specific preferences
- Preferences are editable via web UI
- Preferences persist in `/workspace/data/` volume

### Phase 2: Automation Infrastructure

**Goal**: Implement core automation workflows

#### Code Review Automation
1. **Detect PR Creation**: Monitor for completed tasks that created PRs
2. **Inject Review Prompt**: Use task prompt injection to trigger code review
3. **Auto-commit Feedback**: Review results commit back to PR

#### PR Comment Response  
1. **GitHub Webhook Setup**: Listen for PR comments
2. **Task Prompt Injection**: Send "respond to comment" prompt to task
3. **Auto-commit Response**: Changes commit to PR

#### GitHub Issue → Task Creation
1. **Issue Webhook**: Detect new GitHub issues
2. **Classification Logic**: Determine `[AI]` vs `[HUMAN]` prefix
3. **Task Creation**: Use Vibe Kanban API to create tasks

**Success Criteria**:
- PRs automatically get code review feedback
- PR comments trigger automatic responses
- GitHub issues automatically become Vibe Kanban tasks

### Phase 3: Intelligence Layer

**Goal**: Add smart decision-making

#### Intelligent Task Selection
1. **Task Analysis**: Evaluate available tasks, dependencies, priorities
2. **Automatic Selection**: Choose next task to work on
3. **Preference-Guided Decisions**: Use preferences to guide selection criteria

#### Learning System
1. **Outcome Tracking**: Monitor automation success rates
2. **Preference Updates**: Learn from feedback and adjust preferences
3. **Process Optimization**: Improve workflows based on performance data

## Technical Requirements by Phase

### Phase 1 Requirements
- **Storage**: Create `/workspace/data/preferences/` structure
- **Claude-wrapper**: Add preference loading and injection
- **Web UI**: Monaco editor integration, preference management pages
- **No new processes**: Uses existing infrastructure

### Phase 2 Requirements  
- **GitHub Webhooks**: Background service (supervisord process)
- **Vibe Kanban API**: Discover task creation and prompt injection endpoints
- **Web UI**: Automation dashboard, configuration controls

### Phase 3 Requirements
- **Analytics**: Track automation performance
- **AI Decision Logic**: Implement task selection algorithms  
- **Feedback Loops**: Preference update mechanisms

## Unknown Requirements (To Be Discovered)

### Vibe Kanban API Endpoints
- `POST /api/tasks` for task creation
- Task prompt injection endpoint/method
- Task status and progress monitoring

### GitHub Integration
- Webhook authentication and security
- PR comment parsing and context extraction
- Issue classification rules and patterns

### Web UI Scope
- Authentication/authorization requirements
- Real-time updates and monitoring
- Configuration validation and error handling

## Success Vision

### Short-term (Phase 1)
- Human sparring session produces comprehensive preference system
- All AI decisions guided by documented preferences
- Preference management via intuitive web interface

### Medium-term (Phase 2)  
- Code reviews happen automatically on every PR
- GitHub issues become actionable tasks without manual intervention
- PR feedback loops work autonomously

### Long-term (Phase 3)
- System operates with minimal human intervention
- Intelligent task selection and prioritization
- Continuous improvement based on outcomes and feedback