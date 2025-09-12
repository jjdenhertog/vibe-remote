import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const PREFERENCES_DIR = '/workspace/data/preferences';

async function processJsonContent(requestContent: string, config: PreferenceConfig, preference: string): Promise<string> {
    try {
        const parsed = JSON.parse(requestContent);

        if (config.validation) {
            const validation = config.validation(parsed);
            
            if (!validation.isValid) {
                throw new Error(validation.error || 'Validation failed');
            }
        }

        if (preference === 'automations') {
            const automationsConfig = PREFERENCE_CONFIGS[preference];
            const defaultAutomations = automationsConfig?.defaultContent as Record<string, unknown>;
            const validatedData = {
                ...parsed,
                automaticallyMergePR: parsed.automaticallyMergePR ?? defaultAutomations.automaticallyMergePR,
                mergeDecisionMode: parsed.mergeDecisionMode ?? defaultAutomations.mergeDecisionMode
            };
            
            return JSON.stringify(validatedData, null, 2);
        }

        return JSON.stringify(parsed, null, 2);
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('Invalid JSON format');
        }
        
        throw error;
    }
}

type PreferenceConfig = {
    filename: string;
    contentType: 'text' | 'json';
    defaultContent: string | object;
    successMessage: string;
    validation?: (content: unknown) => { isValid: boolean; error?: string };
};

const PREFERENCE_CONFIGS: Record<string, PreferenceConfig> = {
    'automerge-prompt': {
        filename: 'automerge-prompt.md',
        contentType: 'text',
        defaultContent: `Review this pull request and decide if it should be automatically merged.

# IMPORTANT
When you choose to merge it WILL throw an error about the branch trying to check out. This is expected and SHOULD BE IGNORED. This is caused by the fact that we're calling this from a worktree.

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

### If NOT MERGING:
\`\`\`
SCORE: [X]/10
DECISION: DO NOT MERGE
REASON: [main issues]
\`\`\`

Be pragmatic - focus on shipping working code, not perfection.`,
        successMessage: 'Automerge prompt saved successfully'
    },
    'coding-standards': {
        filename: 'coding-standards.md',
        contentType: 'text',
        defaultContent: `# Coding Standards

## General Principles
- Write clean, readable, and maintainable code
- Follow established conventions and patterns
- Prioritize simplicity and clarity

## Code Style
- Use consistent indentation (4 spaces)
- Follow naming conventions
- Add meaningful comments where necessary

## TypeScript/JavaScript
- Use TypeScript for type safety
- Prefer const over let when possible
- Use async/await over Promises chains

## React/Next.js
- Use functional components
- Follow React hooks best practices
- Use useCallback for event handlers

## File Organization
- Group related files together
- Use descriptive file names
- Maintain consistent directory structure
`,
        successMessage: 'Coding standards saved successfully'
    },
    'project-context': {
        filename: 'project-context.md',
        contentType: 'text',
        defaultContent: `# Project Context

## Project Purpose
Define the main purpose and goals of this project.

## Core Requirements
- List key requirements
- Define success criteria
- Outline constraints

## Target Users
Describe who will use this system and how.

## Technical Constraints
- Performance requirements
- Security considerations
- Compatibility needs
`,
        successMessage: 'Project context saved successfully'
    },
    'review-prompt': {
        filename: 'review-prompt.md',
        contentType: 'text',
        defaultContent: `Your goal is to code review the current project before a PR is being created.

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
`,
        successMessage: 'Review prompt saved successfully'
    },
    'automations': {
        filename: 'automations.json',
        contentType: 'json',
        defaultContent: {
            automaticallyCreatePR: false,
            doCodeReviewBeforeFinishing: false,
            automaticTaskPicking: false,
            baseBranch: 'main',
            automaticallyMergePR: false,
            mergeDecisionMode: 'claude-decision'
        },
        successMessage: 'Automation settings saved successfully',
        validation: (content: unknown) => {
            if (typeof content !== 'object' || content === null) {
                return { isValid: false, error: 'Invalid automation settings format' };
            }

            const data = content as Record<string, unknown>;

            if (typeof data.automaticallyCreatePR !== 'boolean' || 
                typeof data.doCodeReviewBeforeFinishing !== 'boolean' ||
                typeof data.automaticTaskPicking !== 'boolean' ||
                typeof data.baseBranch !== 'string') {
                return { isValid: false, error: 'Invalid automation settings format' };
            }

            if (data.automaticallyMergePR !== undefined && typeof data.automaticallyMergePR !== 'boolean') {
                return { isValid: false, error: 'automaticallyMergePR must be a boolean' };
            }

            if (data.mergeDecisionMode !== undefined && 
                (typeof data.mergeDecisionMode !== 'string' || 
                !['always', 'claude-decision'].includes(data.mergeDecisionMode))) {
                return { isValid: false, error: 'mergeDecisionMode must be either "always" or "claude-decision"' };
            }

            return { isValid: true };
        }
    }
};

export async function GET(_request: NextRequest, context: { params: Promise<{ preference: string }> }) {
    try {
        const { preference } = await context.params;
        const config = PREFERENCE_CONFIGS[preference];

        if (!config) {
            return new NextResponse('Preference type not found', { status: 404 });
        }

        const filePath = join(PREFERENCES_DIR, config.filename);

        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        // Check if file exists, create with default content if not
        if (!existsSync(filePath)) {
            const defaultContent = config.contentType === 'json' 
                ? JSON.stringify(config.defaultContent, null, 2)
                : config.defaultContent as string;

            await writeFile(filePath, defaultContent);

            return new NextResponse(defaultContent);
        }

        const content = await readFile(filePath, 'utf8');

        return new NextResponse(content);
    } catch (error) {
        const { preference } = await context.params;
        const config = PREFERENCE_CONFIGS[preference];

        console.error(`Error reading ${config?.filename}:`, error);

        return new NextResponse(`Error loading ${preference}`, { status: 500 });
    }
}

export async function POST(request: NextRequest, context: { params: Promise<{ preference: string }> }) {
    try {
        const { preference } = await context.params;
        const config = PREFERENCE_CONFIGS[preference];

        if (!config) {
            return new NextResponse('Preference type not found', { status: 404 });
        }

        const requestContent = await request.text();
        const filePath = join(PREFERENCES_DIR, config.filename);

        let finalContent: string;

        if (config.contentType === 'json') {
            try {
                finalContent = await processJsonContent(requestContent, config, preference);
            } catch (validationError) {
                const message = validationError instanceof Error ? validationError.message : 'Validation failed';
                
                return new NextResponse(message, { status: 400 });
            }
        } else {
            finalContent = requestContent;
        }

        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        await writeFile(filePath, finalContent);

        return new NextResponse(config.successMessage);
    } catch (error) {
        const { preference } = await context.params;
        const config = PREFERENCE_CONFIGS[preference];

        console.error(`Error saving ${config?.filename}:`, error);

        return new NextResponse(`Error saving ${preference}`, { status: 500 });
    }
}