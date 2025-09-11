import { spawn } from 'node:child_process';

function parseProgressMessage(chunk: string): void {
    const lines = chunk.split('\n').filter((line: string) => line.trim());

    for (const line of lines) {
        try {
            const json = JSON.parse(line);

            if (json.type === 'assistant' && json.message?.content?.[0]?.text) {
                const [content] = json.message.content;
                const { text } = content;

                if (text.length < 100) {
                    // eslint-disable-next-line no-console
                    console.log(`🤖 ${text}`);
                }
            }
        } catch {
            // Ignore invalid JSON
        }
    }
}

type RunClaudeCommandOptions = {
    promptFile: string;
    additionalArgs?: string[];
    verbose?: boolean;
    streamOutput?: boolean;
    showProgress?: boolean;
};

export function runClaudeCommand(options: RunClaudeCommandOptions): Promise<void> {

    const { promptFile, additionalArgs = [], verbose = true, streamOutput = true, showProgress = false } = options;

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

        const finalArgs = [...baseArgs, ...filteredAdditionalArgs];
        
        // Use 'ignore' for stdin to prevent hanging in bash scripts, 'pipe' for stdout/stderr
        const claude = spawn('claude', finalArgs, { 
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false 
        });

        claude.stdout.on('data', (data) => {
            const chunk = data.toString();

            if (showProgress) {
                parseProgressMessage(chunk);
            }

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

        // Add timeout to prevent indefinite hanging
        const timeout = setTimeout(() => {
            claude.kill('SIGTERM');
            reject(new Error('Claude command timed out after 5 minutes'));
        }, 5 * 60 * 1000); // 5 minutes

        claude.on('close', () => {
            clearTimeout(timeout);
        });
    });
}