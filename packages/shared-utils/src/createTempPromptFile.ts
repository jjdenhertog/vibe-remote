import { mkdtempSync } from 'node:fs';
import { join } from 'node:path/posix';

export function createTempPromptFile(prefix: string): string {
    return `${mkdtempSync(join(process.cwd(), `vibe-prompt-${prefix}.md`))}.md`;
}
