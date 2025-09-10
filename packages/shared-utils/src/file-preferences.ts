import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const PREFERENCES_DIR = '/workspace/data/preferences';

/**
 * Ensures the preferences directory exists
 */
export async function ensurePreferencesDir(): Promise<void> {
    if (!existsSync(PREFERENCES_DIR)) {
        await mkdir(PREFERENCES_DIR, { recursive: true });
    }
}

/**
 * Reads a preference file with default content fallback
 * @param fileName - The name of the file (e.g., 'coding-standards.md')
 * @param defaultContent - Default content if file doesn't exist
 * @returns The file content
 */
export async function readPreferenceFile(
    fileName: string,
    defaultContent: string
): Promise<string> {
    const filePath = join(PREFERENCES_DIR, fileName);

    await ensurePreferencesDir();

    if (!existsSync(filePath)) {
        await writeFile(filePath, defaultContent);

        return defaultContent;
    }

    try {
        return await readFile(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);

        return defaultContent;
    }
}

/**
 * Writes content to a preference file
 * @param fileName - The name of the file (e.g., 'coding-standards.md')
 * @param content - Content to write
 */
export async function writePreferenceFile(
    fileName: string,
    content: string
): Promise<void> {
    const filePath = join(PREFERENCES_DIR, fileName);

    await ensurePreferencesDir();
    await writeFile(filePath, content);
}

/**
 * Reads JSON preference file with default content fallback
 * @param fileName - The name of the JSON file (e.g., 'automations.json')
 * @param defaultContent - Default object if file doesn't exist
 * @returns The parsed JSON object
 */
export async function readJsonPreferenceFile<T>(
    fileName: string,
    defaultContent: T
): Promise<T> {
    const filePath = join(PREFERENCES_DIR, fileName);

    await ensurePreferencesDir();

    if (!existsSync(filePath)) {
        await writeFile(filePath, JSON.stringify(defaultContent, null, 2));

        return defaultContent;
    }

    try {
        const content = await readFile(filePath, 'utf8');

        return JSON.parse(content) as T;
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);

        return defaultContent;
    }
}

/**
 * Writes a JSON object to a preference file
 * @param fileName - The name of the JSON file (e.g., 'automations.json')
 * @param data - Object to write
 */
export async function writeJsonPreferenceFile(
    fileName: string,
    data: unknown
): Promise<void> {
    const filePath = join(PREFERENCES_DIR, fileName);

    await ensurePreferencesDir();
    await writeFile(filePath, JSON.stringify(data, null, 2));
}