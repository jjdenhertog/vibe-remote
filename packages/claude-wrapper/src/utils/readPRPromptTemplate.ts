import { existsSync, readFileSync } from "node:fs";

export function readPRPromptTemplate(): string | null {
    const prPromptPath = '/workspace/data/preferences/pr-prompt.md';

    if (!existsSync(prPromptPath)) {
        return null;
    }

    try {
        return readFileSync(prPromptPath, 'utf8');
    } catch (error) {
        console.warn(`Warning: Could not read pr-prompt.md: ${String(error)}`);

        return null;
    }
}
