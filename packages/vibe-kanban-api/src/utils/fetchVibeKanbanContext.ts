import { getInfo } from "../api/containers/getInfo";
import { getTaskAttempt } from "../api/task-attempts/getTaskAttempt";
import { getTask } from "../api/tasks/getTask";
import { ContainerInfo, TaskAttempt, BasicTask } from "../types/api";


export type VibeKanbanContext = {
    containerInfo: ContainerInfo;
    taskAttempt: TaskAttempt;
    task: BasicTask;
    worktreePath: string;
};

export async function fetchVibeKanbanContext(): Promise<VibeKanbanContext> {
    const worktreePath = process.cwd();

    const containerInfo = await getInfo(worktreePath);
    const taskAttempt = await getTaskAttempt(containerInfo.attempt_id);
    const task = await getTask(containerInfo.task_id);

    return {
        containerInfo,
        taskAttempt,
        task,
        worktreePath
    };

}