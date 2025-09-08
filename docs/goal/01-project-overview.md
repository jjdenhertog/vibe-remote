# Vibe Remote Workstation: Autonomous Development Environment

## Project Purpose

Transform a manual task-by-task development workflow into an almost autonomous coding environment where AI agents handle execution while humans provide vision and preferences.

## Current Problem

**Manual Overhead**: Vibe Kanban requires manual PR creation, task management, and constant human intervention for routine development tasks.

## Solution Concept

**Preference-Driven Autonomous Development**: Create a system where:

1. **Human Sparring Session**: Initial conversation between human and Claude to document all project preferences, coding standards, and decision-making criteria
2. **Preference-Guided AI**: Every AI decision is guided by documented preferences rather than assumptions
3. **Intelligent Automation**: Leverage Vibe Kanban's task system and new prompt injection capability for autonomous workflows

## Core Components

### 1. Preference System
- **Storage**: `/workspace/data/preferences/` (persistent across container restarts)
- **Format**: Markdown files (like existing `docs/rules/CODING_GUIDELINES.md`)
- **Integration**: `claude-wrapper` reads and injects preferences into all prompts
- **Management**: Web UI for viewing/editing preferences (Monaco editor)

### 2. Existing Infrastructure (Already Working)
- **Vibe Kanban**: Task management with API at `localhost:9091/api/`
- **Claude-wrapper**: Template system that processes prompts 
- **Vibe-kanban-cleanup**: Auto-triggered PR creation
- **Web App**: Blank Next.js scaffold ready for UI development

### 3. New Automation Workflows

#### Task Prompt Injection (NEW Discovery)
Vibe Kanban can execute additional prompts on existing tasks:
- Task gets new prompt → executes → auto-commits to existing PR

#### Enabled Workflows:
- **Code Review**: PR created → inject review prompt into task → auto-commit feedback
- **PR Comment Response**: GitHub comment → inject response prompt → auto-commit changes  
- **GitHub Issue → Task**: Webhook creates Vibe Kanban task with `[AI]` or `[HUMAN]` prefix

## Development Approach

### Phase 1: Foundation Session
**Human + Claude Sparring Session**:
1. Analyze existing codebase and patterns
2. Document comprehensive preferences covering:
   - Project purpose and context
   - Coding standards (based on existing guidelines)
   - AI behavior rules (DO/DON'T/ALWAYS/NEVER)
   - Automation configuration
3. Create initial Vibe Kanban tasks with `[AI]` and `[HUMAN]` prefixes
4. Establish preference management workflow

### Phase 2: Preference Integration  
1. Enhance `claude-wrapper` to read from `/workspace/data/preferences/`
2. Build web UI preference viewer/editor
3. Validate all AI prompts include relevant preferences

### Phase 3: Automation Implementation
1. GitHub webhook listener for issues and PR comments
2. Vibe Kanban task creation via API
3. Intelligent task selection and prioritization

## Key Principles

1. **No Assumptions**: Every AI decision guided by explicit preferences
2. **Leverage Existing Tools**: Build orchestration, not replacement functionality  
3. **Human Oversight**: Maintain control over strategic decisions
4. **Continuous Learning**: System improves based on feedback and outcomes

## Success Vision

**Before**: Manual task management, repetitive PR creation, constant context switching
**After**: AI handles routine execution, humans focus on architecture and strategy, development velocity increases while maintaining quality