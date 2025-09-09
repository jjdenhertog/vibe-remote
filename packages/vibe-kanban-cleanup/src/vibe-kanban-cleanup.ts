#!/usr/bin/env node

import { VibeKanbanContext } from './types/VibeKanbanContext';
import { validateEnvironment } from './functions/validateEnvironment';
import { fetchVibeKanbanContext } from './functions/fetchVibeKanbanContext';
import { createPullRequest } from './functions/createPullRequest';
import { readAutomationPreferences } from '@vibe-remote/shared-utils/preferences';

class VibeKanbanCleanup {
    // private readonly prBodyFile = 'pr_body.md';
    private vibeContext?: VibeKanbanContext;

    public async run(): Promise<void> {
        try {
            console.error('🚀 Starting vibe-kanban API cleanup process...');

            validateEnvironment();

            this.vibeContext = await fetchVibeKanbanContext();

            console.error(`Task: "${this.vibeContext.task.title}"`);

            // Read automation preferences
            const preferences = readAutomationPreferences();
            
            if (preferences.automaticallyCreatePR) {
                const prUrl = await createPullRequest(this.vibeContext);
                console.error(`\n✅ PR created: ${prUrl}`);
            } else {
                console.error('\n⏸️ PR creation skipped (automaticallyCreatePR is disabled in preferences)');
            }

        } catch (error) {
            console.error('❌ Cleanup failed:', error);
            process.exit(1);
        }
    }


}

// Execute if this file is run directly
const cleanup = new VibeKanbanCleanup();
await cleanup.run();

