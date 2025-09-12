#!/usr/bin/env node

import { fetchVibeKanbanContext } from "@vibe-remote/vibe-kanban-api/utils/fetchVibeKanbanContext";
import { syncTaskStatusWithMerge } from "./functions/syncTaskStatusWithMerge";

async function main(): Promise<void> {
    try {
        console.log('🔄 Syncing task status with merge state...');

        if (!process.cwd().includes('/worktrees/')) {
            throw new Error('Must be run from a vibe-kanban worktree directory');
        }

        const context = await fetchVibeKanbanContext();
        console.log(`📋 Task: "${context.task.title}"`);
        console.log(`🔍 Current status: ${context.task.status}`);

        const wasUpdated = await syncTaskStatusWithMerge(context.containerInfo.attempt_id);
        
        if (wasUpdated) {
            console.log('✅ Task status synchronized successfully');
        } else {
            console.log('ℹ️ No status update needed');
        }

    } catch (error) {
        console.log('❌ Sync failed:', error);
        process.exit(1);
    }
}

// Execute
await main();