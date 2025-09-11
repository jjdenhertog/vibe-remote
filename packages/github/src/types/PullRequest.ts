export type PullRequestInfo = {
    number: number;
    url: string;
    state: 'OPEN' | 'MERGED' | 'CLOSED';
    title: string;
    headBranch: string;
    baseBranch: string;
}

export type CreatePullRequestOptions = {
    title: string;
    body?: string;
    baseBranch?: string;
    headBranch?: string;
    draft?: boolean;
}