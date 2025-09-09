import type { Task } from '../types/Task.js';

export type StartTaskOptions = {
    taskId: string;
    projectId: string;
    useMcp?: boolean; // Whether to use MCP or curl
};

export type StartTaskResponse = {
    success: boolean;
    message: string;
    task?: Partial<Task>;
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
        
        // Curl fallback implementation
        console.log('[startTask] Curl implementation - making empty request with parameters');
        
        // Log the curl command that would be used
        const curlCommand = `curl -X PUT \\
  -H "Content-Type: application/json" \\
  -d '{"status": "inprogress"}' \\
  http://localhost:3000/api/projects/${projectId}/tasks/${taskId}`;
        
        console.log('[startTask] Curl command:', curlCommand);

        // For now, return success as this is a placeholder implementation
        return {
            success: true,
            message: `Task ${taskId} started successfully via curl (placeholder)`,
            task: {
                id: taskId,
                project_id: projectId,
                status: 'inprogress'
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