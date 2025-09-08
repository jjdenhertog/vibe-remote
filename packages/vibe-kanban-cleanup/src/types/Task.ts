export type Task = {
    id: string;
    project_id: string;
    title: string;
    description: string;
    status: string;
    parent_task_attempt: string | null;
    created_at: string;
    updated_at: string;
};