#!/usr/bin/env node

import { VibeKanbanContext } from './types/VibeKanbanContext';
import { validateEnvironment } from './functions/validateEnvironment';
import { fetchVibeKanbanContext } from './functions/fetchVibeKanbanContext';
import { createPullRequest } from './functions/createPullRequest';
import { mergePullRequest } from './functions/mergePullRequest';
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
                
                // Handle auto-merge if enabled and mode is 'always'
                if (preferences.autoMergePR && preferences.autoMergeDecisionMode === 'always') {
                    console.error('\n🔀 Auto-merge mode is "always" - attempting to merge PR...');
                    const mergeResult = await mergePullRequest();
                    
                    if (mergeResult.success) {
                        console.error(`✅ ${mergeResult.message}`);
                    } else {
                        console.error(`❌ ${mergeResult.message}`);
                    }
                }
            } else {
                console.error('\n⏸️ PR creation skipped (automaticallyCreatePR is disabled in preferences)');
            }

        } catch (error) {
            console.error('❌ Cleanup failed:', error);
            process.exit(1);
        }
    }


}

// Export functions for library usage
export { mergePullRequest } from './functions/mergePullRequest';
export type { MergeResult } from './functions/mergePullRequest';

// Execute if this file is run directly
const cleanup = new VibeKanbanCleanup();
await cleanup.run();

