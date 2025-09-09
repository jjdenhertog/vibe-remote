import { createPR } from '@vibe-remote/vibe-kanban-api/api/task-attempts/createPR';
import { VibeKanbanContext } from '../types/VibeKanbanContext';

export async function createPullRequest(vibeContext: VibeKanbanContext): Promise<string> {
    try {
        const prData = {
            title: 'test',
            body: vibeContext.task.description,
            base_branch: vibeContext.taskAttempt.base_branch
        };

        return await createPR(vibeContext.taskAttempt.id, prData);

    } catch (error) {
        console.error(`❌ PR creation failed:`, error);
        throw error;
    }
}