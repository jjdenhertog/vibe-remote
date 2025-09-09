import type { Project } from '../../types/api';
import { makeRequest } from '../http/makeRequest';

export async function getProject(id: string): Promise<Project> {
    const response = await makeRequest<Project>(`/api/projects/${encodeURIComponent(id)}`);

    return response.data;
}