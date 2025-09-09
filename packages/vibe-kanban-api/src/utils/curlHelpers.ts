import type { TaskStatus } from '../types/api';

/**
 * Generate a CURL command string to update task status
 */
export function generateTaskUpdateCurl(taskId: string, status: TaskStatus, baseUrl = 'http://localhost:9091'): string {
    return `curl -X PUT \\
  -H "Content-Type: application/json" \\
  -d '{"status": "${status}"}' \\
  ${baseUrl}/api/tasks/${taskId}`;
}

/**
 * Generate a CURL command string to list tasks for a project
 */
export function generateListTasksCurl(projectId: string, baseUrl = 'http://localhost:9091'): string {
    return `curl -X GET "${baseUrl}/api/tasks?project_id=${projectId}"`;
}

/**
 * Generate a CURL command string to create a new task
 */
export function generateCreateTaskCurl(projectId: string, title: string, description?: string, baseUrl = 'http://localhost:9091'): string {
    const requestBody = JSON.stringify({
        project_id: projectId,
        title,
        description: description || null
    });

    return `curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '${requestBody}' \\
  ${baseUrl}/api/tasks`;
}

/**
 * Generate a CURL command string to start a task attempt
 */
export function generateStartTaskAttemptCurl(
    taskId: string, 
    executor: string = 'CLAUDE_CODE', 
    baseBranch: string = 'main',
    baseUrl = 'http://localhost:9091'
): string {
    const requestBody = JSON.stringify({
        task_id: taskId,
        executor_profile_id: {
            executor,
            variant: null
        },
        base_branch: baseBranch
    });

    return `curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '${requestBody}' \\
  ${baseUrl}/api/task-attempts`;
}

/**
 * Export all CURL helper functions
 */
export const curlCommands = {
    updateTask: generateTaskUpdateCurl,
    listTasks: generateListTasksCurl,
    createTask: generateCreateTaskCurl,
    startTaskAttempt: generateStartTaskAttemptCurl
};