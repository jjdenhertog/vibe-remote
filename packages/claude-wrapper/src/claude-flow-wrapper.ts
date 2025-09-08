#!/usr/bin/env node

import { unlinkSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { readStdin } from './utils/readStdin.js';
import { parseArguments } from './utils/parseArguments.js';
import { executePhase } from './execution/executePhase.js';

class ClaudeFlowWrapper {
    private promptFile: string = '';
    private prBodyFile: string = '';
    private readonly scriptDir: string;

    public constructor() {
        // Templates are copied to dist/templates/ during build
        const currentDir = dirname(new URL(import.meta.url).pathname);
        this.scriptDir = join(currentDir, 'templates');
    }

    private createTempPromptFile(): string {
        return `${mkdtempSync(join(process.cwd(), 'claude-flow-prompt.'))}.md`;
    }

    private createPrBodyFile(): string {
        return join(process.cwd(), 'pr_body.md');
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

            const { createPr, review, merge } = parseArguments(process.argv.slice(2));

            this.promptFile = this.createTempPromptFile();
            this.prBodyFile = this.createPrBodyFile();

            // Save the original prompt to pr_body.md for the cleanup script
            writeFileSync(this.prBodyFile, prompt);

            await executePhase({
                scriptDir: this.scriptDir,
                templateFile: 'claude-flow-prompt.md',
                prompt,
                promptFile: this.promptFile
            });

            if (review) {
                await executePhase({
                    scriptDir: this.scriptDir,
                    templateFile: 'claude-review.md',
                    prompt,
                    promptFile: this.promptFile,
                    outputLabel: 'Running review phase'
                });
            }

            if (createPr) {
                await executePhase({
                    scriptDir: this.scriptDir,
                    templateFile: 'claude-auto-pr.md',
                    prompt,
                    promptFile: this.promptFile,
                    outputLabel: 'Creating PR'
                });
            }

            if (merge) {
                await executePhase({
                    scriptDir: this.scriptDir,
                    templateFile: 'claude-assess.md',
                    prompt,
                    promptFile: this.promptFile,
                    outputLabel: 'Assessing for merge decision'
                });
            }

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
}

// Execute if this file is run directly
const wrapper = new ClaudeFlowWrapper();
await wrapper.run();