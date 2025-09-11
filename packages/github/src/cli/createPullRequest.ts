import { executeCommand } from './executeCommand';
import { ensureAuth } from './checkAuth';
import { pushBranch } from './pushBranch';
import { getExistingPullRequest } from './listPullRequests';
import type { CreatePullRequestOptions } from '../types/PullRequest';
import { GitHubCLIError } from '../types/GitHubError';

export async function createPullRequest(options: CreatePullRequestOptions): Promise<string> {
    // Ensure we're authenticated
    await ensureAuth();
    
    // Get current branch if not specified
    const headBranch = options.headBranch || await executeCommand('git', ['branch', '--show-current']);
    const baseBranch = options.baseBranch || 'main';
    
    // Check if PR already exists
    const existingPR = await getExistingPullRequest(headBranch);
    if (existingPR) {
        console.log(`✅ Found existing PR: ${existingPR.url} (status: ${existingPR.state})`);
        
        // Push any new commits
        await pushBranch(headBranch);
        
        return existingPR.url;
    }
    
    // Push branch before creating PR
    await pushBranch(headBranch);
    
    // Build gh pr create command
    const args = [
        'pr', 'create',
        '--title', options.title,
        '--base', baseBranch,
        '--head', headBranch.trim()
    ];
    
    if (options.body) {
        args.push('--body', options.body);
    }
    
    if (options.draft) {
        args.push('--draft');
    }
    
    try {
        const output = await executeCommand('gh', args);
        
        // Extract URL from output
        const urlMatch = /https:\/\/github\.com\/\S+/.exec(output);
        if (urlMatch) {
            console.log(`✅ PR created: ${urlMatch[0]}`);

            return urlMatch[0];
        }
        
        throw new GitHubCLIError('Could not extract PR URL from output', 'COMMAND_FAILED');
    } catch (error) {
        if (error instanceof GitHubCLIError) {
            throw error;
        }
        
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('already exists')) {
            throw new GitHubCLIError(
                'A pull request already exists for this branch',
                'PR_ALREADY_EXISTS'
            );
        }
        
        throw new GitHubCLIError(
            `Failed to create PR: ${errorMessage}`,
            'COMMAND_FAILED'
        );
    }
}