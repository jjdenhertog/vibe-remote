import type { ApiResponse } from '../../types/api';
import { getApiConfig } from '../config/getApiConfig';

export async function makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {

    const config = getApiConfig();
    const url = `${config.baseUrl}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const data = await response.json() as ApiResponse<T>;
    if (!data.success)
        throw new Error(`API Error: ${data.message || 'Unknown error'}`);

    return data;
}