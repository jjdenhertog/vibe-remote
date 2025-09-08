import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { path, content, type } = await request.json();
    
        if (!path || content === undefined || !type) {
            return NextResponse.json(
                { error: 'Path, content, and type are required' },
                { status: 400 }
            );
        }
    
        const validationResult = validateContent(content, type);
    
        if (!validationResult.isValid) {
            return NextResponse.json(
                { 
                    error: 'Validation failed',
                    message: validationResult.errors.join(', '),
                    details: validationResult
                },
                { status: 400 }
            );
        }
    
        return NextResponse.json({
            success: true,
            message: 'Validation passed',
            warnings: validationResult.warnings,
        });
    
    } catch (error) {
        console.error('Error validating file:', error);

        return NextResponse.json(
            { error: 'Failed to validate file' },
            { status: 500 }
        );
    }
}

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateContent(content: string, type: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
    };

    if (!content.trim()) {
        result.warnings.push('File is empty');

        return result;
    }

    switch (type) {
        case 'json':
            return validateJSON(content);
        case 'yaml':
            return validateYAML(content);
        case 'toml':
            return validateTOML(content);
        case 'ini':
            return validateINI(content);
        default:
            return result;
    }
}

function validateJSON(content: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
    };

    try {
        const parsed = JSON.parse(content);
    
        // Additional validations
        if (typeof parsed !== 'object' || parsed === null) {
            result.warnings.push('JSON should typically be an object at root level');
        }
    
        if (content.includes('\t')) {
            result.warnings.push('Consider using spaces instead of tabs');
        }
    
        // Check for trailing commas
        if (/,\s*[\]}]/.test(content)) {
            result.errors.push('Trailing commas are not allowed in JSON');
            result.isValid = false;
        }
    
    } catch (error) {
        result.isValid = false;
        result.errors.push(`Invalid JSON: ${(error as Error).message}`);
    }

    return result;
}

function validateYAML(content: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
    };

    const lines = content.split('\n');
  
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        const trimmed = line.trim();
    
        if (!trimmed || trimmed.startsWith('#')) continue;
    
        if (line.includes('\t')) {
            result.errors.push(`Line ${i + 1}: YAML should use spaces, not tabs`);
            result.isValid = false;
        }
    }

    return result;
}

function validateTOML(content: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
    };

    const lines = content.split('\n');
    const sections = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        const trimmed = line.trim();
    
        if (!trimmed || trimmed.startsWith('#')) continue;
    
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            const section = trimmed.slice(1, -1);
            if (sections.has(section)) {
                result.errors.push(`Line ${i + 1}: Duplicate section [${section}]`);
                result.isValid = false;
            }

            sections.add(section);
        }
    }

    return result;
}

function validateINI(content: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
    };

    const lines = content.split('\n');
  
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        const trimmed = line.trim();
    
        if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) continue;
    
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            const section = trimmed.slice(1, -1);
            if (!section) {
                result.errors.push(`Line ${i + 1}: Empty section name`);
                result.isValid = false;
            }
        } else if (trimmed.includes('=')) {
            const [key] = trimmed.split('=');
            if (!key?.trim()) {
                result.errors.push(`Line ${i + 1}: Empty key`);
                result.isValid = false;
            }
        } else {
            result.errors.push(`Line ${i + 1}: Invalid line format`);
            result.isValid = false;
        }
    }

    return result;
}