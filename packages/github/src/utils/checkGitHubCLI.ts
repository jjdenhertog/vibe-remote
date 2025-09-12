import { execSync } from 'node:child_process';


export function checkGitHubCLI(): boolean {
    try {
        execSync('gh --version', { encoding: 'utf8' });

        return true;
    } catch {
        return false;
    }
}
