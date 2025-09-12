import { getBranchStatus } from '@vibe-remote/vibe-kanban-api/api/task-attempts/getBranchStatus';
import { pushBranch } from '@vibe-remote/github/pushBranch';
import { createPullRequest } from '@vibe-remote/github/createPullRequest';
import { getPRStatus } from '@vibe-remote/github/getPRStatus';
import type { MergeInfo } from '@vibe-remote/vibe-kanban-api/types/api';
import type { VibeKanbanContext } from '@vibe-remote/vibe-kanban-api/utils/fetchVibeKanbanContext';

/**
 * Create pull request using a hybrid approach:
 * - Use Vibe Kanban API for Git operations (branch status, commits ahead/behind)
 * - Use GitHub CLI for GitHub operations (PR creation, PR status)
 * This is the correct approach as we only replace GitHub API calls, not Git operations
 */
export async function createPullRequestWithCLI(vibeContext: VibeKanbanContext): Promise<string> {
    try {
        // Use Vibe Kanban API for Git branch status (commits ahead/behind, uncommitted changes)
        console.log('🔍 Checking branch status...');
        const branchStatus = await getBranchStatus(vibeContext.taskAttempt.id);
        
        // Use GitHub CLI to check for existing PRs
        console.log('🔍 Checking for existing PRs using GitHub CLI...');
        const prs = await getPRStatus(vibeContext.taskAttempt.branch || undefined, vibeContext.taskAttempt.base_branch);
        const existingPR = prs.find((pr: MergeInfo) => pr.pr_info.status === 'open');

        if (existingPR) {
            console.log(`✅ Found existing PR: ${existingPR.pr_info.url} (status: ${existingPR.pr_info.status})`);

            // Check if we have commits to push
            if (branchStatus.commits_ahead && branchStatus.commits_ahead > 0) {
                console.log(`📤 Pushing ${branchStatus.commits_ahead} new commits to existing PR...`);
                await pushBranch();
                console.log('✅ Successfully pushed updates to existing PR');
            }

            return existingPR.pr_info.url;
        }

        // Create new PR if none exists using GitHub CLI
        console.log('📝 Creating new PR using GitHub CLI...');
        
        return await createPullRequest(vibeContext);

    } catch (error) {
        console.log(`❌ PR creation failed:`, error);
        throw error;
    }
}