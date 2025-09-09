import type { BasicTask } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export async function getTask(taskId: string): Promise<BasicTask> {
    const response = await makeRequest<BasicTask>(`/api/tasks/${encodeURIComponent(taskId)}`);

    return response.data;
}