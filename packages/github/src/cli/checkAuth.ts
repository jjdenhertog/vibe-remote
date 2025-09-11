import { executeCommand } from './executeCommand';

export async function checkAuth(): Promise<boolean> {
    try {
        await executeCommand('gh', ['auth', 'status']);

        return true;
    } catch {
        return false;
    }
}

export async function ensureAuth(): Promise<void> {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        throw new Error('GitHub CLI is not authenticated. Please run: gh auth login');
    }
}