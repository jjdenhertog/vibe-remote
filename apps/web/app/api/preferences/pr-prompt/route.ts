import { createTextPreferenceRoute } from '@vibe-remote/shared-utils/route-factory';

const DEFAULT_PR_PROMPT = `Your goal is to code review the current project before a PR is being created.

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

const { GET, POST } = createTextPreferenceRoute({
    fileName: 'pr-prompt.md',
    defaultContent: DEFAULT_PR_PROMPT,
    displayName: 'PR prompt'
});

export { GET, POST };