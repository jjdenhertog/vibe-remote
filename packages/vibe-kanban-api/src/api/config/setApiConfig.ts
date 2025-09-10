import type { ApiConfig } from '../../types/api';

let globalConfig: ApiConfig = {
    baseUrl: 'http://localhost:9091',
    timeout: 10_000
};

export function setApiConfig(config: Partial<ApiConfig>): void {
    globalConfig = { ...globalConfig, ...config };
}

export function getGlobalConfig(): ApiConfig {
    return globalConfig;
}