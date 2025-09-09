import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export type TaskPickerConfig = {
    projectId: string;
    checkInterval?: number;
}

export type VibeTask = {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'inprogress' | 'inreview' | 'done' | 'cancelled';
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export type VibeProject = {
    id: string;
    name: string;
    description?: string;
}

export async function runTaskPicker(config: TaskPickerConfig): Promise<void> {
    try {
        console.log('[TaskPicker] Starting task analysis with Claude MCP tools...');
        console.log(`[TaskPicker] Project ID: ${config.projectId}`);
        
        // Use Claude with MCP vibe-kanban tools to analyze and pick tasks
        await runClaudeTaskAnalysis(config.projectId);
        
        console.log('[TaskPicker] Task analysis completed successfully');
    } catch (error) {
        console.error('[TaskPicker] Error during task picking:', error);
        throw error;
    }
}

async function runClaudeTaskAnalysis(projectId: string): Promise<void> {
    return new Promise((resolvePromise, reject) => {
        // Create the task picker prompt file
        // Find the package root - assuming we're in dist/claude when compiled
        // and src/claude when in source, both two levels from package root
        const possiblePaths = [
            resolve(process.cwd(), 'templates/task-picker-prompt.md'),
            resolve(process.cwd(), 'packages/vibe-kanban-taskpicker/templates/task-picker-prompt.md'),
            // eslint-disable-next-line unicorn/prefer-module
            resolve(__dirname, '../../templates/task-picker-prompt.md')
        ];
        
        let promptPath = '';
        
        for (const path of possiblePaths) {
            if (existsSync(path)) {
                promptPath = path;
                break;
            }
        }
        
        if (!promptPath) {
            reject(new Error(`Template file not found. Searched paths: ${  possiblePaths.join(', ')}`));

            return;
        }
        
        let promptTemplate: string;
        
        try {
            promptTemplate = readFileSync(promptPath, 'utf8');
        } catch (error) {
            reject(new Error(`Failed to read template file: ${error instanceof Error ? error.message : String(error)}`));

            return;
        }
        
        // Replace the project ID in the template
        const prompt = promptTemplate.replace('{{PROJECT_ID}}', projectId);
        
        // Create a temporary prompt file
        const tempPromptPath = `/tmp/task-picker-prompt-${Date.now()}.md`;
        
        writeFileSync(tempPromptPath, prompt);
        
        // Run Claude with MCP tools enabled
        // Note: Consider removing --dangerously-skip-permissions for production use
        const claudeArgs = [
            '-p', `Read and execute the instructions in this file: ${tempPromptPath}`,
            '--verbose',
            '--output-format=stream-json'
        ];
        
        // Add skip-permissions flag if in development mode
        if (process.env.NODE_ENV === 'development') {
            claudeArgs.push('--dangerously-skip-permissions');
        }
        
        const claude = spawn('claude', claudeArgs, {
            stdio: ['inherit', 'pipe', 'pipe']
        });

        // Stream output directly to console
        claude.stdout.on('data', (data) => {
            process.stdout.write(data);
        });

        claude.stderr.on('data', (data) => {
            process.stderr.write(data);
        });

        claude.on('close', (code) => {
            // Clean up temp file
            try {
                unlinkSync(tempPromptPath);
            } catch (error) {
                console.error('[TaskPicker] Failed to clean up temp file:', error);
            }
            
            if (code === 0) {
                console.log('[TaskPicker] Claude task analysis completed successfully');
                resolvePromise();
            } else {
                reject(new Error(`Claude command exited with code ${code}`));
            }
        });

        claude.on('error', (error) => {
            // Clean up temp file on error
            try {
                unlinkSync(tempPromptPath);
            } catch (cleanupError) {
                console.error('[TaskPicker] Failed to clean up temp file:', cleanupError);
            }
            reject(error);
        });
    });
}

