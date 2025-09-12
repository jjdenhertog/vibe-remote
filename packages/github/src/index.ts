export { getBranchStatus } from './branch/getBranchStatus';
export { pushBranch } from './push/pushBranch';
export { createPR } from './pr/createPR';
export { 
    checkGitHubCLI, 
    isAuthenticated, 
    getCurrentBranch, 
    getDefaultBranch 
} from './github';

export type { BranchStatus, MergeInfo, PRInfo } from './types/BranchStatus';
export type { CreatePRRequest } from './types/CreatePRRequest';
export { GitHubCLIError, GitHubCLIErrorCode } from './errors';