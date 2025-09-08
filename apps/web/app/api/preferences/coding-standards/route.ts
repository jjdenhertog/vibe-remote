import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const PREFERENCES_DIR = '/workspace/data/preferences';
const CODING_STANDARDS_FILE = join(PREFERENCES_DIR, 'coding-standards.md');

const DEFAULT_CODING_STANDARDS = `# Coding Standards

## General Principles
- Write clean, readable, and maintainable code
- Follow established conventions and patterns
- Prioritize simplicity and clarity

## Code Style
- Use consistent indentation (4 spaces)
- Follow naming conventions
- Add meaningful comments where necessary

## TypeScript/JavaScript
- Use TypeScript for type safety
- Prefer const over let when possible
- Use async/await over Promises chains

## React/Next.js
- Use functional components
- Follow React hooks best practices
- Use useCallback for event handlers

## File Organization
- Group related files together
- Use descriptive file names
- Maintain consistent directory structure
`;

export async function GET() {
    try {
        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        // Check if file exists, create with default content if not
        if (!existsSync(CODING_STANDARDS_FILE)) {
            await writeFile(CODING_STANDARDS_FILE, DEFAULT_CODING_STANDARDS);

            return new NextResponse(DEFAULT_CODING_STANDARDS);
        }

        const content = await readFile(CODING_STANDARDS_FILE, 'utf8');

        return new NextResponse(content);
    } catch (error) {
        console.error('Error reading coding-standards.md:', error);

        return new NextResponse('Error loading coding standards', { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const content = await request.text();

        // Ensure directory exists
        if (!existsSync(PREFERENCES_DIR)) {
            await mkdir(PREFERENCES_DIR, { recursive: true });
        }

        await writeFile(CODING_STANDARDS_FILE, content);

        return new NextResponse('Coding standards saved successfully');
    } catch (error) {
        console.error('Error saving coding-standards.md:', error);

        return new NextResponse('Error saving coding standards', { status: 500 });
    }
}