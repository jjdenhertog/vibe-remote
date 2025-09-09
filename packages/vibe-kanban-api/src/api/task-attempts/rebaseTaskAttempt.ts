import { makeRequest } from '../http/makeRequest';

export type RebaseTaskAttemptRequest = {
    new_base_branch?: string | null;
}

export async function rebaseTaskAttempt(attemptId: string, request?: RebaseTaskAttemptRequest): Promise<void> {
    await makeRequest<null>(`/api/task-attempts/${encodeURIComponent(attemptId)}/rebase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request || {})
    });
}