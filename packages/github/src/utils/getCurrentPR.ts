import { execSync } from "node:child_process";

export default function getCurrentPR(currentBranch: string) {

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

    return null;

}