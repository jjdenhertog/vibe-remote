# Preference System Design

## Purpose

Ensure every AI decision is guided by documented human preferences rather than assumptions, creating consistent and predictable autonomous development behavior.

## Architecture

### Storage Location
- **Path**: `/workspace/data/preferences/`
- **Format**: Markdown files  
- **Persistence**: Survives container restarts (persistent volume)

### Core Preference Files

```
/workspace/data/preferences/
├── project-context.md          # Project purpose, goals, constraints
└── coding-standards.md         # Based on existing CODING_GUIDELINES.md
```

### Integration Points

#### Claude-Wrapper Enhancement
- **Current**: Uses `claude-wrapper.ts` to process `claude-flow-prompt.md` template for Claude-Flow interaction
- **Keep**: Existing claude-flow-prompt.md template stays the same (handles Claude-Flow orchestration)  
- **Addition**: Add preference injection ON TOP of existing template content
- **Method**: Prepend preferences section before the existing template content

#### Web UI Management
- **Viewer**: Display all preferences in organized interface
- **Editor**: Monaco editor for direct markdown editing
- **Validation**: Ensure preference consistency and format

## Preference File Structure

### Standard Format
```markdown
# [Category Name]

## Summary
Brief description of this preference category

## Rules
- **DO**: [Specific behavior to exhibit]
- **DON'T**: [Specific behavior to avoid]  
- **ALWAYS**: [Non-negotiable requirement]
- **NEVER**: [Absolute prohibition]

## Examples
[Concrete examples of correct/incorrect behavior]

## Context
[When these preferences apply]
```

## Sparring Session Process

### Initial Preference Discovery
1. **Claude analyzes existing codebase** (especially `docs/rules/CODING_GUIDELINES.md`)
2. **Human and Claude discuss** project goals, constraints, preferences
3. **Claude creates preference files** based on conversation
4. **Claude uses curl** to create initial Vibe Kanban tasks:
   - `[AI]` prefix for AI-executable tasks
   - `[HUMAN]` prefix for human-required tasks

### Example Curl Commands
```bash
# Create AI task
curl -X POST "http://localhost:9091/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "[AI] Implement preference loader in claude-wrapper",
    "description": "Read preferences from /workspace/data/preferences/ and inject into templates"
  }'

# Create human task  
curl -X POST "http://localhost:9091/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "[HUMAN] Review and approve initial preference files",
    "description": "Validate AI-generated preferences match project requirements"
  }'
```

## Preference Usage

### Template Enhancement
**Current Template** (`claude-flow-prompt.md`):
```markdown
You are orchestrating a Claude Flow Swarm using Claude Code's Task tool for agent execution.
🎯 OBJECTIVE: %REPLACE_WITH_PROMPT%
[... extensive Claude-Flow instructions ...]
```

**Enhanced Template** (preferences prepended):
```markdown
# PROJECT PREFERENCES

## Project Context
[Auto-injected from project-context.md]

## Coding Standards  
[Auto-injected from coding-standards.md]

---

You are orchestrating a Claude Flow Swarm using Claude Code's Task tool for agent execution.
🎯 OBJECTIVE: %REPLACE_WITH_PROMPT%
[... existing Claude-Flow instructions unchanged ...]
```

### Dynamic Preference Selection
- **Task-specific**: Different preferences for different task types
- **Context-aware**: Include only relevant preferences per situation
- **Performance**: Cache preferences to avoid file reads on every execution

## Implementation Requirements

### Claude-Wrapper Changes
1. Add preference loading capability
2. Template enhancement system
3. Preference caching mechanism

### Web UI Features  
1. Preference browser/navigation
2. Monaco editor integration
3. File save/validation
4. Preview of how preferences appear in prompts

### Validation Rules
1. Preferences must be valid markdown
2. Required sections must be present
3. No conflicting rules between files
4. Examples must be concrete and actionable