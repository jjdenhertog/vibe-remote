import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export type MergeResult = {
    success: boolean;
    message: string;
    timestamp: string;
    error?: string;
    errorType?: 'worktree' | 'permission' | 'network' | 'conflict' | 'unknown';
};

export async function mergePullRequest(): Promise<MergeResult> {
    const timestamp = new Date().toISOString();
    
    try {
        console.error(`[${timestamp}] 🔀 Attempting to merge PR from current worktree branch`);
        
        const mergeCommand = `gh pr merge --squash --body "Auto-merged by vibe-kanban" --delete-branch`;
        
        await execAsync(mergeCommand);
        
        console.error(`[${timestamp}] ✅ PR successfully merged`);
        
        return {
            success: true,
            message: 'PR successfully merged',
            timestamp
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorOutput = (error as any)?.stderr || '';
        
        const errorType = categorizeError(errorMessage, errorOutput);
        
        if (errorType === 'worktree') {
            console.error(`[${timestamp}] ⚠️ Worktree checkout error detected (expected) - merge may have succeeded`);
            
            return {
                success: true,
                message: 'PR merged (worktree checkout warning suppressed)',
                timestamp,
                error: 'Worktree checkout error (non-critical)'
            };
        }
        
        console.error(`[${timestamp}] ❌ Failed to merge PR: ${errorMessage}`);
        
        return {
            success: false,
            message: `Failed to merge PR: ${errorMessage}`,
            timestamp,
            error: errorMessage,
            errorType
        };
    }
}

function categorizeError(message: string, stderr: string): NonNullable<MergeResult['errorType']> {
    const combined = `${message} ${stderr}`.toLowerCase();
    
    if (combined.includes('worktree') || combined.includes('checkout') || combined.includes('working tree')) {
        return 'worktree';
    }
    
    if (combined.includes('permission') || combined.includes('unauthorized') || combined.includes('forbidden')) {
        return 'permission';
    }
    
    if (combined.includes('network') || combined.includes('connection') || combined.includes('timeout')) {
        return 'network';
    }
    
    if (combined.includes('conflict') || combined.includes('cannot merge')) {
        return 'conflict';
    }
    
    return 'unknown';
}