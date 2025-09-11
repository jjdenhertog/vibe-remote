import { execa, type ExecaError } from 'execa';
import { GitHubCLIError } from '../types/GitHubError';

export async function executeCommand(
    command: string,
    args: string[],
    options?: { cwd?: string; input?: string }
): Promise<string> {
    try {
        const execOptions: any = {
            env: {
                ...process.env,
                GH_PAGER: '' // Disable pager for programmatic use
            }
        };
        
        if (options?.cwd) {
            execOptions.cwd = options.cwd;
        }
        
        if (options?.input) {
            execOptions.input = options.input;
        }
        
        const result = await execa(command, args, execOptions);
        
        return result.stdout || '';
    } catch (error) {
        const execaError = error as ExecaError;
        
        // Check for specific error conditions
        const stderr = typeof execaError.stderr === 'string' ? execaError.stderr : '';
        
        if (stderr.includes('gh auth login')) {
            throw new GitHubCLIError(
                'GitHub CLI is not authenticated. Please run: gh auth login',
                'NOT_AUTHENTICATED',
                `${command} ${args.join(' ')}`
            );
        }
        
        if (stderr.includes('command not found') || execaError.code === 'ENOENT') {
            throw new GitHubCLIError(
                'GitHub CLI is not installed. Please install gh CLI',
                'NOT_INSTALLED',
                `${command} ${args.join(' ')}`
            );
        }
        
        throw new GitHubCLIError(
            stderr || execaError.message,
            'COMMAND_FAILED',
            `${command} ${args.join(' ')}`
        );
    }
}