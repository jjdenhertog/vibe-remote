import { NextRequest, NextResponse } from 'next/server';
import { readPreferenceFile, writePreferenceFile, readJsonPreferenceFile, writeJsonPreferenceFile } from './file-preferences';

export type TextRouteConfig = {
    fileName: string;
    defaultContent: string;
    displayName: string;
}

export type JsonRouteConfig<T = unknown> = {
    fileName: string;
    defaultContent: T;
    displayName: string;
    validator?: (data: unknown) => { isValid: boolean; error?: string };
    preprocessor?: (data: unknown, defaultContent: T) => unknown;
}

/**
 * Creates a preference route handler for text/markdown files
 */
export function createTextPreferenceRoute(config: TextRouteConfig) {
    const { fileName, defaultContent, displayName } = config;

    const GET = async (): Promise<NextResponse> => {
        try {
            const content = await readPreferenceFile(fileName, defaultContent);

            return new NextResponse(content);
        } catch (error) {
            console.error(`Error reading ${fileName}:`, error);

            return new NextResponse(`Error loading ${displayName}`, { status: 500 });
        }
    };

    const POST = async (request: NextRequest): Promise<NextResponse> => {
        try {
            const content = await request.text();

            await writePreferenceFile(fileName, content);

            return new NextResponse(`${displayName} saved successfully`);
        } catch (error) {
            console.error(`Error saving ${fileName}:`, error);

            return new NextResponse(`Error saving ${displayName}`, { status: 500 });
        }
    };

    return { GET, POST };
}

/**
 * Creates a preference route handler for JSON files
 */
export function createJsonPreferenceRoute<T>(config: JsonRouteConfig<T>) {
    const { fileName, defaultContent, displayName, validator, preprocessor } = config;

    const GET = async (): Promise<NextResponse> => {
        try {
            const data = await readJsonPreferenceFile(fileName, defaultContent);

            return new NextResponse(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error reading ${fileName}:`, error);

            return new NextResponse(`Error loading ${displayName}`, { status: 500 });
        }
    };

    const POST = async (request: NextRequest): Promise<NextResponse> => {
        try {
            const requestContent = await request.text();

            // Parse and validate JSON
            let parsedData: unknown;
            try {
                parsedData = JSON.parse(requestContent);
            } catch {
                return new NextResponse('Invalid JSON format', { status: 400 });
            }

            // Apply preprocessor if provided
            if (preprocessor) {
                parsedData = preprocessor(parsedData, defaultContent);
            }

            // Run custom validator if provided
            if (validator) {
                const validationResult = validator(parsedData);
                if (!validationResult.isValid) {
                    return new NextResponse(
                        validationResult.error || `Invalid ${displayName} format`,
                        { status: 400 }
                    );
                }
            }

            await writeJsonPreferenceFile(fileName, parsedData);

            return new NextResponse(`${displayName} saved successfully`);
        } catch (error) {
            console.error(`Error saving ${fileName}:`, error);

            return new NextResponse(`Error saving ${displayName}`, { status: 500 });
        }
    };

    return { GET, POST };
}