import { makeRequest } from '../http/makeRequest';
import { BranchInfo } from '../../types/api';

export async function getProjectBranches(id: string): Promise<BranchInfo[]> {
    const response = await makeRequest<BranchInfo[]>(`/api/projects/${encodeURIComponent(id)}/branches`);

    return response.data;
}