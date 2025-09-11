// Core CLI functions
export { checkAuth, ensureAuth } from './cli/checkAuth';
export { getBranchStatus } from './cli/getBranchStatus';
export { pushBranch } from './cli/pushBranch';
export { createPullRequest } from './cli/createPullRequest';
export { listPullRequests, getExistingPullRequest } from './cli/listPullRequests';
export { mergePullRequest } from './cli/mergePullRequest';

// Types
export type { BranchStatus } from './types/BranchStatus';
export type { PullRequestInfo, CreatePullRequestOptions } from './types/PullRequest';
export { GitHubCLIError } from './types/GitHubError';
export type { GitHubCLIErrorCode } from './types/GitHubError';
export type { MergeMethod } from './cli/mergePullRequest';