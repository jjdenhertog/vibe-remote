export function validateEnvironment(): void {
    if (!process.cwd().includes('/worktrees/')) {
        throw new Error('Must be run from a vibe-kanban worktree directory');
    }
}