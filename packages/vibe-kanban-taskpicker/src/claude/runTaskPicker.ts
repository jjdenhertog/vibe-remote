import { listProjects } from '@vibe-remote/vibe-kanban-api/api/projects/listProjects';
import { listTasks } from '@vibe-remote/vibe-kanban-api/api/tasks/listTasks';
import { analyzeProject, ProjectAnalysis } from '@vibe-remote/vibe-kanban-api/utils/taskAnalyzer';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { Task } from '@vibe-remote/vibe-kanban-api/types/api';
import { readAutomationPreferences } from '../utils/readAutomationPreferences';

export async function runTaskPicker(): Promise<void> {
    try {
        console.log('[TaskPicker] Starting task analysis...');

        // Fetch projects from API
        const projects = await listProjects();
        const [project] = projects;
        if (!project)
            throw new Error('No project found. Cannot proceed with task picking.');

        console.log(`[TaskPicker] Using project: ${project.name} (${project.id})`);
        const tasks = await listTasks(project.id);
        const analysis = analyzeProject(project.id, tasks);

        // Check if we should stop (tasks in review or in progress)
        if (analysis.shouldStop) {
            console.log(`[TaskPicker] STOPPING: ${analysis.stopReason}`);
            console.log('[TaskPicker] Tasks in review:', analysis.inReviewTasks.map((t: Task) => `${t.id}: ${t.title}`));
            console.log('[TaskPicker] Tasks in progress:', analysis.inProgressTasks.map((t: Task) => `${t.id}: ${t.title}`));

            return;
        }

        // Run Claude with pre-analyzed task data
        await runClaudeTaskSelection(analysis, project.id);
    } catch (error) {
        console.error('[TaskPicker] Error during task picking:', error);
        throw error;
    }
}

async function runClaudeTaskSelection(analysis: ProjectAnalysis, projectId: string): Promise<void> {
    return new Promise((resolvePromise, reject) => {
        // Find the task picker prompt template (same pattern as claude-wrapper)
        const currentDir = dirname(new URL(import.meta.url).pathname);
        const templatePath = join(currentDir, 'vibe-kanban-taskpicker-dist', 'templates', 'task-picker-prompt.md');

        let promptTemplate: string;

        try {
            promptTemplate = readFileSync(templatePath, 'utf8');
        } catch (error) {
            reject(new Error(`Failed to read template file at ${templatePath}: ${error instanceof Error ? error.message : String(error)}`));

            return;
        }

        // Read automation preferences to get the base branch
        const preferences = readAutomationPreferences();
        
        // Prepare task data for the prompt - just pass the raw tasks, let Claude decide
        const taskDataJson = JSON.stringify(analysis.tasks, null, 2);

        const prompt = promptTemplate
            .replace('{{PROJECT_ID}}', projectId)
            .replace('{{TASK_DATA}}', taskDataJson)
            .replace('{{BASE_BRANCH}}', preferences.baseBranch);

        const tempPromptPath = `${mkdtempSync(join(process.cwd(), 'task-picker-prompt.'))}.md`;
        writeFileSync(tempPromptPath, prompt);

        // Prepare Claude arguments
        const claudeArgs = [
            '-p', `Read and execute the instructions in this file: ${tempPromptPath}`,
            '--dangerously-skip-permissions'
        ];

        console.log('[TaskPicker] Starting Claude task selection...');
        const claude = spawn('claude', claudeArgs, { stdio: ['inherit', 'pipe', 'pipe'] });
        claude.stdout.on('data', (data) => { process.stdout.write(data); });
        claude.stderr.on('data', (data) => { process.stderr.write(data); });

        claude.on('close', (code) => {
            // Clean up temp file
            try {
                unlinkSync(tempPromptPath);
            } catch (error) {
                console.error('[TaskPicker] Failed to clean up temp file:', error);
            }

            if (code === 0) {
                console.log('[TaskPicker] Claude task selection completed successfully');
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
