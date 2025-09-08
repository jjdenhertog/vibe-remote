import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { processTemplate } from '../utils/processTemplate.js';
import { runClaudeCommand } from '../command/runClaudeCommand.js';

type ExecutePhaseOptions = {
    scriptDir: string;
    templateFile: string;
    prompt: string;
    promptFile: string;
    outputLabel?: string;
};

export async function executePhase({ scriptDir, templateFile, prompt, promptFile, outputLabel }: ExecutePhaseOptions): Promise<void> {
    if (outputLabel) {
        console.error(`${outputLabel}...`);
    }

    const templatePath = join(scriptDir, templateFile);
    const templateContent = readFileSync(templatePath, 'utf8');
    const finalContent = processTemplate(templateContent, prompt);
    writeFileSync(promptFile, finalContent);

    await runClaudeCommand(promptFile);
}