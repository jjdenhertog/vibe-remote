import type { ApiConfig } from '../../types/api';

const globalConfig: ApiConfig = {
    baseUrl: 'http://localhost:9091',
    timeout: 30_000
};

export function getGlobalConfig(): ApiConfig {
    return globalConfig;
}