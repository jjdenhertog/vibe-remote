import { executeCommand } from './executeCommand';
import { ensureAuth } from './checkAuth';

export type MergeMethod = 'merge' | 'squash' | 'rebase';

export async function mergePullRequest(
    prNumberOrUrl?: string | number,
    options?: {
        method?: MergeMethod;
        deleteLocalBranch?: boolean;
        deleteRemoteBranch?: boolean;
        body?: string;
    }
): Promise<void> {
    // Ensure we're authenticated
    await ensureAuth();
    
    const args = ['pr', 'merge'];
    
    // If PR number/URL is provided, add it
    if (prNumberOrUrl) {
        args.push(prNumberOrUrl.toString());
    }
    
    // Add merge method (default to squash)
    const method = options?.method || 'squash';
    args.push(`--${method}`);
    
    // Add merge body if provided
    if (options?.body) {
        args.push('--body', options.body);
    } else {
        args.push('--body', 'Auto-merged by @vibe-remote/github');
    }
    
    // Handle branch deletion
    if (options?.deleteRemoteBranch !== false) {
        args.push('--delete-branch');
    }
    
    await executeCommand('gh', args);
    
    console.log(`✅ Successfully merged PR using ${method} method`);
    
    // Delete local branch if requested
    if (options?.deleteLocalBranch) {
        try {
            const currentBranch = await executeCommand('git', ['branch', '--show-current']);
            
            // Switch to main branch first
            await executeCommand('git', ['checkout', 'main']);
            
            // Delete the local branch
            await executeCommand('git', ['branch', '-D', currentBranch.trim()]);
            
            console.log(`✅ Deleted local branch: ${currentBranch.trim()}`);
        } catch (error) {
            console.warn('Could not delete local branch:', error);
        }
    }
}