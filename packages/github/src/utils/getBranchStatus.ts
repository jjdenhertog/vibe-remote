import { execSync } from "node:child_process";

export type BranchPushStatus = {
    needsPush: boolean;
    commitsAhead: number;
    commitsArePushed: boolean;
};

export function getBranchStatus(branchName: string): BranchPushStatus {
    try {
        // Get the status of the current branch compared to its upstream
        const statusOutput = execSync(`git status --porcelain=v1 --branch`, { encoding: 'utf8' });
        
        // Parse the branch status line (first line starting with ##)
        const [branchLine] = statusOutput.split('\n');
        
        let commitsAhead = 0;
        let commitsArePushed = true;
        
        // Check if branch has commits ahead of origin
        if (branchLine && branchLine.includes('ahead')) {
            const aheadMatch = branchLine.match(/ahead (\d+)/);
            if (aheadMatch && aheadMatch[1]) {
                commitsAhead = parseInt(aheadMatch[1], 10);
                commitsArePushed = false;
            }
        }
        
        // Also check for unpushed commits using git log
        try {
            const unpushedCommits = execSync(`git log origin/${branchName}..HEAD --oneline`, { 
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'ignore'] // Ignore stderr in case origin branch doesn't exist
            });
            
            if (unpushedCommits.trim()) {
                const commitCount = unpushedCommits.trim().split('\n').length;
                commitsAhead = Math.max(commitsAhead, commitCount);
                commitsArePushed = false;
            }
        } catch {
            // If origin branch doesn't exist, check if we have any commits at all
            if (commitsAhead === 0) {
                try {
                    const localCommits = execSync(`git rev-list --count HEAD`, { encoding: 'utf8' });
                    const commitCount = parseInt(localCommits.trim(), 10);
                    if (commitCount > 0) {
                        commitsAhead = commitCount;
                        commitsArePushed = false;
                    }
                } catch {
                    // Branch might be empty
                }
            }
        }
        
        return {
            needsPush: !commitsArePushed && commitsAhead > 0,
            commitsAhead,
            commitsArePushed
        };
        
    } catch (error) {
        console.error('Error checking branch status:', error);

        // If we can't determine status, assume we need to push to be safe
        return {
            needsPush: true,
            commitsAhead: 0,
            commitsArePushed: false
        };
    }
}