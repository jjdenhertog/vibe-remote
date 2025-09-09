import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const PREFERENCES_DIR = '/workspace/data/preferences';
const AUTOMATIONS_FILE = join(PREFERENCES_DIR, 'automations.json');

const DEFAULT_AUTOMATIONS = {
    automaticallyCreatePR: false,
    doCodeReviewBeforeFinishing: false,
    automaticTaskPicking: false,
    baseBranch: 'main'
};

export async function GET() {
    try {
        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        // Check if file exists, create with default content if not
        if (!existsSync(AUTOMATIONS_FILE)) {
            await writeFile(AUTOMATIONS_FILE, JSON.stringify(DEFAULT_AUTOMATIONS, null, 2));

            return new NextResponse(JSON.stringify(DEFAULT_AUTOMATIONS, null, 2));
        }

        const content = await readFile(AUTOMATIONS_FILE, 'utf8');

        return new NextResponse(content);
    } catch (error) {
        console.error('Error reading automations.json:', error);

        return new NextResponse('Error loading automation settings', { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const content = await request.text();

        // Validate JSON format
        try {
            const parsed = JSON.parse(content);
            
            // Validate required fields
            if (typeof parsed.automaticallyCreatePR !== 'boolean' || 
                typeof parsed.doCodeReviewBeforeFinishing !== 'boolean' ||
                typeof parsed.automaticTaskPicking !== 'boolean' ||
                typeof parsed.baseBranch !== 'string') {
                return new NextResponse('Invalid automation settings format', { status: 400 });
            }
        } catch {
            return new NextResponse('Invalid JSON format', { status: 400 });
        }

        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        await writeFile(AUTOMATIONS_FILE, content);

        return new NextResponse('Automation settings saved successfully');
    } catch (error) {
        console.error('Error saving automations.json:', error);

        return new NextResponse('Error saving automation settings', { status: 500 });
    }
}