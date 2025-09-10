import type { ContainerInfo } from '../../types/api.js';
import { makeRequest } from '../http/makeRequest.js';

export async function getInfo(containerRef: string): Promise<ContainerInfo> {
    const queryParams = new URLSearchParams({
        ref: containerRef
    });
    
    const response = await makeRequest<ContainerInfo>(`/api/containers/info?${queryParams}`, {
        method: 'GET'
    });

    return response.data;
}