import type { TaskAttempt } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export async function getTaskAttempt(attemptId: string): Promise<TaskAttempt> {
    const response = await makeRequest<TaskAttempt>(`/api/task-attempts/${encodeURIComponent(attemptId)}`);

    return response.data;
}