import { executeCommand } from './executeCommand';
import type { BranchStatus } from '../types/BranchStatus';

export async function getBranchStatus(baseBranch?: string): Promise<BranchStatus> {
    // Get current branch
    const currentBranch = await executeCommand('git', ['branch', '--show-current']);
    
    // Get HEAD commit
    const headCommit = await executeCommand('git', ['rev-parse', 'HEAD']);
    
    // Use provided base branch or default to main
    const base = baseBranch || 'main';
    
    // Get commits ahead/behind
    let commitsAhead = 0;
    let commitsBehind = 0;
    
    try {
        const revList = await executeCommand('git', [
            'rev-list',
            '--left-right',
            '--count',
            `${base}...${currentBranch}`
        ]);
        
        const [behind, ahead] = revList.trim().split('\t')
            .map(n => parseInt(n, 10));
        commitsBehind = behind || 0;
        commitsAhead = ahead || 0;
    } catch {
        // Branch comparison might fail if branches don't exist
        console.warn(`Could not compare ${currentBranch} with ${base}`);
    }
    
    // Check for uncommitted changes
    const statusOutput = await executeCommand('git', ['status', '--porcelain']);
    const statusLines = statusOutput.split('\n').filter(line => line.trim());
    
    const uncommittedCount = statusLines.filter(line => 
        line.startsWith(' M') || line.startsWith('M ')
    ).length;
    
    const untrackedCount = statusLines.filter(line => 
        line.startsWith('??')
    ).length;
    
    const hasUncommittedChanges = statusLines.length > 0;
    
    return {
        currentBranch: currentBranch.trim(),
        baseBranch: base,
        headCommit: headCommit.trim(),
        commitsAhead,
        commitsBehind,
        hasUncommittedChanges,
        uncommittedCount,
        untrackedCount
    };
}