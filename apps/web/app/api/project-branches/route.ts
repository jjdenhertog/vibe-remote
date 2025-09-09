import { NextResponse } from 'next/server';

const VIBE_KANBAN_BASE_URL = 'http://localhost:9091';

export async function GET() {
    try {
        // Fetch projects directly from the API
        const projectsResponse = await fetch(`${VIBE_KANBAN_BASE_URL}/api/projects`);
        if (!projectsResponse.ok) {
            throw new Error(`Failed to fetch projects: ${projectsResponse.statusText}`);
        }
        
        const projectsData = await projectsResponse.json();
        const projects = projectsData.data;
        
        if (!projects || projects.length === 0) {
            return NextResponse.json({ error: 'No projects found' }, { status: 404 });
        }
        
        const [project] = projects;
        
        // Fetch branches for the project
        const branchesResponse = await fetch(`${VIBE_KANBAN_BASE_URL}/api/projects/${encodeURIComponent(project.id)}/branches`);
        if (!branchesResponse.ok) {
            throw new Error(`Failed to fetch branches: ${branchesResponse.statusText}`);
        }
        
        const branchesData = await branchesResponse.json();
        const branches = branchesData.data;
        
        return NextResponse.json({
            projectId: project.id,
            projectName: project.name,
            branches
        });
    } catch (error) {
        console.error('Error fetching project branches:', error);

        return NextResponse.json(
            { error: 'Failed to fetch project branches' }, 
            { status: 500 }
        );
    }
}