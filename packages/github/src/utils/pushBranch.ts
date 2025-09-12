import { execSync } from 'node:child_process';
import { checkGitHubCLI } from './checkGitHubCLI';
import { isAuthenticated } from './isAuthenticated';

export async function pushBranch(currentBranch: string): Promise<void> {
    if(!checkGitHubCLI())
        throw new Error('GitHub CLI not installed. Please install it from https://cli.github.com/');
        
    if(!isAuthenticated())
        throw new Error('GitHub CLI not authenticated. Please run: gh auth login');
    
    // Get current branch name
    console.log(`Pushing branch '${currentBranch}' to GitHub...`);
    
    try {
        // Push with upstream tracking
        execSync(`git push -u origin ${currentBranch}`, {
            encoding: 'utf8',
            stdio: 'inherit' // Show git output to user
        });
        
        console.log(`✅ Successfully pushed '${currentBranch}' to GitHub`);
    } catch (error) {
        throw new Error(`Failed to push branch: ${String(error)}`);
    }
}