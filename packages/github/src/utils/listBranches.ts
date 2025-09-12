import { execSync } from 'node:child_process';
import type { BranchInfo } from '../types/BranchInfo';
import { getCurrentBranch } from './getCurrentBranch';

function parseBranchOutput(output: string, currentBranch: string, isRemote: boolean): BranchInfo[] {
    const result: BranchInfo[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
        const [name, date] = line.split('|');

        if (name) {
            result.push({
                name: isRemote ? name : name,
                is_current: !isRemote && name === currentBranch,
                is_remote: isRemote,
                last_commit_date: date || new Date().toISOString()
            });
        }
    }

    return result;
}

function parseRemoteBranches(output: string, localBranchNamesSet: Set<string>): BranchInfo[] {
    const result: BranchInfo[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
        const [fullName, date] = line.split('|');

        if (!fullName)
            continue;

        // Remove 'origin/' prefix
        const name = fullName.replace('origin/', '');

        // Skip if we already have this as a local branch or if it's HEAD
        if (!localBranchNamesSet.has(name) && name !== 'HEAD') {
            result.push({
                name: `origin/${name}`,
                is_current: false,
                is_remote: true,
                last_commit_date: date || new Date().toISOString()
            });
        }
    }

    return result;
}

async function fetchRemoteBranches(localBranchNamesSet: Set<string>): Promise<BranchInfo[]> {
    try {
        execSync('git fetch --prune', { encoding: 'utf8', stdio: 'pipe' });

        const remoteBranchesOutput = execSync(
            'git for-each-ref --format="%(refname:short)|%(committerdate:iso8601)" refs/remotes/origin/',
            { encoding: 'utf8' }
        ).trim();

        if (!remoteBranchesOutput)
            return [];

        return parseRemoteBranches(remoteBranchesOutput, localBranchNamesSet);
    } catch {
        // Remote fetch might fail if not connected to network
        console.log('Note: Could not fetch remote branches');

        return [];
    }
}

export async function listBranches(): Promise<BranchInfo[]> {
    const branches: BranchInfo[] = [];

    try {
        // Get current branch
        const currentBranch = getCurrentBranch();

        // Get all local branches with last commit date
        const localBranchesOutput = execSync(
            'git for-each-ref --format="%(refname:short)|%(committerdate:iso8601)" refs/heads/',
            { encoding: 'utf8' }
        ).trim();

        if (localBranchesOutput) {
            const localBranches = parseBranchOutput(localBranchesOutput, currentBranch, false);
            branches.push(...localBranches);
        }

        // Get remote branches that aren't already tracked locally
        const localBranchNamesSet = new Set(branches.map(b => b.name));
        const remoteBranches = await fetchRemoteBranches(localBranchNamesSet);
        branches.push(...remoteBranches);

        // Sort branches: current first, then local, then remote, alphabetically within each group
        branches.sort((a, b) => {
            if (a.is_current && !b.is_current) return -1;

            if (!a.is_current && b.is_current) return 1;

            if (!a.is_remote && b.is_remote) return -1;

            if (a.is_remote && !b.is_remote) return 1;

            return a.name.localeCompare(b.name);
        });

    } catch (error) {
        console.error('Error listing branches:', error);
        throw new Error(`Failed to list branches: ${String(error)}`);
    }

    return branches;
}