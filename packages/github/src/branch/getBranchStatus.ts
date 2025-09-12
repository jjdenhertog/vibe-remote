import { execSync } from 'node:child_process';
import type { BranchStatus, MergeInfo } from '../types/BranchStatus';

export async function getBranchStatus(baseBranch = 'main'): Promise<BranchStatus> {
    const defaultBase = baseBranch;
    
    // Get current branch and HEAD info
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const headOid = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    
    // Get commits ahead/behind
    let commitsAhead = 0;
    let commitsBehind = 0;
    
    try {
        const revList = execSync(
            `git rev-list --left-right --count origin/${defaultBase}...HEAD`,
            { encoding: 'utf8' }
        ).trim();
        
        const [behind, ahead] = revList.split('\t').map(n => parseInt(n, 10));
        commitsBehind = behind || 0;
        commitsAhead = ahead || 0;
    } catch {
        // If comparison fails, default to 0
    }
    
    // Check for uncommitted changes
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
    const statusLines = statusOutput.split('\n').filter(line => line.length > 0);
    const uncommittedCount = statusLines.filter(line => !line.startsWith('?')).length;
    const untrackedCount = statusLines.filter(line => line.startsWith('?')).length;
    const hasUncommittedChanges = uncommittedCount > 0;
    
    // Get PR information
    const merges: MergeInfo[] = [];
    try {
        const prListJson = execSync(
            `gh pr list --head ${currentBranch} --json number,url,state,mergedAt,mergeCommit --limit 10`,
            { encoding: 'utf8' }
        );
        
        const prs = JSON.parse(prListJson || '[]');
        
        for (const pr of prs) {
            const status = pr.state === 'MERGED' ? 'merged' : 
                pr.state === 'CLOSED' ? 'closed' : 'open';
            
            merges.push({
                type: 'pr',
                id: `pr-${pr.number}`,
                task_attempt_id: currentBranch, // Using branch name as attempt ID
                created_at: new Date().toISOString(),
                target_branch_name: defaultBase,
                pr_info: {
                    number: pr.number,
                    url: pr.url,
                    status,
                    merged_at: pr.mergedAt || null,
                    merge_commit_sha: pr.mergeCommit?.oid || null
                }
            });
        }
    } catch {
        // No PRs found or gh CLI not configured
    }
    
    // Check remote branch status
    let remoteCommitsAhead = null;
    let remoteCommitsBehind = null;
    
    try {
        // Fetch latest changes without merging
        execSync('git fetch origin', { encoding: 'utf8' });
        
        const remoteRevList = execSync(
            `git rev-list --left-right --count origin/${defaultBase}...origin/${currentBranch}`,
            { encoding: 'utf8' }
        ).trim();
        
        const [remoteBehind, remoteAhead] = remoteRevList.split('\t').map(n => parseInt(n, 10));
        remoteCommitsBehind = remoteBehind || 0;
        remoteCommitsAhead = remoteAhead || 0;
    } catch {
        // Remote branch might not exist yet
    }
    
    return {
        commits_behind: commitsBehind,
        commits_ahead: commitsAhead,
        has_uncommitted_changes: hasUncommittedChanges,
        head_oid: headOid,
        uncommitted_count: uncommittedCount,
        untracked_count: untrackedCount,
        base_branch_name: defaultBase,
        remote_commits_behind: remoteCommitsBehind,
        remote_commits_ahead: remoteCommitsAhead,
        merges
    };
}