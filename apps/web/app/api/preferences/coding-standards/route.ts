import { createTextPreferenceRoute } from '@vibe-remote/shared-utils/route-factory';

const DEFAULT_CODING_STANDARDS = `# Coding Standards

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
`;

const { GET, POST } = createTextPreferenceRoute({
    fileName: 'coding-standards.md',
    defaultContent: DEFAULT_CODING_STANDARDS,
    displayName: 'coding standards'
});

export { GET, POST };