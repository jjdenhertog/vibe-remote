import { createPR } from '@vibe-remote/vibe-kanban-api/api/task-attempts/createPR';
import { getBranchStatus } from '@vibe-remote/vibe-kanban-api/api/task-attempts/getBranchStatus';
import { pushBranch } from '@vibe-remote/vibe-kanban-api/api/task-attempts/pushBranch';
import type { MergeInfo } from '@vibe-remote/vibe-kanban-api/types/api';
import type { VibeKanbanContext } from '@vibe-remote/vibe-kanban-api/utils/fetchVibeKanbanContext';

export async function createPullRequest(vibeContext: VibeKanbanContext): Promise<string> {
    try {
        // First check if a PR already exists for this task attempt
        console.log('🔍 Checking for existing PRs...');
        const branchStatus = await getBranchStatus(vibeContext.taskAttempt.id);
        const existingPR = branchStatus.merges.find((merge: MergeInfo) => merge.type === 'pr');

        if (existingPR) {
            console.log(`✅ Found existing PR: ${existingPR.pr_info.url} (status: ${existingPR.pr_info.status})`);

            // Check if we have commits to push
            if (branchStatus.commits_ahead && branchStatus.commits_ahead > 0) {
                console.log(`📤 Pushing ${branchStatus.commits_ahead} new commits to existing PR...`);
                await pushBranch(vibeContext.taskAttempt.id);
                console.log('✅ Successfully pushed updates to existing PR');
            }

            return existingPR.pr_info.url;
        }

        // Create new PR if none exists
        console.log('📝 Creating new PR...');
        const prData = {
            title: vibeContext.task.title,
            body: vibeContext.task.description,
            base_branch: vibeContext.taskAttempt.base_branch
        };

        return await createPR(vibeContext.taskAttempt.id, prData);

    } catch (error) {
        console.log(`❌ PR creation failed:`, error);
        throw error;
    }
}