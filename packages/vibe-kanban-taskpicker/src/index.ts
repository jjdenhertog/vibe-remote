#!/usr/bin/env node

import { runTaskPicker } from './claude/runTaskPicker';
import * as dotenv from 'dotenv';
import { resolve } from 'node:path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function main(): Promise<void> {
    try {
        console.log('[TaskPicker] Starting Vibe Kanban Task Picker with MCP tools...');
        
        // Check for required environment variables
        const projectId = process.env.VIBE_PROJECT_ID || process.argv[2];
        
        if (!projectId) {
            console.error('[TaskPicker] Error: VIBE_PROJECT_ID environment variable or command line argument required');
            console.error('[TaskPicker] Usage: vibe-kanban-taskpicker [project-id]');
            console.error('[TaskPicker]    or: VIBE_PROJECT_ID=<id> vibe-kanban-taskpicker');
            process.exit(1);
        }
        
        const checkInterval = parseInt(process.env.TASK_CHECK_INTERVAL || '300', 10);
        
        // Validate check interval
        if (isNaN(checkInterval) || checkInterval < 1) {
            console.error('[TaskPicker] Error: Invalid check interval. Must be a positive number.');
            process.exit(1);
        }
        
        console.log('[TaskPicker] Configuration:');
        console.log(`  - Project ID: ${projectId}`);
        console.log(`  - Check Interval: ${checkInterval}s`);
        console.log(`  - Using MCP vibe_kanban tools for task management`);
        console.log(`  - Environment: ${process.env.NODE_ENV || 'production'}`);
        
        // Run the task picker
        await runTaskPicker({
            projectId,
            checkInterval
        });
        
        console.log('[TaskPicker] Task picker completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('[TaskPicker] Fatal error:', error);
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('[TaskPicker] Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('[TaskPicker] Uncaught Exception:', error);
    process.exit(1);
});

// Run if called directly - use void to ignore promise
// eslint-disable-next-line no-void, unicorn/prefer-top-level-await
void main();

export { runTaskPicker } from './claude/runTaskPicker';