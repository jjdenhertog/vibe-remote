import { execSync } from 'node:child_process';
import { GitHubCLIError, GitHubCLIErrorCode } from './errors';

export function checkGitHubCLI(): boolean {
    try {
        execSync('gh --version', { encoding: 'utf8' });

        return true;
    } catch {
        return false;
    }
}

export function isAuthenticated(): boolean {
    try {
        execSync('gh auth status', { encoding: 'utf8' });

        return true;
    } catch {
        return false;
    }
}

export function getCurrentBranch(): string {
    try {
        const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        if (!branch) {
            throw new GitHubCLIError(
                GitHubCLIErrorCode.BRANCH_NOT_FOUND,
                'No current branch found'
            );
        }

        return branch;
    } catch (error) {
        if (error instanceof GitHubCLIError) throw error;

        throw new GitHubCLIError(
            GitHubCLIErrorCode.COMMAND_FAILED,
            'Failed to get current branch',
            error
        );
    }
}

export function getDefaultBranch(): string {
    try {
        // Try to get the default branch from GitHub
        const remoteName = execSync('git remote', { encoding: 'utf8' }).trim()
            .split('\n')[0] || 'origin';
        const remoteUrl = execSync(`git remote get-url ${remoteName}`, { encoding: 'utf8' }).trim();
        
        // Extract owner/repo from remote URL
        const regex = /github\.com[/:]([^/]+)\/([^.]+)/;
        const match = regex.exec(remoteUrl);
        if (match) {
            const [, owner, repo] = match;
            const repoInfo = execSync(`gh api repos/${owner}/${repo} --jq .default_branch`, { encoding: 'utf8' }).trim();
            
            return repoInfo;
        }
    } catch {
        // Fallback to common defaults
    }
    
    // Check if main exists
    try {
        execSync('git rev-parse --verify origin/main', { encoding: 'utf8' });
        
        return 'main';
    } catch {
        // Try master as fallback
        try {
            execSync('git rev-parse --verify origin/master', { encoding: 'utf8' });
            
            return 'master';
        } catch {
            return 'main'; // Default to main
        }
    }
}