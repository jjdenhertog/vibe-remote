import { getBranchStatus as getGitHubBranchStatus } from '@vibe-remote/github';
import type { BranchStatus } from '@vibe-remote/vibe-kanban-api/types/api';

/**
 * Get branch status using GitHub CLI instead of API
 * This function wraps the GitHub CLI implementation to match the API interface
 */
export async function getBranchStatusCLI(attemptId: string): Promise<BranchStatus> {
    // The CLI version doesn't need attemptId since it works with the current git repository
    // We include it in the signature for compatibility
    console.log(`🔍 Getting branch status for attempt: ${attemptId} (using GitHub CLI)`);
    
    try {
        const status = await getGitHubBranchStatus();
        
        // The GitHub CLI version returns the same structure as the API
        return status as BranchStatus;
    } catch (error) {
        console.error('❌ Failed to get branch status via CLI:', error);
        throw new Error(`GitHub CLI branch status failed: ${String(error)}`);
    }
}