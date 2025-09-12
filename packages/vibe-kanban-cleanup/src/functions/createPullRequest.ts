import { getPRStatus } from '@vibe-remote/github/utils/getPRStatus';
import { pushBranch } from '@vibe-remote/github/utils/pushBranch';
import type { MergeInfo } from '@vibe-remote/github/types/MergeInfo';
import type { VibeKanbanContext } from '@vibe-remote/vibe-kanban-api/utils/fetchVibeKanbanContext';
import { createPullRequest as githubCreatePullRequest } from '@vibe-remote/github/utils/createPullRequest';
import { getBranchStatus } from '@vibe-remote/github/utils/getBranchStatus';

export async function createPullRequest(vibeContext: VibeKanbanContext): Promise<string> {
    try {
        // Use Vibe Kanban API for Git branch status (commits ahead/behind, uncommitted changes)
        if(!vibeContext.taskAttempt.branch)
            throw new Error('No branch found');
            
        // Use GitHub CLI to check for existing PRs
        console.log('🔍 Checking for existing PRs using GitHub CLI...');

        const prs = await getPRStatus(vibeContext.taskAttempt.branch);
        const existingPR = prs.find((pr: MergeInfo) => pr.pr_info.status === 'open');

        if (existingPR) {
            console.log(`✅ Found existing PR: ${existingPR.pr_info.url} (status: ${existingPR.pr_info.status})`);

            // Check if we have commits to push using the new branch status utility
            const branchStatus = getBranchStatus(vibeContext.taskAttempt.branch);
            
            if (branchStatus.needsPush) {
                console.log(`📤 Pushing ${branchStatus.commitsAhead} new commits to existing PR...`);
                await pushBranch(vibeContext.taskAttempt.branch);
                console.log('✅ Successfully pushed updates to existing PR');
            } else {
                console.log('ℹ️ No new commits to push - PR is up to date');
            }

            return existingPR.pr_info.url;
        }

        // Create new PR if none exists using GitHub CLI
        console.log('📝 Creating new PR using GitHub CLI...');
        
        // Check if we need to push the branch before creating PR
        const branchStatus = getBranchStatus(vibeContext.taskAttempt.branch);
        
        if (branchStatus.needsPush) {
            console.log(`📤 Pushing ${branchStatus.commitsAhead} commits before creating PR...`);
            await pushBranch(vibeContext.taskAttempt.branch);
            console.log('✅ Successfully pushed branch to remote');
        }
        
        return await githubCreatePullRequest(vibeContext);

    } catch (error) {
        
        console.log(`❌ PR creation failed:`, error);
        throw error;
    }
}
