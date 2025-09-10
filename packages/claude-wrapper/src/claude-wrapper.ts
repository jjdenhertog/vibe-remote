#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { runClaudeCommand } from './command/runClaudeCommand';
import { prependContextToPrompt } from './utils/prependContextToPrompt';
import { readAutomationPreferences } from './utils/readAutomationPreferences';
import { readPreferenceFiles } from './utils/readPreferenceFiles';
import { readPRPromptTemplate } from './utils/readPRPromptTemplate';
import { readStdin } from './utils/readStdin';

function createTempPromptFile(): string {
    return `${mkdtempSync(join(process.cwd(), 'claude-flow-prompt.'))}.md`;
}

function parseArgs(): { useFlow: boolean; usePlan: boolean; isResume: boolean; additionalArgs: string[] } {
    const args = process.argv.slice(2);
    const useFlow = args.includes('--flow');
    const usePlan = args.includes('--plan');

    // Check if this is a session resume - Claude automatically detects this,
    // but we can check for common resume indicators
    const isResume = args.some(arg =>
        arg.includes('--session-id') ||
        arg.includes('--continue') ||
        arg.includes('--resume') ||
        // Check if there's an existing conversation context in the current directory
        existsSync('.claude-conversation') ||
        existsSync('.claude-session')
    );

    // Filter out --flow and --plan, pass everything else to claude
    const additionalArgs = args.filter(arg => arg !== '--flow' && arg !== '--plan');

    return {
        useFlow,
        usePlan,
        isResume,
        additionalArgs
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

async function executeCodeReview(originalPrompt: string, additionalArgs: string[] = []): Promise<void> {

    const prPromptTemplate = readPRPromptTemplate();
    if (!prPromptTemplate) {
        console.error('⚠️ Code review enabled but pr-prompt.md not found, skipping code review');

        return;
    }

    console.log('🔍 Starting code review process...');

    const codeReviewPrompt = `\n\nThe following task was executed:\n\n${originalPrompt}${prPromptTemplate}`;
    const codeReviewPromptFile = createTempPromptFile();

    writeFileSync(codeReviewPromptFile, codeReviewPrompt);
    await runClaudeCommand(codeReviewPromptFile, additionalArgs);
    console.log('✅ Code review completed');

    if (existsSync(codeReviewPromptFile))
        unlinkSync(codeReviewPromptFile);
}

async function main(): Promise<void> {
    let promptFile = '';

    try {
        const { useFlow, usePlan, isResume, additionalArgs } = parseArgs();

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

        if (isResume) {
            writeFileSync(promptFile, prompt);
        } else if (useFlow) {
            // Run claude-flow init before processing when --flow is used (only for new sessions)
            // eslint-disable-next-line no-console
            console.log('🔄 Initializing claude-flow...');
            await runClaudeFlowInit();

            // Use claude-flow-prompt.md template only when --flow is specified and not resuming
            const currentDir = dirname(new URL(import.meta.url).pathname);
            const scriptDir = join(currentDir, 'claude-wrapper-dist', 'templates');
            const templatePath = join(scriptDir, 'claude-flow-prompt.md');
            const templateContent = readFileSync(templatePath, 'utf8');
            const finalContent = templateContent.replace(/%REPLACE_WITH_PROMPT%/g, enhancedPrompt);
            writeFileSync(promptFile, finalContent);

            const automationPreferences = readAutomationPreferences();
            if (automationPreferences.doCodeReviewBeforeFinishing) 
                await executeCodeReview(prompt, additionalArgs);


        } else if (usePlan) {
            // Use claude-plan-prompt.md template only when --plan is specified and not resuming
            const currentDir = dirname(new URL(import.meta.url).pathname);
            const scriptDir = join(currentDir, 'claude-wrapper-dist', 'templates');
            const templatePath = join(scriptDir, 'claude-plan-prompt.md');
            const templateContent = readFileSync(templatePath, 'utf8');
            const finalContent = templateContent.replace(/%REPLACE_WITH_PROMPT%/g, enhancedPrompt);
            writeFileSync(promptFile, finalContent);
        }

        await runClaudeCommand(promptFile, additionalArgs);


    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }

    if (promptFile && existsSync(promptFile))
        unlinkSync(promptFile);
}

await main();