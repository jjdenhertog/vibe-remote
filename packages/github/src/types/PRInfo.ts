
export type PRInfo = {
    number: number;
    url: string;
    status: 'open' | 'merged' | 'closed';
    merged_at: string | null;
    merge_commit_sha: string | null;
};
