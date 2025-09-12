export enum GitHubCLIErrorCode {
    NOT_INSTALLED = 'NOT_INSTALLED',
    NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
    BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND',
    PR_ALREADY_EXISTS = 'PR_ALREADY_EXISTS',
    PUSH_FAILED = 'PUSH_FAILED',
    COMMAND_FAILED = 'COMMAND_FAILED'
}

export class GitHubCLIError extends Error {
    public constructor(
        public code: GitHubCLIErrorCode,
        message: string,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'GitHubCLIError';
    }
}