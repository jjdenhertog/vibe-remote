import { listProjects } from '@vibe-remote/vibe-kanban-api/api/projects/listProjects';
import { listTasks } from '@vibe-remote/vibe-kanban-api/api/tasks/listTasks';
import { analyzeProject, ProjectAnalysis } from '@vibe-remote/vibe-kanban-api/utils/taskAnalyzer';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { Task } from '@vibe-remote/vibe-kanban-api/types/api';
import { readAutomationPreferences } from '@vibe-remote/shared-utils/readAutomationPreferences';
import { createTempPromptFile } from '@vibe-remote/shared-utils/createTempPromptFile';
import { runClaudeCommand } from '@vibe-remote/shared-utils/runClaudeCommand';

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
    // Find the task picker prompt template (same pattern as claude-wrapper)

    const currentDir = dirname(new URL(import.meta.url).pathname);
    const templatesDir = join(currentDir, 'claude-wrapper-dist', 'templates');
    const templatePath = join(templatesDir, 'task-picker-prompt.md');

    if (!existsSync(templatePath))
        throw new Error(`Could not find task picker prompt template at ${templatePath}`);

    const promptTemplate = readFileSync(templatePath, 'utf8');
    const preferences = readAutomationPreferences();
    const taskDataJson = JSON.stringify(analysis.tasks, null, 2);

    const prompt = promptTemplate
        .replace('{{PROJECT_ID}}', projectId)
        .replace('{{TASK_DATA}}', taskDataJson)
        .replace('{{BASE_BRANCH}}', preferences.baseBranch);

    const promptFile = createTempPromptFile('task-picker');
    writeFileSync(promptFile, prompt);

    await runClaudeCommand({ promptFile, verbose: false, streamOutput: false });

    if (existsSync(promptFile))
        unlinkSync(promptFile);
}
