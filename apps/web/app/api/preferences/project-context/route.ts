import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const PREFERENCES_DIR = '/workspace/data/preferences';
const PROJECT_CONTEXT_FILE = join(PREFERENCES_DIR, 'project-context.md');

const DEFAULT_PROJECT_CONTEXT = `# Project Context

## Project Purpose
Define the main purpose and goals of this project.

## Core Requirements
- List key requirements
- Define success criteria
- Outline constraints

## Target Users
Describe who will use this system and how.

## Technical Constraints
- Performance requirements
- Security considerations
- Compatibility needs
`;

export async function GET() {
    try {
        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        // Check if file exists, create with default content if not
        if (!existsSync(PROJECT_CONTEXT_FILE)) {
            await writeFile(PROJECT_CONTEXT_FILE, DEFAULT_PROJECT_CONTEXT);

            return new NextResponse(DEFAULT_PROJECT_CONTEXT);
        }

        const content = await readFile(PROJECT_CONTEXT_FILE, 'utf8');

        return new NextResponse(content);
    } catch (error) {
        console.error('Error reading project-context.md:', error);

        return new NextResponse('Error loading project context', { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const content = await request.text();

        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        await writeFile(PROJECT_CONTEXT_FILE, content);

        return new NextResponse('Project context saved successfully');
    } catch (error) {
        console.error('Error saving project-context.md:', error);

        return new NextResponse('Error saving project context', { status: 500 });
    }
}