import { makeRequest } from '../http/makeRequest';

export async function pushBranch(attemptId: string): Promise<void> {
    await makeRequest<null>(`/api/task-attempts/${encodeURIComponent(attemptId)}/push`, {
        method: 'POST'
    });
}