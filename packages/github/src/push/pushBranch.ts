import { execSync } from 'node:child_process';
import { GitHubCLIError, GitHubCLIErrorCode } from '../errors';

export async function pushBranch(): Promise<void> {
    try {
        // Ensure we're authenticated with GitHub CLI
        execSync('gh auth status', { encoding: 'utf8' });
    } catch (error) {
        throw new GitHubCLIError(
            GitHubCLIErrorCode.NOT_AUTHENTICATED,
            'GitHub CLI not authenticated. Please run: gh auth login',
            error
        );
    }
    
    // Get current branch name
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    
    if (!currentBranch) {
        throw new GitHubCLIError(
            GitHubCLIErrorCode.BRANCH_NOT_FOUND,
            'No current branch found'
        );
    }
    
    console.log(`Pushing branch '${currentBranch}' to GitHub...`);
    
    try {
        // Push with upstream tracking
        execSync(`git push -u origin ${currentBranch}`, {
            encoding: 'utf8',
            stdio: 'inherit' // Show git output to user
        });
        
        console.log(`✅ Successfully pushed '${currentBranch}' to GitHub`);
    } catch (error) {
        throw new GitHubCLIError(
            GitHubCLIErrorCode.PUSH_FAILED,
            `Failed to push branch: ${String(error)}`,
            error
        );
    }
}