import { execSync } from 'node:child_process';
import type { CreatePRRequest } from '../types/CreatePRRequest';
import { GitHubCLIError, GitHubCLIErrorCode } from '../errors';

export async function createPR(request: CreatePRRequest): Promise<string> {
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
    
    // Ensure branch is pushed first
    console.log(`Ensuring branch '${currentBranch}' is pushed...`);
    try {
        execSync(`git push -u origin ${currentBranch}`, {
            encoding: 'utf8',
            stdio: 'pipe'
        });
    } catch {
        console.log('Note: Branch push failed, it may already exist on remote');
    }
    
    // Build PR creation command
    const args: string[] = ['pr', 'create'];
    
    // Add title (required)
    args.push('--title', JSON.stringify(request.title));
    
    // Add body if provided
    if (request.body) {
        args.push('--body', JSON.stringify(request.body));
    }
    
    // Add base branch if provided
    if (request.base_branch) {
        args.push('--base', request.base_branch);
    }
    
    // Add head branch
    args.push('--head', currentBranch);
    
    console.log('Creating pull request...');
    
    try {
        const output = execSync(`gh ${args.join(' ')}`, {
            encoding: 'utf8'
        }).trim();
        
        // The gh pr create command returns the PR URL
        const prUrl = output.split('\n').pop() || output;
        
        console.log(`✅ Pull request created: ${prUrl}`);
        
        return prUrl;
    } catch (error) {
        // Check if PR already exists
        try {
            const existingPrJson = execSync(
                `gh pr list --head ${currentBranch} --json url --limit 1`,
                { encoding: 'utf8' }
            );
            
            const existingPrs = JSON.parse(existingPrJson || '[]');
            if (existingPrs.length > 0) {
                const existingUrl = existingPrs[0].url;
                console.log(`ℹ️ Pull request already exists: ${existingUrl}`);
                
                return existingUrl;
            }
        } catch {
            // Ignore errors checking for existing PR
        }
        
        throw new GitHubCLIError(
            GitHubCLIErrorCode.COMMAND_FAILED,
            `Failed to create pull request: ${String(error)}`,
            error
        );
    }
}