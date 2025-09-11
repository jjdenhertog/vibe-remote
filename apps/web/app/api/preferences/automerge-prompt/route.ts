import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const PREFERENCES_DIR = '/workspace/data/preferences';
const AUTOMERGE_PROMPT_FILE = join(PREFERENCES_DIR, 'automerge-prompt.md');

const DEFAULT_AUTOMERGE_PROMPT = `Review this pull request and decide if it should be automatically merged.

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

gh pr merge {{PR_URL}} --squash --body "Auto-merged: [X]/10" --delete-branch
\`\`\`

### If NOT MERGING:
\`\`\`
SCORE: [X]/10
DECISION: DO NOT MERGE
REASON: [main issues]
\`\`\`

Be pragmatic - focus on shipping working code, not perfection.`;

export async function GET() {
    try {
        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        // Check if file exists, create with default content if not
        if (!existsSync(AUTOMERGE_PROMPT_FILE)) {
            await writeFile(AUTOMERGE_PROMPT_FILE, DEFAULT_AUTOMERGE_PROMPT);

            return new NextResponse(DEFAULT_AUTOMERGE_PROMPT);
        }

        const content = await readFile(AUTOMERGE_PROMPT_FILE, 'utf8');

        return new NextResponse(content);
    } catch (error) {
        console.error('Error reading automerge-prompt.md:', error);

        return new NextResponse('Error loading automerge prompt', { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const content = await request.text();

        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        await writeFile(AUTOMERGE_PROMPT_FILE, content);

        return new NextResponse('Automerge prompt saved successfully');
    } catch (error) {
        console.error('Error saving automerge-prompt.md:', error);

        return new NextResponse('Error saving automerge prompt', { status: 500 });
    }
}