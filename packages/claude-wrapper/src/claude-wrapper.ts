#!/usr/bin/env node

import { runClaudeCommand } from './command/runClaudeCommand';
import { readPRPromptTemplate } from './utils/readPRPromptTemplate';
import { readAutomationPreferences } from './utils/readAutomationPreferences';
import { prependContextToPrompt } from './utils/prependContextToPrompt';
import { readPreferenceFiles } from './utils/readPreferenceFiles';
import { readStdin } from './utils/readStdin';
import { existsSync, mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';

function createTempPromptFile(): string {
    return `${mkdtempSync(join(process.cwd(), 'claude-flow-prompt.'))}.md`;
}

function parseArgs(): { useFlow: boolean; usePlan: boolean } {
    const args = new Set(process.argv.slice(2));

    return {
        useFlow: args.has('--flow'),
        usePlan: args.has('--plan')
    };
}

function runClaudeFlowInit(): Promise<void> {
    return new Promise((resolve, reject) => {
        const claudeFlow = spawn('npx', ['-y', 'claude-flow@alpha', 'init', '--force'], {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        claudeFlow.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`claude-flow init exited with code ${code}`));
            }
        });

        claudeFlow.on('error', (error) => {
            reject(error);
        });
    });
}

async function executeCodeReviewIfEnabled(originalPrompt: string): Promise<void> {
    const automationPreferences = readAutomationPreferences();

    if (!automationPreferences.doCodeReviewBeforeFinishing) {
        console.error('⏭️ Code review skipped (doCodeReviewBeforeFinishing is disabled in preferences)');

        return;
    }

    const prPromptTemplate = readPRPromptTemplate();
    if (!prPromptTemplate) {
        console.error('⚠️ Code review enabled but pr-prompt.md not found, skipping code review');

        return;
    }

    console.log('🔍 Starting code review process...');

    const codeReviewPrompt = `\n\nThe following task was executed:\n\n${originalPrompt}${prPromptTemplate}`;
    const codeReviewPromptFile = createTempPromptFile();

    writeFileSync(codeReviewPromptFile, codeReviewPrompt);
    await runClaudeCommand(codeReviewPromptFile);
    console.log('✅ Code review completed');

    if (existsSync(codeReviewPromptFile))
        unlinkSync(codeReviewPromptFile);
}

async function main(): Promise<void> {
    let promptFile = '';

    try {
        const { useFlow, usePlan } = parseArgs();
        
        let prompt = '';
        if (!process.stdin.isTTY)
            prompt = await readStdin();

        if (!prompt.trim()) {
            console.error('No prompt provided via stdin');
            process.exit(1);
        }

        const preferenceContext = readPreferenceFiles();
        const enhancedPrompt = prependContextToPrompt(prompt, preferenceContext);

        promptFile = createTempPromptFile();

        if (useFlow) {
            // Run claude-flow init before processing when --flow is used
            // eslint-disable-next-line no-console
            console.log('🔄 Initializing claude-flow...');
            await runClaudeFlowInit();

            // Use claude-flow-prompt.md template only when --flow is specified
            const currentDir = dirname(new URL(import.meta.url).pathname);
            const scriptDir = join(currentDir, 'templates');
            const templatePath = join(scriptDir, 'claude-flow-prompt.md');
            const templateContent = readFileSync(templatePath, 'utf8');
            const finalContent = templateContent.replace(/%REPLACE_WITH_PROMPT%/g, enhancedPrompt);
            writeFileSync(promptFile, finalContent);
        } else if (usePlan) {
            // Use claude-plan-prompt.md template when --plan is specified
            const currentDir = dirname(new URL(import.meta.url).pathname);
            const scriptDir = join(currentDir, 'templates');
            const templatePath = join(scriptDir, 'claude-plan-prompt.md');
            const templateContent = readFileSync(templatePath, 'utf8');
            const finalContent = templateContent.replace(/%REPLACE_WITH_PROMPT%/g, enhancedPrompt);
            writeFileSync(promptFile, finalContent);
        } else {
            // Without --flow or --plan, write the enhanced prompt directly without template
            writeFileSync(promptFile, enhancedPrompt);
        }

        await runClaudeCommand(promptFile);
        
        // Skip code review when --plan is used
        if (!usePlan) {
            await executeCodeReviewIfEnabled(prompt);
        }

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }

    if (promptFile && existsSync(promptFile))
        unlinkSync(promptFile);
}

await main();