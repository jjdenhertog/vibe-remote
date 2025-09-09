import type { Project } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export async function listProjects(): Promise<Project[]> {
    const response = await makeRequest<Project[]>('/api/projects');

    return response.data;
}