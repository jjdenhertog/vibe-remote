import type { Task } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export async function listTasks(projectId: string): Promise<Task[]> {
    const response = await makeRequest<Task[]>(`/api/tasks?project_id=${encodeURIComponent(projectId)}`);

    return response.data;
}