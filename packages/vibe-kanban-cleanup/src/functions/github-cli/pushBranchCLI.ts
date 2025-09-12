import { pushBranch as pushGitHubBranch } from '@vibe-remote/github';

/**
 * Push branch using GitHub CLI instead of API
 * This function wraps the GitHub CLI implementation to match the API interface
 */
export async function pushBranchCLI(attemptId: string): Promise<void> {
    // The CLI version doesn't need attemptId since it works with the current git repository
    console.log(`📤 Pushing branch for attempt: ${attemptId} (using GitHub CLI)`);
    
    try {
        await pushGitHubBranch();
        console.log('✅ Successfully pushed branch via GitHub CLI');
    } catch (error) {
        console.error('❌ Failed to push branch via CLI:', error);
        throw new Error(`GitHub CLI push failed: ${String(error)}`);
    }
}