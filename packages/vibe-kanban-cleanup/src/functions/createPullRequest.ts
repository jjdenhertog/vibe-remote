import { VibeKanbanContext } from '../types/VibeKanbanContext.js';
import { VibeKanbanApiResponse } from '../types/VibeKanbanApiResponse.js';

export async function createPullRequest(vibeContext: VibeKanbanContext): Promise<string> {
    try {
        const pullRequestUrl = `${vibeContext.apiBaseUrl}/api/task-attempts/${vibeContext.taskAttempt.id}/pr`;

        const requestBody = {
            title: 'test',
            body: vibeContext.task.description,
            base_branch: vibeContext.taskAttempt.base_branch
        };

        const response = await fetch(pullRequestUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
            console.error('Response:', errorData);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json() as VibeKanbanApiResponse<string>;

        if (!responseData.success) {
            throw new Error(`API error: ${responseData.message || 'Unknown error'}`);
        }

        return responseData.data;

    } catch (error) {
        console.error(`❌ PR creation failed:`, error);
        throw error;
    }
}