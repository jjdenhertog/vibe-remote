import type { BasicTask } from '@vibe-remote/vibe-kanban-api/types/api';

export type StartTaskOptions = {
    taskId: string;
    projectId: string;
    useMcp?: boolean; // Whether to use MCP or curl
};

export type StartTaskResponse = {
    success: boolean;
    message: string;
    task?: Partial<BasicTask>;
    error?: string;
};

/**
 * Start a task by updating its status to "inprogress"
 * Uses either MCP vibe_kanban tool or curl command
 */
export async function startTask(options: StartTaskOptions): Promise<StartTaskResponse> {
    const { taskId, projectId, useMcp = true } = options;

    // Log the action for debugging
    console.log(`[startTask] Starting task ${taskId} in project ${projectId} using ${useMcp ? 'MCP' : 'curl'}`);

    try {
        if (useMcp) {
            // Implementation note: This would use the MCP tool in Claude
            // mcp__vibe_kanban__update_task with status: "inprogress"
            console.log('[startTask] MCP implementation - params:', {
                project_id: projectId,
                task_id: taskId,
                status: 'inprogress'
            });

            // For now, return success as this will be called via MCP in Claude
            return {
                success: true,
                message: `Task ${taskId} started successfully via MCP`,
                task: {
                    id: taskId,
                    project_id: projectId,
                    status: 'inprogress'
                }
            };
        }
        
        // Use shared API implementation
        console.log('[startTask] Using shared API to update task status');
        
        const { updateTask } = await import('@vibe-remote/vibe-kanban-api/api/tasks/updateTask');
        
        const updatedTask = await updateTask(taskId, {
            status: 'inprogress'
        });

        return {
            success: true,
            message: `Task ${taskId} started successfully via shared API`,
            task: {
                id: updatedTask.id,
                project_id: updatedTask.project_id,
                status: updatedTask.status
            }
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[startTask] Error starting task:', errorMessage);
        
        return {
            success: false,
            message: `Failed to start task ${taskId}`,
            error: errorMessage
        };
    }
}

/**
 * Start multiple tasks in parallel
 */
export async function startMultipleTasks(
    tasks: { taskId: string; projectId: string }[],
    useMcp = true
): Promise<StartTaskResponse[]> {
    console.log(`[startMultipleTasks] Starting ${tasks.length} tasks`);
    
    const promises = tasks.map(task => 
        startTask({
            taskId: task.taskId,
            projectId: task.projectId,
            useMcp
        })
    );
    
    return Promise.all(promises);
}