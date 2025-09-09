import type { ContainerInfo, TaskAttempt, BasicTask } from '@vibe-remote/vibe-kanban-api/types/api';

export type VibeKanbanContext = {
    containerInfo: ContainerInfo;
    taskAttempt: TaskAttempt;
    task: BasicTask;
    worktreePath: string;
    apiBaseUrl: string;
};