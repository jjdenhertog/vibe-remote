#!/usr/bin/env node

import { runTaskPicker } from './claude/runTaskPicker';

async function main(): Promise<void> {
    try {
        console.log('[TaskPicker] Starting Vibe Kanban Task Picker with auto-project detection...');
        await runTaskPicker();
        
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

