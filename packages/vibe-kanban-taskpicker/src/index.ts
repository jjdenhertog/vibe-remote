#!/usr/bin/env node

import { runTaskPicker } from './claude/runTaskPicker';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function main(): Promise<void> {
    try {
        console.log('[TaskPicker] Starting Vibe Kanban Task Picker...');
        
        // Check for required environment variables
        const claudeCommand = process.env.CLAUDE_COMMAND || 'claude';
        const vibeApiUrl = process.env.VIBE_API_URL || 'http://localhost:3001';
        const checkInterval = parseInt(process.env.TASK_CHECK_INTERVAL || '300', 10);
        
        console.log('[TaskPicker] Configuration:');
        console.log(`  - Claude Command: ${claudeCommand}`);
        console.log(`  - Vibe API URL: ${vibeApiUrl}`);
        console.log(`  - Check Interval: ${checkInterval}s`);
        
        // Run the task picker
        await runTaskPicker({
            claudeCommand,
            vibeApiUrl,
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

// Run if called directly
if (require.main === module) {
    main();
}

export { runTaskPicker };