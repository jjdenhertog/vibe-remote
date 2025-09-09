import type { Task, CreateTaskRequest } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export async function createAndStartTask(request: CreateTaskRequest): Promise<Task> {
    const response = await makeRequest<Task>('/api/tasks/create-and-start', {
        method: 'POST',
        body: JSON.stringify(request),
    });

    return response.data;
}