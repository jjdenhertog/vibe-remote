export async function readStdin(): Promise<string> {
    return new Promise((resolve) => {
        let data = '';
        
        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
            const chunk = process.stdin.read();
            if (chunk !== null) {
                data += chunk;
            }
        });

        process.stdin.on('end', () => {
            resolve(data);
        });
    });
}