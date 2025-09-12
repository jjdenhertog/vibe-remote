import { execSync } from 'node:child_process';
import { updateTask } from '@vibe-remote/vibe-kanban-api/api/tasks/updateTask';
import { getTask } from '@vibe-remote/vibe-kanban-api/api/tasks/getTask';
import { getTaskAttempt } from '@vibe-remote/vibe-kanban-api/api/task-attempts/getTaskAttempt';

export async function syncTaskStatusWithMerge(attemptId: string): Promise<boolean> {
    try {
        // Get task attempt to find the task ID
        const taskAttempt = await getTaskAttempt(attemptId);
        
        if (!taskAttempt) {
            console.log(`⚠️ Task attempt not found for ID: ${attemptId}`);

            return false;
        }

        // Get current task to check its status
        const task = await getTask(taskAttempt.task_id);
        
        if (!task) {
            console.log(`⚠️ Task not found for ID: ${taskAttempt.task_id}`);

            return false;
        }

        // Skip if task is already done or cancelled
        if (task.status === 'done' || task.status === 'cancelled') {
            return false;
        }

        // Check if there's a merged PR for this branch
        const branchName = taskAttempt.branch || execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        
        try {
            // Use --state all to include merged PRs
            const prListJson = execSync(
                `gh pr list --head ${branchName} --json state,mergedAt --state all --limit 1`,
                { encoding: 'utf8' }
            );
            
            const prs = JSON.parse(prListJson || '[]');
            
            if (prs.length > 0 && (prs[0].state === 'MERGED' || prs[0].mergedAt)) {
                // PR is merged, update task status to done
                await updateTask(taskAttempt.task_id, { status: 'done' });
                console.log(`✅ Task "${task.title}" status updated to "done" (PR was merged)`);
                
                return true;
            } else if (prs.length > 0) {
                console.log(`ℹ️ PR state is "${prs[0].state}" - no status update needed`);
            } else {
                console.log(`ℹ️ No PR found for branch "${branchName}"`);
            }
        } catch (error) {
            // GitHub CLI might not be available or configured
            console.log(`⚠️ Could not check PR status: ${String(error)}`);
        }
        
        return false;
    } catch (error) {
        console.log(`❌ Failed to sync task status: ${String(error)}`);
        
        return false;
    }
}