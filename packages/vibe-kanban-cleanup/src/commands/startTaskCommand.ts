#!/usr/bin/env node

import { startTask } from '../functions/startTask';

/**
 * CLI command to start a task
 * Usage: npx vibe-kanban-cleanup start-task <project-id> <task-id> [--use-curl]
 */
export async function startTaskCommand(): Promise<void> {
    const args = process.argv.slice(2);
    
    // Parse arguments
    const [projectId, taskId] = args;
    const useCurl = args.includes('--use-curl');
    
    if (!projectId || !taskId) {
        console.error('Error: Missing required arguments');
        console.error('Usage: npx vibe-kanban-cleanup start-task <project-id> <task-id> [--use-curl]');
        console.error('');
        console.error('Options:');
        console.error('  --use-curl    Use curl command instead of MCP (default: use MCP)');
        process.exit(1);
    }
    
    console.log(`Starting task ${taskId} in project ${projectId}...`);
    
    const result = await startTask({
        taskId,
        projectId,
        useMcp: !useCurl
    });
    
    if (result.success) {
        console.log('✅', result.message);
        if (result.task) {
            console.log('Task details:', result.task);
        }
    } else {
        console.error('❌', result.message);
        if (result.error) {
            console.error('Error details:', result.error);
        }
        
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    await startTaskCommand().catch((error: unknown) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}