import { getBranchStatusCLI } from './github-cli/getBranchStatusCLI';
import { pushBranchCLI } from './github-cli/pushBranchCLI';
import { createPRCLI } from './github-cli/createPRCLI';
import type { MergeInfo } from '@vibe-remote/vibe-kanban-api/types/api';
import type { VibeKanbanContext } from '@vibe-remote/vibe-kanban-api/utils/fetchVibeKanbanContext';

/**
 * Create pull request using GitHub CLI instead of the Vibe Kanban API
 * This replaces the API-based implementation with CLI commands
 */
export async function createPullRequestCLI(vibeContext: VibeKanbanContext): Promise<string> {
    try {
        // First check if a PR already exists for this task attempt
        console.log('🔍 Checking for existing PRs using GitHub CLI...');
        const branchStatus = await getBranchStatusCLI(vibeContext.taskAttempt.id);
        const existingPR = branchStatus.merges.find((merge: MergeInfo) => merge.type === 'pr');

        if (existingPR) {
            console.log(`✅ Found existing PR: ${existingPR.pr_info.url} (status: ${existingPR.pr_info.status})`);

            // Check if we have commits to push
            if (branchStatus.commits_ahead && branchStatus.commits_ahead > 0) {
                console.log(`📤 Pushing ${branchStatus.commits_ahead} new commits to existing PR...`);
                await pushBranchCLI(vibeContext.taskAttempt.id);
                console.log('✅ Successfully pushed updates to existing PR');
            }

            return existingPR.pr_info.url;
        }

        // Create new PR if none exists
        console.log('📝 Creating new PR using GitHub CLI...');
        const prData = {
            title: vibeContext.task.title,
            body: vibeContext.task.description,
            base_branch: vibeContext.taskAttempt.base_branch
        };

        return await createPRCLI(vibeContext.taskAttempt.id, prData);

    } catch (error) {
        console.log(`❌ PR creation via CLI failed:`, error);
        throw error;
    }
}