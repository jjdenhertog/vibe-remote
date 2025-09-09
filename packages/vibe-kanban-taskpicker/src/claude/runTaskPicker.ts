import { exec } from 'child_process';
import { promisify } from 'util';
import axios, { AxiosInstance } from 'axios';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const execAsync = promisify(exec);

export type TaskPickerConfig = {
    claudeCommand: string;
    vibeApiUrl: string;
    checkInterval: number;
}

export type VibeTask = {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'inprogress' | 'inreview' | 'done' | 'cancelled';
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export type VibeProject = {
    id: string;
    name: string;
    description?: string;
}

export async function runTaskPicker(config: TaskPickerConfig): Promise<void> {
    const axiosClient = axios.create({
        baseURL: config.vibeApiUrl,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    try {
        // Step 1: Get available projects
        console.log('[TaskPicker] Fetching available projects...');
        const projects = await fetchProjects(axiosClient);
        
        if (!projects || projects.length === 0) {
            console.log('[TaskPicker] No projects found. Exiting.');
            return;
        }
        
        console.log(`[TaskPicker] Found ${projects.length} project(s)`);
        
        // Step 2: For each project, get tasks
        for (const project of projects) {
            console.log(`[TaskPicker] Processing project: ${project.name} (${project.id})`);
            
            const tasks = await fetchTasks(axiosClient, project.id);
            const todoTasks = tasks.filter(t => t.status === 'todo');
            
            if (todoTasks.length === 0) {
                console.log(`[TaskPicker] No TODO tasks in project ${project.name}`);
                continue;
            }
            
            console.log(`[TaskPicker] Found ${todoTasks.length} TODO task(s)`);
            
            // Step 3: Use Claude to pick the best task
            const selectedTask = await selectTaskWithClaude(
                config.claudeCommand,
                project,
                todoTasks
            );
            
            if (selectedTask) {
                console.log(`[TaskPicker] Selected task: ${selectedTask.title} (${selectedTask.id})`);
                
                // Step 4: Update task status to in-progress
                await updateTaskStatus(axiosClient, project.id, selectedTask.id, 'inprogress');
                console.log(`[TaskPicker] Task ${selectedTask.id} marked as in-progress`);
                
                // Step 5: Execute the task with Claude
                await executeTaskWithClaude(
                    config.claudeCommand,
                    project,
                    selectedTask
                );
                
                // Step 6: Mark task as done
                await updateTaskStatus(axiosClient, project.id, selectedTask.id, 'done');
                console.log(`[TaskPicker] Task ${selectedTask.id} marked as done`);
                
                // Exit after completing one task (supervisord will restart for next)
                return;
            }
        }
        
        console.log('[TaskPicker] No suitable tasks found across all projects');
    } catch (error) {
        console.error('[TaskPicker] Error during task picking:', error);
        throw error;
    }
}

async function fetchProjects(client: AxiosInstance): Promise<VibeProject[]> {
    try {
        const response = await client.get('/api/projects');
        return response.data || [];
    } catch (error) {
        console.error('[TaskPicker] Failed to fetch projects:', error);
        return [];
    }
}

async function fetchTasks(client: AxiosInstance, projectId: string): Promise<VibeTask[]> {
    try {
        const response = await client.get(`/api/projects/${projectId}/tasks`);
        return response.data || [];
    } catch (error) {
        console.error(`[TaskPicker] Failed to fetch tasks for project ${projectId}:`, error);
        return [];
    }
}

async function updateTaskStatus(
    client: AxiosInstance,
    projectId: string,
    taskId: string,
    status: VibeTask['status']
): Promise<void> {
    try {
        await client.patch(`/api/projects/${projectId}/tasks/${taskId}`, { status });
    } catch (error) {
        console.error(`[TaskPicker] Failed to update task ${taskId} status:`, error);
        throw error;
    }
}

async function selectTaskWithClaude(
    claudeCommand: string,
    project: VibeProject,
    tasks: VibeTask[]
): Promise<VibeTask | null> {
    const promptPath = resolve(__dirname, '../../templates/task-picker-prompt.md');
    const promptTemplate = readFileSync(promptPath, 'utf-8');
    
    // Build task list for prompt
    const taskList = tasks.map((task, index) => 
        `${index + 1}. [ID: ${task.id}] ${task.title}\n   ${task.description || 'No description'}`
    ).join('\n\n');
    
    const prompt = promptTemplate
        .replace('{{PROJECT_NAME}}', project.name)
        .replace('{{PROJECT_DESCRIPTION}}', project.description || 'No description')
        .replace('{{TASK_LIST}}', taskList);
    
    try {
        // Create a temporary prompt file
        const tempPromptPath = `/tmp/task-picker-prompt-${Date.now()}.md`;
        const { writeFileSync, unlinkSync } = await import('fs');
        writeFileSync(tempPromptPath, prompt);
        
        // Execute Claude with the prompt
        const { stdout } = await execAsync(`${claudeCommand} < "${tempPromptPath}"`);
        
        // Clean up temp file
        unlinkSync(tempPromptPath);
        
        // Parse Claude's response to extract task ID
        const match = stdout.match(/SELECTED_TASK_ID:\s*([a-zA-Z0-9-]+)/);
        if (match && match[1]) {
            const selectedId = match[1];
            return tasks.find(t => t.id === selectedId) || null;
        }
        
        return null;
    } catch (error) {
        console.error('[TaskPicker] Failed to select task with Claude:', error);
        return null;
    }
}

async function executeTaskWithClaude(
    claudeCommand: string,
    project: VibeProject,
    task: VibeTask
): Promise<void> {
    const prompt = `
You are working on project: ${project.name}

Task to complete:
Title: ${task.title}
Description: ${task.description || 'No specific description provided'}

Please complete this task. Work autonomously and implement the required functionality.
The task should be considered done when the implementation is complete and tested.

Important:
- Create or modify files as needed
- Ensure code quality with proper linting
- Add tests if applicable
- Follow the project's coding standards
`;
    
    try {
        // Create a temporary prompt file
        const tempPromptPath = `/tmp/task-execute-prompt-${Date.now()}.md`;
        const { writeFileSync, unlinkSync } = await import('fs');
        writeFileSync(tempPromptPath, prompt);
        
        // Execute Claude with the task
        console.log(`[TaskPicker] Executing task with Claude: ${task.title}`);
        const { stdout, stderr } = await execAsync(`${claudeCommand} < "${tempPromptPath}"`, {
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large outputs
        });
        
        // Clean up temp file
        unlinkSync(tempPromptPath);
        
        if (stderr) {
            console.error('[TaskPicker] Claude stderr:', stderr);
        }
        
        console.log('[TaskPicker] Task execution completed');
    } catch (error) {
        console.error('[TaskPicker] Failed to execute task with Claude:', error);
        throw error;
    }
}