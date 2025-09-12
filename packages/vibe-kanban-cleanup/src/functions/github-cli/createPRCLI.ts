import { createPR as createGitHubPR } from '@vibe-remote/github/createPR';
import type { CreatePRRequest } from '@vibe-remote/vibe-kanban-api/types/api';

/**
 * Create PR using GitHub CLI instead of API
 * This function wraps the GitHub CLI implementation to match the API interface
 */
export async function createPRCLI(attemptId: string, request: CreatePRRequest): Promise<string> {
    // The CLI version doesn't need attemptId since it works with the current git repository
    console.log(`📝 Creating PR for attempt: ${attemptId} (using GitHub CLI)`);
    
    try {
        const prRequest: Parameters<typeof createGitHubPR>[0] = {
            title: request.title
        };
        
        if (request.body) {
            prRequest.body = request.body;
        }
        
        if (request.base_branch) {
            prRequest.base_branch = request.base_branch;
        }
        
        const prUrl = await createGitHubPR(prRequest);
        
        console.log(`✅ PR created via GitHub CLI: ${prUrl}`);

        return prUrl;
    } catch (error) {
        console.error('❌ Failed to create PR via CLI:', error);
        throw new Error(`GitHub CLI PR creation failed: ${String(error)}`);
    }
}