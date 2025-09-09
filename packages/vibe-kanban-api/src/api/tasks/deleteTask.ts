import { makeRequest } from '../http/makeRequest';

export async function deleteTask(taskId: string): Promise<void> {
    await makeRequest<null>(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'DELETE',
    });
}