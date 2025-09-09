import type { FollowUpRequest } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export async function followUpTaskAttempt(attemptId: string, request: FollowUpRequest): Promise<void> {
    await makeRequest<null>(`/api/task-attempts/${encodeURIComponent(attemptId)}/follow-up`, {
        method: 'POST',
        body: JSON.stringify(request),
    });
}