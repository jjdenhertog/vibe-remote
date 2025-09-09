import type { ApiConfig } from '../../types/api';
import { getGlobalConfig } from './setApiConfig';

export function getApiConfig(): ApiConfig {
    const globalConfig = getGlobalConfig();
    
    // Allow environment variable to override the base URL
    const envBaseUrl = process.env.VIBE_KANBAN_API_URL;
    
    return {
        ...globalConfig,
        baseUrl: envBaseUrl || globalConfig.baseUrl
    };
}