import { ContainerInfo } from '../types/ContainerInfo.js';
import { TaskAttempt } from '../types/TaskAttempt.js';
import { Task } from '../types/Task.js';
import { VibeKanbanApiResponse } from '../types/VibeKanbanApiResponse.js';
import { VibeKanbanContext } from '../types/VibeKanbanContext.js';

export async function fetchVibeKanbanContext(): Promise<VibeKanbanContext> {
    const worktreePath = process.cwd();
    const apiBaseUrl = process.env.VIBE_KANBAN_API_URL || 'http://localhost:9091';

    try {
        const containerInfoUrl = `${apiBaseUrl}/api/containers/info?ref=${encodeURIComponent(worktreePath)}`;
        const containerResponse = await fetch(containerInfoUrl);
        
        if (!containerResponse.ok) {
            throw new Error(`HTTP ${containerResponse.status}: ${containerResponse.statusText}`);
        }

        const containerData = await containerResponse.json() as VibeKanbanApiResponse<ContainerInfo>;
        
        if (!containerData.success) {
            throw new Error(`Container info failed: ${containerData.message || 'Unknown error'}`);
        }

        const containerInfo = containerData.data;

        const taskAttemptUrl = `${apiBaseUrl}/api/task-attempts/${containerInfo.attempt_id}`;
        const taskAttemptResponse = await fetch(taskAttemptUrl);
        
        if (!taskAttemptResponse.ok) {
            throw new Error(`HTTP ${taskAttemptResponse.status}: ${taskAttemptResponse.statusText}`);
        }

        const taskAttemptData = await taskAttemptResponse.json() as VibeKanbanApiResponse<TaskAttempt>;
        
        if (!taskAttemptData.success) {
            throw new Error(`Task attempt failed: ${taskAttemptData.message || 'Unknown error'}`);
        }

        const taskAttempt = taskAttemptData.data;

        const taskUrl = `${apiBaseUrl}/api/tasks/${containerInfo.task_id}`;
        const taskResponse = await fetch(taskUrl);
        
        if (!taskResponse.ok) {
            throw new Error(`HTTP ${taskResponse.status}: ${taskResponse.statusText}`);
        }

        const taskData = await taskResponse.json() as VibeKanbanApiResponse<Task>;
        
        if (!taskData.success) {
            throw new Error(`Task failed: ${taskData.message || 'Unknown error'}`);
        }

        const task = taskData.data;

        return {
            containerInfo,
            taskAttempt,
            task,
            worktreePath,
            apiBaseUrl
        };

    } catch (error) {
        console.error(`❌ Failed to get context:`, error);
        throw error;
    }
}