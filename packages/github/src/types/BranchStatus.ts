import { MergeInfo } from "./MergeInfo";

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

