import { execSync } from 'node:child_process';


export function isAuthenticated(): boolean {
    try {
        execSync('gh auth status', { encoding: 'utf8' });

        return true;
    } catch {
        return false;
    }
}
