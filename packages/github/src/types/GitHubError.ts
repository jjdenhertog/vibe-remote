export class GitHubCLIError extends Error {
    public constructor(
        message: string,
        public readonly code?: string,
        public readonly command?: string
    ) {
        super(message);
        this.name = 'GitHubCLIError';
    }
}

export type GitHubCLIErrorCode = 
    | 'NOT_INSTALLED'
    | 'NOT_AUTHENTICATED'
    | 'PERMISSION_DENIED'
    | 'BRANCH_NOT_FOUND'
    | 'PR_ALREADY_EXISTS'
    | 'NETWORK_ERROR'
    | 'COMMAND_FAILED';