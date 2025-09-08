import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('path');
    
        if (!filePath) {
            return NextResponse.json(
                { error: 'File path is required' },
                { status: 400 }
            );
        }
    
        // Security: Prevent path traversal attacks
        if (filePath.includes('..') || filePath.includes('~')) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            );
        }
    
        // For development, return mock content based on file type
        const mockContent = getMockFileContent(filePath);
    
        return NextResponse.json({
            content: mockContent,
            lastModified: new Date().toISOString(),
        });
    
    } catch (error) {
        console.error('Error loading file:', error);

        return NextResponse.json(
            { error: 'Failed to load file' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { path, content } = await request.json();
    
        if (!path || content === undefined) {
            return NextResponse.json(
                { error: 'Path and content are required' },
                { status: 400 }
            );
        }
    
        // Security: Prevent path traversal attacks
        if (path.includes('..') || path.includes('~')) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            );
        }
    
        // For development, we'll simulate saving by logging
        console.log(`Simulated save to ${path}:`, content);
    
        return NextResponse.json({ success: true });
    
    } catch (error) {
        console.error('Error saving file:', error);

        return NextResponse.json(
            { error: 'Failed to save file' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { path } = await request.json();
    
        if (!path) {
            return NextResponse.json(
                { error: 'File path is required' },
                { status: 400 }
            );
        }
    
        // Security: Prevent path traversal attacks
        if (path.includes('..') || path.includes('~')) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            );
        }
    
        // For development, we'll simulate deletion by logging
        console.log(`Simulated deletion of ${path}`);
    
        return NextResponse.json({ success: true });
    
    } catch (error) {
        console.error('Error deleting file:', error);

        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}

function getMockFileContent(filePath: string): string {
    const extension = filePath.split('.').pop()
        ?.toLowerCase();
  
    switch (extension) {
        case 'json':
            if (filePath.includes('app.json')) {
                return JSON.stringify({
                    name: 'vibe-kanban',
                    version: '1.0.0',
                    description: 'Task management and configuration system',
                    debug: true,
                    database: {
                        host: 'localhost',
                        port: 5432,
                        name: 'vibe_kanban'
                    },
                    redis: {
                        host: 'localhost',
                        port: 6379
                    },
                    logging: {
                        level: 'debug',
                        format: 'json'
                    }
                }, null, 2);
            }

            if (filePath.includes('settings.json')) {
                return JSON.stringify({
                    'editor.tabSize': 2,
                    'editor.insertSpaces': true,
                    'editor.formatOnSave': true,
                    'editor.codeActionsOnSave': {
                        'source.fixAll': 'explicit'
                    },
                    'typescript.preferences.importModuleSpecifier': 'relative'
                }, null, 2);
            }

            return '{\n  "example": "value",\n  "nested": {\n    "key": "value"\n  }\n}';
      
        case 'yaml':
        case 'yml':
            return `# Database configuration
host: localhost
port: 5432
database: vibe_kanban
username: postgres
password: ""
ssl: false

# Redis configuration  
redis:
  host: localhost
  port: 6379
  db: 0

# Application settings
app:
  name: vibe-kanban
  version: 1.0.0
  debug: true
  
# Logging configuration
logging:
  level: info
  format: json
  outputs:
    - console
    - file`;
      
        case 'toml':
            return `[database]
host = "localhost"
port = 5432
database = "vibe_kanban"
username = "postgres"
password = ""
ssl = false

[redis]
host = "localhost"
port = 6379
db = 0

[app]
name = "vibe-kanban"
version = "1.0.0"
debug = true

[logging]
level = "info"
format = "json"
outputs = ["console", "file"]`;
      
        case 'ini':
        case 'conf':
        case 'cfg':
            return `; Application configuration
[app]
name=vibe-kanban
version=1.0.0
debug=true

[database]
host=localhost
port=5432
database=vibe_kanban
username=postgres
password=
ssl=false

[redis]  
host=localhost
port=6379
db=0

[logging]
level=info
format=json`;
      
        default:
            return `# Configuration file
# This is an example configuration file
# Edit as needed for your application

# Example setting
example_setting=value

# Another example  
another_setting=another_value`;
    }
}