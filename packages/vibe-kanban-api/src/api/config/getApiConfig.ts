import type { ApiConfig } from '../../types/api';
import { getGlobalConfig } from './setApiConfig';

export function getApiConfig(): ApiConfig {
    return getGlobalConfig();
}