import { execSync } from 'node:child_process';
import type { VibeKanbanContext } from '@vibe-remote/vibe-kanban-api/utils/fetchVibeKanbanContext';
import { checkGitHubCLI } from './checkGitHubCLI';
import { isAuthenticated } from './isAuthenticated';

/**
 * Create a pull request using GitHub CLI with VibeKanban context
 * This replaces the GitHub API call for PR creation
 */
export async function createPullRequest(context: VibeKanbanContext): Promise<string> {


    if (!checkGitHubCLI())
        throw new Error('GitHub CLI not installed. Please install it from https://cli.github.com/');

    if (!isAuthenticated())
        throw new Error('GitHub CLI not authenticated. Please run: gh auth login');


    const currentBranch = context.taskAttempt.branch;
    if (!currentBranch)
        throw new Error('No current branch found');

    // Check if PR already exists
    const existingPrJson = execSync(`gh pr list --head ${currentBranch} --json url --limit 1`, { encoding: 'utf8' });
    const existingPrs = JSON.parse(existingPrJson || '[]');

    if (existingPrs.length > 0) {
        const existingUrl = existingPrs[0].url;
        console.log(`ℹ️ Pull request already exists: ${existingUrl}`);

        return existingUrl;
    }

    // Ensure branch is pushed first
    console.log(`Ensuring branch '${currentBranch}' is pushed...`);
    try {
        execSync(`git push -u origin ${currentBranch}`, {
            encoding: 'utf8',
            stdio: 'pipe'
        });
    } catch {
        console.log('Note: Branch push failed, it may already exist on remote');
    }

    // Build PR creation command
    const args: string[] = ['pr', 'create'];

    // Use task title and description from context
    args.push('--title', JSON.stringify(context.task.title));
    if (context.task.description)
        args.push('--body', JSON.stringify(context.task.description));

    console.log('Creating pull request...');

    try {
        const output = execSync(`gh ${args.join(' ')}`, {
            encoding: 'utf8'
        }).trim();

        const prUrl = output.split('\n').pop() || output;
        console.log(`✅ Pull request created: ${prUrl}`);

        return prUrl;
    } catch (error) {

        throw new Error(`Failed to create pull request: ${String(error)}`);
    }
}