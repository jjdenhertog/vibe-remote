import { getInfo } from '@vibe-remote/vibe-kanban-api/api/containers/getInfo';
import { getTaskAttempt } from '@vibe-remote/vibe-kanban-api/api/task-attempts/getTaskAttempt';
import { getTask } from '@vibe-remote/vibe-kanban-api/api/tasks/getTask';
import { setApiConfig } from '@vibe-remote/vibe-kanban-api/api/config/setApiConfig';
import { VibeKanbanContext } from '../types/VibeKanbanContext';

export async function fetchVibeKanbanContext(): Promise<VibeKanbanContext> {
    const worktreePath = process.cwd();
    const apiBaseUrl = process.env.VIBE_KANBAN_API_URL || 'http://localhost:9091';

    // Configure the shared API client
    setApiConfig({
        baseUrl: apiBaseUrl,
        timeout: 30_000
    });

    try {
        // Get container info using shared API
        const containerInfo = await getInfo(worktreePath);

        // Get task attempt using shared API
        const taskAttempt = await getTaskAttempt(containerInfo.attempt_id);

        // Get task using shared API
        const task = await getTask(containerInfo.task_id);

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