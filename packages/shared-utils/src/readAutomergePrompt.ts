import { existsSync, readFileSync } from 'node:fs';

const DEFAULT_AUTOMERGE_PROMPT = `Review this pull request and decide if it should be automatically merged.

# IMPORTANT
When you choose to merge it WILL throw an error about the branch trying to check out. This is expected and SHOULD BE IGNORED. This is caused by the fact that we're calling this from a worktree.

Task ID: {{TASK_ID}}
Project ID: {{PROJECT_ID}}
Task Title: {{TASK_TITLE}}

## Quick Assessment (Score 1-10):

**1. Code Quality (40%)**
- Clean, readable code
- No obvious bugs or issues
- Follows existing patterns

**2. Safety & Risk (35%)**
- No breaking changes
- No security issues
- Safe to deploy

**3. Completeness (25%)**
- Feature/fix is complete
- No work-in-progress code
- Addresses the requirements

## Decision:

**MERGE if total score ≥ 7/10**

### If MERGING:
\`\`\`
SCORE: [X]/10
DECISION: MERGE
REASON: [brief why]

gh pr merge --merge --body "Auto-merged: [X]/10" --delete-branch

\`\`\`

# When merge is completed
Use the mcp__vibe_kanban__update_task tool with project_id: "{{projectId}}" and task_id: "{{taskId}}" to set status to 'done'

### If NOT MERGING:
\`\`\`
SCORE: [X]/10
DECISION: DO NOT MERGE
REASON: [main issues]
\`\`\`



Be pragmatic - focus on shipping working code, not perfection.`;

export function readAutomergePrompt(): string {
    const promptPath = '/workspace/data/preferences/automerge-prompt.md';
    
    if (!existsSync(promptPath))
        return DEFAULT_AUTOMERGE_PROMPT;
    
    try {
        const content = readFileSync(promptPath, 'utf8');

        return content || DEFAULT_AUTOMERGE_PROMPT;
    } catch (error) {
        console.warn(`Warning: Could not read automerge-prompt.md: ${String(error)}`);

        return DEFAULT_AUTOMERGE_PROMPT;
    }
}
