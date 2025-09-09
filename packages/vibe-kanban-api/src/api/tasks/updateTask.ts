import type { BasicTask, TaskStatus } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export type UpdateTaskRequest = {
    title?: string | null;
    description?: string | null;
    status?: TaskStatus;
    parent_task_attempt?: string | null;
    image_ids?: string[] | null;
};

export async function updateTask(taskId: string, taskData: UpdateTaskRequest): Promise<BasicTask> {
    const response = await makeRequest<BasicTask>(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    });
    
    return response.data;
}