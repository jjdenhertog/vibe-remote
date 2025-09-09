import type { CreatePRRequest } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export async function createPR(attemptId: string, request: CreatePRRequest): Promise<string> {
    const response = await makeRequest<string>(`/api/task-attempts/${encodeURIComponent(attemptId)}/pr`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    return response.data; // Returns PR URL
}