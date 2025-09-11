import { existsSync, readFileSync } from 'node:fs';

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

export function readReviewPrompt(): string {
    const promptPath = '/workspace/data/preferences/review-prompt.md';
    
    if (!existsSync(promptPath))
        return DEFAULT_REVIEW_PROMPT;
    
    try {
        const content = readFileSync(promptPath, 'utf8');

        return content || DEFAULT_REVIEW_PROMPT;
    } catch (error) {
        console.warn(`Warning: Could not read review-prompt.md: ${String(error)}`);

        return DEFAULT_REVIEW_PROMPT;
    }
}