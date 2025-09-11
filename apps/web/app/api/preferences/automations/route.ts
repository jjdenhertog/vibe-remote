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
    baseBranch: 'main',
    automaticallyMergePR: false,
    mergeDecisionMode: 'claude-decision'
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
        const requestContent = await request.text();

        // Validate JSON format
        let finalContent: string;
        try {
            const parsed = JSON.parse(requestContent);
            
            // Validate required fields
            if (typeof parsed.automaticallyCreatePR !== 'boolean' || 
                typeof parsed.doCodeReviewBeforeFinishing !== 'boolean' ||
                typeof parsed.automaticTaskPicking !== 'boolean' ||
                typeof parsed.baseBranch !== 'string') {
                return new NextResponse('Invalid automation settings format', { status: 400 });
            }

            // Validate optional auto-merge fields if present
            if (parsed.automaticallyMergePR !== undefined && typeof parsed.automaticallyMergePR !== 'boolean') {
                return new NextResponse('automaticallyMergePR must be a boolean', { status: 400 });
            }

            if (parsed.mergeDecisionMode !== undefined && 
                (typeof parsed.mergeDecisionMode !== 'string' || 
                !['always', 'claude-decision'].includes(parsed.mergeDecisionMode))) {
                return new NextResponse('mergeDecisionMode must be either "always" or "claude-decision"', { status: 400 });
            }

            // Set defaults for missing auto-merge fields
            const validatedData = {
                ...parsed,
                automaticallyMergePR: parsed.automaticallyMergePR ?? DEFAULT_AUTOMATIONS.automaticallyMergePR,
                mergeDecisionMode: parsed.mergeDecisionMode ?? DEFAULT_AUTOMATIONS.mergeDecisionMode
            };

            // Set final content with validated data
            finalContent = JSON.stringify(validatedData, null, 2);
        } catch {
            return new NextResponse('Invalid JSON format', { status: 400 });
        }

        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        await writeFile(AUTOMATIONS_FILE, finalContent);

        return new NextResponse('Automation settings saved successfully');
    } catch (error) {
        console.error('Error saving automations.json:', error);

        return new NextResponse('Error saving automation settings', { status: 500 });
    }
}