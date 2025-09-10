import { readPromptTemplate } from '@vibe-remote/shared-utils/prompt-utils';

export function readPRPromptTemplate(): string | null {
    const prPromptPath = '/workspace/data/preferences/pr-prompt.md';

    return readPromptTemplate(prPromptPath, 'pr-prompt.md');
}
