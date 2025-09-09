import type { ContainerInfo } from '../../types/api.js';
import { makeRequest } from '../http/makeRequest.js';

export async function getInfo(worktreePath: string): Promise<ContainerInfo> {
    const response = await makeRequest<ContainerInfo>('/api/containers/info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ worktree_path: worktreePath })
    });

    return response.data;
}