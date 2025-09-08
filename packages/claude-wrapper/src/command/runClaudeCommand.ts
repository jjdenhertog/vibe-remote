import { spawn } from 'node:child_process';

export function runClaudeCommand(promptFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const claude = spawn('claude', [
            '-p', `Read and execute the this file ${promptFile}`,
            '--dangerously-skip-permissions',
            '--verbose',
            '--output-format=stream-json'
        ], {
            stdio: ['inherit', 'pipe', 'pipe']
        });

        claude.stdout.on('data', (data) => {
            process.stdout.write(data);
        });

        claude.stderr.on('data', (data) => {
            process.stderr.write(data);
        });

        claude.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Claude command exited with code ${code}`));
            }
        });

        claude.on('error', (error) => {
            reject(error);
        });
    });
}