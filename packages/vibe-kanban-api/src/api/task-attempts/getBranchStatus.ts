import type { BranchStatus } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export async function getBranchStatus(attemptId: string): Promise<BranchStatus> {
    const response = await makeRequest<BranchStatus>(`/api/task-attempts/${encodeURIComponent(attemptId)}/branch-status`);

    return response.data;
}