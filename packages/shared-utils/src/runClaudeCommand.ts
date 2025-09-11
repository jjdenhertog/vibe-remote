import { spawn } from 'node:child_process';


type RunClaudeCommandOptions = {
    promptFile: string;
    additionalArgs?: string[];
    verbose?: boolean;
    streamOutput?: boolean;
};

export function runClaudeCommand(options: RunClaudeCommandOptions): Promise<void> {

    const { promptFile, additionalArgs = [], verbose = true, streamOutput = true } = options;

    return new Promise((resolve, reject) => {
        const baseArgs = [
            '-p', `Read and execute the this file ${promptFile}`,
            '--dangerously-skip-permissions'
        ];

        if (verbose)
            baseArgs.push('--verbose');

        if (streamOutput)
            baseArgs.push('--output-format=stream-json');

        // Filter out base args from additionalArgs to prevent conflicts
        const baseArgKeys = new Set(['-p', '--dangerously-skip-permissions', '--verbose', '--output-format']);
        const filteredAdditionalArgs = additionalArgs.filter(arg => {
            const [argKey] = arg.split('=');

            return !baseArgKeys.has(arg) && !baseArgKeys.has(argKey ?? '');
        });

        const claude = spawn('claude', [...baseArgs, ...filteredAdditionalArgs], { stdio: ['inherit', 'pipe', 'pipe'] });

        claude.stdout.on('data', (data) => { process.stdout.write(data); });
        claude.stderr.on('data', (data) => { process.stderr.write(data); });

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