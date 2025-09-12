export type BranchStatus = {
    commits_behind: number | null;
    commits_ahead: number | null;
    has_uncommitted_changes: boolean | null;
    head_oid: string;
    uncommitted_count: number;
    untracked_count: number;
    base_branch_name: string;
    remote_commits_behind: number | null;
    remote_commits_ahead: number | null;
    merges: MergeInfo[];
}

export type MergeInfo = {
    type: 'pr';
    id: string;
    task_attempt_id: string;
    created_at: string;
    target_branch_name: string;
    pr_info: PRInfo;
}

export type PRInfo = {
    number: number;
    url: string;
    status: 'open' | 'merged' | 'closed';
    merged_at: string | null;
    merge_commit_sha: string | null;
}