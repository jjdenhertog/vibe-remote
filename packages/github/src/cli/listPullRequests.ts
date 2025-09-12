import { executeCommand } from './executeCommand';
import type { PullRequestInfo } from '../types/PullRequest';

export async function listPullRequests(branch?: string): Promise<PullRequestInfo[]> {
    // Get current branch if not specified
    const targetBranch = branch || await executeCommand('git', ['branch', '--show-current']);
    
    try {
        // List PRs for the branch
        const args = [
            'pr', 'list',
            '--head', targetBranch.trim(),
            '--json', 'number,url,state,title,headRefName,baseRefName'
        ];
        
        const output = await executeCommand('gh', args);
        
        if (!output.trim()) {
            return [];
        }
        
        const prs = JSON.parse(output);
        
        return prs.map((pr: any) => ({
            number: pr.number,
            url: pr.url,
            state: pr.state as 'OPEN' | 'MERGED' | 'CLOSED',
            title: pr.title,
            headBranch: pr.headRefName,
            baseBranch: pr.baseRefName
        }));
    } catch (error) {
        console.warn('Failed to list PRs:', error);

        return [];
    }
}

export async function getExistingPullRequest(branch?: string): Promise<PullRequestInfo | null> {
    const prs = await listPullRequests(branch);
    
    // Return the first open PR for this branch
    return prs.find(pr => pr.state === 'OPEN') || null;
}