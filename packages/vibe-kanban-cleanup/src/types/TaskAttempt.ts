export type TaskAttempt = {
    id: string;
    task_id: string;
    container_ref: string;
    branch: string;
    base_branch: string;
    executor: string;
    worktree_deleted: boolean;
    setup_completed_at: string | null;
    created_at: string;
    updated_at: string;
};