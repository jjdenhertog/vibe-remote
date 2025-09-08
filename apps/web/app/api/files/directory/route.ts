import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dirPath = searchParams.get('path') || '/config';
    
        // Security: Prevent path traversal attacks
        if (dirPath.includes('..')) {
            return NextResponse.json(
                { error: 'Invalid directory path' },
                { status: 400 }
            );
        }
    
        // For development, return mock directory structure
        const mockFiles = getMockDirectoryFiles(dirPath);
    
        return NextResponse.json({
            files: mockFiles,
        });
    
    } catch (error) {
        console.error('Error loading directory:', error);

        return NextResponse.json(
            { error: 'Failed to load directory' },
            { status: 500 }
        );
    }
}

function getMockDirectoryFiles(dirPath: string) {
    const baseFiles = [
        {
            path: '/config/app.json',
            name: 'app.json',
            size: 245,
            lastModified: new Date(Date.now() - 3_600_000).toISOString(), // 1 hour ago
            type: 'file',
        },
        {
            path: '/config/database.yaml',
            name: 'database.yaml',
            size: 178,
            lastModified: new Date(Date.now() - 7_200_000).toISOString(), // 2 hours ago
            type: 'file',
        },
        {
            path: '/config/redis.toml',
            name: 'redis.toml',
            size: 98,
            lastModified: new Date(Date.now() - 86_400_000).toISOString(), // 1 day ago
            type: 'file',
        },
        {
            path: '/config/logging.ini',
            name: 'logging.ini',
            size: 156,
            lastModified: new Date(Date.now() - 172_800_000).toISOString(), // 2 days ago
            type: 'file',
        },
        {
            path: '/config/environment.env',
            name: 'environment.env',
            size: 234,
            lastModified: new Date(Date.now() - 259_200_000).toISOString(), // 3 days ago
            type: 'file',
        }
    ];
  
    const vscodeFiles = [
        {
            path: '.vscode/settings.json',
            name: 'settings.json',
            size: 187,
            lastModified: new Date(Date.now() - 345_600_000).toISOString(), // 4 days ago
            type: 'file',
        },
        {
            path: '.vscode/launch.json',
            name: 'launch.json',
            size: 298,
            lastModified: new Date(Date.now() - 432_000_000).toISOString(), // 5 days ago
            type: 'file',
        },
        {
            path: '.vscode/tasks.json',
            name: 'tasks.json',
            size: 156,
            lastModified: new Date(Date.now() - 518_400_000).toISOString(), // 6 days ago
            type: 'file',
        }
    ];
  
    const userConfigFiles = [
        {
            path: '~/.config/git/config',
            name: 'config',
            size: 89,
            lastModified: new Date(Date.now() - 604_800_000).toISOString(), // 1 week ago
            type: 'file',
        },
        {
            path: '~/.config/npm/config',
            name: 'config',
            size: 67,
            lastModified: new Date(Date.now() - 691_200_000).toISOString(), // 8 days ago
            type: 'file',
        }
    ];
  
    if (dirPath === '/config') {
        return baseFiles;
    } else if (dirPath === '.vscode' || dirPath.includes('.vscode')) {
        return vscodeFiles;
    } else if (dirPath.includes('.config') || dirPath.startsWith('~/.config')) {
        return userConfigFiles;
    }
 
    // Return all files for root or unknown paths
    return [...baseFiles, ...vscodeFiles, ...userConfigFiles];
  
}