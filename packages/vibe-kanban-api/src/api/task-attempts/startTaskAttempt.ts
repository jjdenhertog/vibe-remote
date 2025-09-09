import type { TaskAttempt, CreateTaskAttemptRequest } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export async function startTaskAttempt(request: CreateTaskAttemptRequest): Promise<TaskAttempt> {
    const response = await makeRequest<TaskAttempt>('/api/task-attempts', {
        method: 'POST',
        body: JSON.stringify(request),
    });

    return response.data;
}