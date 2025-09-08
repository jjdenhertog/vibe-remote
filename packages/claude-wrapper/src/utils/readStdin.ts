export async function readStdin(timeout: number = 1000): Promise<string> {
    return new Promise((resolve) => {
        let data = '';
        const timer = setTimeout(() => {
            process.stdin.pause();
            resolve(data);
        }, timeout);

        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
            const chunk = process.stdin.read();
            if (chunk !== null) {
                data += chunk;
            }
        });

        process.stdin.on('end', () => {
            clearTimeout(timer);
            resolve(data);
        });
    });
}