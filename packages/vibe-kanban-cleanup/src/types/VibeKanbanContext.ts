import { ContainerInfo } from './ContainerInfo.js';
import { TaskAttempt } from './TaskAttempt.js';
import { Task } from './Task.js';

export type VibeKanbanContext = {
    containerInfo: ContainerInfo;
    taskAttempt: TaskAttempt;
    task: Task;
    worktreePath: string;
    apiBaseUrl: string;
};