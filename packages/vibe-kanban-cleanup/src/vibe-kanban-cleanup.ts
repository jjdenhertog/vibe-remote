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
                
                // Update task status to done after successful merge
                await updateTask(context.task.id, { status: 'done' });
                console.log('✅ Task status updated to "done"');
            } catch (error) {
                const errorMessage = String(error);
                if (errorMessage.includes("'main' is already checked out")) {
                    console.log('✅ Auto-merge completed (worktree limitation handled)');
                    
                    // Update task status to done even with worktree limitation
                    await updateTask(context.task.id, { status: 'done' });
                    console.log('✅ Task status updated to "done"');
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
            } catch (error) {
                console.log(`❌ Claude auto-merge evaluation failed: ${String(error)}`);
            }
        }
    }

}
// Execute if this file is run directly
const cleanup = new VibeKanbanCleanup();
await cleanup.run();

