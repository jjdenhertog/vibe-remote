import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const PREFERENCES_DIR = '/workspace/data/preferences';
const REVIEW_PROMPT_FILE = join(PREFERENCES_DIR, 'review-prompt.md');

const DEFAULT_REVIEW_PROMPT = `Your goal is to code review the current project before a PR is being created.

## Analysis Requirements
1. **Assess the codebase thoroughly**
2. **Analyze everything file by file** 
3. **Determine how well the task was executed**

## Review Criteria
- Code quality and adherence to standards
- No over engineering
- Everything in the task should be implemented

## Action Items

If the task was not executed well, you should:

- **Fix any errors** you find necessary
- **Improve code quality** where needed
- **Add missing functionality** to complete the task
- **Enhance error handling** and validation
`;

export async function GET() {
    try {
        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        // Check if file exists, create with default content if not
        if (!existsSync(REVIEW_PROMPT_FILE)) {
            await writeFile(REVIEW_PROMPT_FILE, DEFAULT_REVIEW_PROMPT);

            return new NextResponse(DEFAULT_REVIEW_PROMPT);
        }

        const content = await readFile(REVIEW_PROMPT_FILE, 'utf8');

        return new NextResponse(content);
    } catch (error) {
        console.error('Error reading review-prompt.md:', error);

        return new NextResponse('Error loading review prompt', { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const content = await request.text();

        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        await writeFile(REVIEW_PROMPT_FILE, content);

        return new NextResponse('Review prompt saved successfully');
    } catch (error) {
        console.error('Error saving review-prompt.md:', error);

        return new NextResponse('Error saving review prompt', { status: 500 });
    }
}