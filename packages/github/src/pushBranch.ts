import { execSync } from 'node:child_process';

export async function pushBranch(): Promise<void> {
    try {
        // Ensure we're authenticated with GitHub CLI
        execSync('gh auth status', { encoding: 'utf8' });
    } catch {
        throw new Error('GitHub CLI not authenticated. Please run: gh auth login');
    }
    
    // Get current branch name
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    
    if (!currentBranch) {
        throw new Error('No current branch found');
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
        throw new Error(`Failed to push branch: ${String(error)}`);
    }
}