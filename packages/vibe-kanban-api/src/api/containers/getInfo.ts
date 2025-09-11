import type { ContainerInfo } from '../../types/api.js';
import { makeRequest } from '../http/makeRequest.js';

export async function getInfo(ref: string): Promise<ContainerInfo> {
    const queryParams = new URLSearchParams({ ref });

    const response = await makeRequest<ContainerInfo>(`/api/containers/info?${queryParams.toString()}`, { method: 'GET' });

    return response.data;
}