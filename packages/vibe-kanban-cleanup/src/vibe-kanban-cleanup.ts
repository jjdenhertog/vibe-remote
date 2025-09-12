#!/usr/bin/env node

import { readAutomationPreferences } from "@vibe-remote/shared-utils/readAutomationPreferences";
import { fetchVibeKanbanContext, VibeKanbanContext } from "@vibe-remote/vibe-kanban-api/utils/fetchVibeKanbanContext";
import { AutomationPreferences } from "@vibe-remote/shared-utils/readAutomationPreferences";
import { updateTask } from "@vibe-remote/vibe-kanban-api/api/tasks/updateTask";
import { execSync } from "node:child_process";
import { runAutoMerge } from "./claude/runAutoMerge";
import { createPullRequest } from "./functions/createPullRequest";

class VibeKanbanCleanup {
    // private readonly prBodyFile = 'pr_body.md';


    public async run(): Promise<void> {
        try {
            console.log('🚀 Starting vibe-kanban API cleanup process...');

            if (!process.cwd().includes('/worktrees/'))
                throw new Error('Must be run from a vibe-kanban worktree directory');

            const context = await fetchVibeKanbanContext();
            console.log(`Task: "${context.task.title}"`);

            // Read automation preferences
            const preferences = readAutomationPreferences();

            if (preferences.automaticallyCreatePR) {
                // Check if GitHub CLI is available and use it, otherwise fall back to API

                const prUrl = await createPullRequest(context);
                console.log(`\n✅ PR created: ${prUrl}`);

                // Handle auto-merge based on preferences
                if (preferences.automaticallyMergePR)
                    await this.handleAutoMerge(preferences, prUrl, context);

            } else {
                console.log('\n⏸️ PR creation skipped (automaticallyCreatePR is disabled in preferences)');
            }

        } catch (error) {
            console.log('❌ Cleanup failed:', error);
            process.exit(1);
        }
    }


    private async handleAutoMerge(preferences: AutomationPreferences, prUrl: string, context: VibeKanbanContext): Promise<void> {

        console.log(`\n🔗 PR URL for merge: ${prUrl}`);

        if (preferences.mergeDecisionMode === 'always') {
            console.log('\n🔀 Auto-merge mode is "always" - attempting to merge PR...');

            try {
                const mergeCommand = `gh pr merge --merge --body "Auto-merged by vibe-kanban" --delete-branch`;
                execSync(mergeCommand);
                console.log('✅ PR successfully merged and branch deleted');
                
                // Update task status to done
                await this.updateTaskStatusToDone(context);
            } catch (error) {
                const errorMessage = String(error);
                if (errorMessage.includes("'main' is already checked out")) {
                    console.log('✅ Auto-merge completed (worktree limitation handled)');
                    
                    // Update task status to done even with worktree limitation
                    await this.updateTaskStatusToDone(context);
                } else {
                    console.log(`⚠️ Auto-merge failed: ${errorMessage}`);
                }
            }

            return;
        }

        if (preferences.mergeDecisionMode === 'claude-decision') {
            console.log('\n🤖 Auto-merge mode is "claude-decision" - running Claude evaluation...');
            console.log(`📋 Task context: "${context.task.title}"`);
            console.log(`🔍 Attempt ID: ${context.containerInfo.attempt_id}`);

            try {
                await runAutoMerge(context.containerInfo.attempt_id);
                console.log('✅ Claude auto-merge evaluation completed');
                
                // Always check if PR was merged and update task status
                // This ensures status is synced even if Claude doesn't run the sync command
                await this.checkAndUpdateTaskStatus(context);
            } catch (error) {
                console.log(`❌ Claude auto-merge evaluation failed: ${String(error)}`);
                
                // Still try to sync status even if Claude evaluation failed
                // In case the PR was merged manually or by another process
                await this.checkAndUpdateTaskStatus(context);
            }
        }
    }

    private async updateTaskStatusToDone(context: VibeKanbanContext): Promise<void> {
        try {
            await updateTask(context.task.id, { status: 'done' });
            console.log('✅ Task status updated to "done"');
        } catch (error) {
            console.log(`⚠️ Failed to update task status: ${String(error)}`);
        }
    }

    private async checkAndUpdateTaskStatus(context: VibeKanbanContext): Promise<void> {
        try {
            // Check if the PR was merged
            const branchName = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
            
            // First try to get the PR status
            const prStatusJson = execSync(
                `gh pr list --head ${branchName} --json state,mergedAt --state all --limit 1`,
                { encoding: 'utf8' }
            );
            
            const prStatus = JSON.parse(prStatusJson || '[]');
            if (prStatus.length > 0 && (prStatus[0].state === 'MERGED' || prStatus[0].mergedAt)) {
                await this.updateTaskStatusToDone(context);
            } else {
                console.log('ℹ️ PR not merged, task status remains unchanged');
            }
        } catch (error) {
            console.log(`⚠️ Failed to check PR status: ${String(error)}`);
        }
    }

}
// Execute if this file is run directly
const cleanup = new VibeKanbanCleanup();
await cleanup.run();

