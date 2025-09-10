import { existsSync, readFileSync } from 'node:fs';

/**
 * Reads a prompt template from the specified file path
 * @param templatePath - The path to the template file
 * @param templateName - The name of the template (for logging)
 * @returns The template content or null if not found or error
 */
export function readPromptTemplate(templatePath: string, templateName: string): string | null {
    if (!existsSync(templatePath)) {
        return null;
    }

    try {
        return readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.warn(`Warning: Could not read ${templateName}: ${String(error)}`);

        return null;
    }
}

/**
 * Reads the auto-merge prompt template from the expected location
 * @returns The template content or null if not found
 */
export function readAutoMergePromptTemplate(): string | null {
    const templatePath = '/workspace/data/preferences/auto-merge-prompt.md';

    return readPromptTemplate(templatePath, 'auto-merge-prompt.md');
}