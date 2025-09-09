import type { BasicTask, CreateTaskRequest } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export async function createTask(request: CreateTaskRequest): Promise<BasicTask> {
    const response = await makeRequest<BasicTask>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(request),
    });

    return response.data;
}