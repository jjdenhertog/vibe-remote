import type { ApiResponse } from '../../types/api';
import { getApiConfig } from '../config/getApiConfig';

export async function makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const config = getApiConfig();
    const url = `${config.baseUrl}${endpoint}`;
    
    // Add timeout to the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as ApiResponse<T>;
      
        if (!data.success) {
            throw new Error(`API Error: ${data.message || 'Unknown error'}`);
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);
      
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Request timeout after ${config.timeout}ms`);
        }
      
        throw error;
    }
}