import { executeCommand } from './executeCommand';
import { ensureAuth } from './checkAuth';

export async function pushBranch(branch?: string): Promise<void> {
    // Ensure we're authenticated
    await ensureAuth();
    
    // Get current branch if not specified
    const branchToPush = branch || await executeCommand('git', ['branch', '--show-current']);
    
    // Push with upstream tracking
    await executeCommand('git', ['push', '-u', 'origin', branchToPush.trim()]);
    
    console.log(`✅ Successfully pushed ${branchToPush.trim()} to GitHub`);
}