#!/usr/bin/env node

import { unlinkSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { readStdin } from './utils/readStdin.js';
import { executePhase } from './execution/executePhase.js';
import { runClaudeCommand } from './command/runClaudeCommand.js';
import { readPreferenceFiles, prependContextToPrompt, readAutomationPreferences, readPRPromptTemplate, generateCodeReviewPrompt } from './utils/readPreferences.js';

class ClaudeFlowWrapper {
    private promptFile: string = '';
    private readonly scriptDir: string;
    private originalPrompt: string = '';

    public constructor() {
        // Templates are copied to dist/templates/ during build
        const currentDir = dirname(new URL(import.meta.url).pathname);
        this.scriptDir = join(currentDir, 'templates');
    }

    public async run(): Promise<void> {
        try {
            let prompt = '';
            if (!process.stdin.isTTY) {
                prompt = await readStdin();
            }

            if (!prompt.trim()) {
                console.error('No prompt provided via stdin');
                process.exit(1);
            }

            // Store original prompt for code review
            this.originalPrompt = prompt;

            // Read preference files and enhance the prompt with context
            const preferenceContext = readPreferenceFiles();
            const enhancedPrompt = prependContextToPrompt(prompt, preferenceContext);

            this.promptFile = this.createTempPromptFile();

            await executePhase({
                scriptDir: this.scriptDir,
                templateFile: 'claude-flow-prompt.md',
                prompt: enhancedPrompt,
                promptFile: this.promptFile
            });

            // Check if code review is enabled and execute it
            await this.executeCodeReviewIfEnabled();

        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        } finally {
            if (this.promptFile) {
                try {
                    unlinkSync(this.promptFile);
                } catch {
                    // Ignore cleanup errors
                }
            }
            // Note: We don't cleanup prBodyFile here as it's used by vibe-kanban-cleanup
        }
    }

    private createTempPromptFile(): string {
        return `${mkdtempSync(join(process.cwd(), 'claude-flow-prompt.'))}.md`;
    }

    private async executeCodeReviewIfEnabled(): Promise<void> {
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

        console.error('🔍 Starting code review process...');

        // Generate code review prompt
        const codeReviewPrompt = generateCodeReviewPrompt(this.originalPrompt, prPromptTemplate);

        // Create a new temp file for code review
        const codeReviewPromptFile = this.createTempPromptFile();

        try {
            // Write the code review prompt directly to file (no template processing)
            writeFileSync(codeReviewPromptFile, codeReviewPrompt);

            // Call Claude directly for code review
            await runClaudeCommand(codeReviewPromptFile);

            console.error('✅ Code review completed');
        } finally {
            // Clean up code review prompt file
            try {
                unlinkSync(codeReviewPromptFile);
            } catch {
                // Ignore cleanup errors
            }
        }
    }

}

// Execute if this file is run directly
const wrapper = new ClaudeFlowWrapper();
await wrapper.run();