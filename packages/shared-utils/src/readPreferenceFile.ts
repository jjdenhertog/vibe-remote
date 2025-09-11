import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path/posix';

export function readPreferenceFile(templatePath: string, directory: string = '/workspace/data/preferences') {
    const path = join(directory, templatePath);
    if (!existsSync(path))
        return null;

    return readFileSync(path, 'utf8');
}
