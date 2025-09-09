import { makeRequest } from '../http/makeRequest';

export async function directMerge(attemptId: string): Promise<void> {
    await makeRequest<null>(`/api/task-attempts/${encodeURIComponent(attemptId)}/merge`, {
        method: 'POST',
    });
}