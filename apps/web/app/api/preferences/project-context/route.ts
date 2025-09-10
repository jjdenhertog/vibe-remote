import { createTextPreferenceRoute } from '@vibe-remote/shared-utils/route-factory';

const DEFAULT_PROJECT_CONTEXT = `# Project Context

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
`;

const { GET, POST } = createTextPreferenceRoute({
    fileName: 'project-context.md',
    defaultContent: DEFAULT_PROJECT_CONTEXT,
    displayName: 'project context'
});

export { GET, POST };