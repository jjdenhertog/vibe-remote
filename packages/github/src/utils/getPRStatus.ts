import { execSync } from 'node:child_process';
import type { MergeInfo } from "../types/MergeInfo";

/**
 * Get PR status for a branch using GitHub CLI
 * This ONLY handles GitHub PR information, not Git operations
 */
export async function getPRStatus(branchName: string): Promise<MergeInfo[]> {
    const currentBranch = branchName;
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
                task_attempt_id: currentBranch,
                created_at: new Date().toISOString(),
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
        // No PRs found or gh CLI not configured - return empty array
    }
    
    return merges;
}