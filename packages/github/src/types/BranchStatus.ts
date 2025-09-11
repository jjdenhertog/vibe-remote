export type BranchStatus = {
    currentBranch: string;
    baseBranch: string;
    headCommit: string;
    commitsAhead: number;
    commitsBehind: number;
    hasUncommittedChanges: boolean;
    uncommittedCount: number;
    untrackedCount: number;
}