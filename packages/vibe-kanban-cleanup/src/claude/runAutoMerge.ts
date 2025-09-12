import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { getTaskAttempt } from '@vibe-remote/vibe-kanban-api/api/task-attempts/getTaskAttempt';
import { getTask } from '@vibe-remote/vibe-kanban-api/api/tasks/getTask';
import { createTempPromptFile } from '@vibe-remote/shared-utils/createTempPromptFile';
import { prependContextToPrompt } from '@vibe-remote/shared-utils/prependContextToPrompt';
import { processTemplate } from '@vibe-remote/shared-utils/processTemplate';
import { readAutomergePrompt } from '@vibe-remote/shared-utils/readAutomergePrompt';
import { readPreferenceFiles } from '@vibe-remote/shared-utils/readPreferenceFiles';
import { runClaudeCommand } from '@vibe-remote/shared-utils/runClaudeCommand';
/**
 * Executes Claude command with the given prompt file
 */

export async function runAutoMerge(attemptId: string): Promise<void> {
    let promptFile: string | null = null;

    try {
        // Get task data from vibe-kanban API
        const taskAttempt = await getTaskAttempt(attemptId);
        if (!taskAttempt)
            throw new Error(`Task attempt not found for ID: ${attemptId}`);

        const task = await getTask(taskAttempt.task_id);
        if (!task?.title || !task?.description)
            throw new Error(`Task not found for ID: ${taskAttempt.task_id}`);

        // Get project context
        const preferenceContext = readPreferenceFiles();
        const promptTemplate = readAutomergePrompt();

        // Process template with context
        const processedPrompt = processTemplate(promptTemplate, {
            taskId: task.id,
            projectId: task.project_id,
            taskTitle: task.title,
            taskDescription: task.description,
        });

        const enhancedPrompt = prependContextToPrompt(processedPrompt, preferenceContext);
        // Create temporary file for the prompt
        promptFile = createTempPromptFile('auto-merge');
        writeFileSync(promptFile, enhancedPrompt, 'utf8');

        console.log(`📝 Created temporary prompt file: ${promptFile}`);
        console.log(`🤖 Executing Claude auto-merge decision...`);
        console.log(`🎯 Claude will analyze local worktree changes against task requirements`);

        // Execute Claude command
        await runClaudeCommand({ promptFile, showProgress: true });

        console.log(`✅ Auto-merge decision process completed`);
        console.log(`📋 Note: Check above output for Claude's merge decision and actions`);

    } catch (error) {
        console.error(`❌ Auto-merge execution failed:`, error);
        throw error;
    } finally {
        if (promptFile && existsSync(promptFile)) 
            unlinkSync(promptFile);
    }
}