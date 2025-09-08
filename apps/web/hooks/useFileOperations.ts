'use client';

import { useCallback } from 'react';

export type ConfigFile = {
  path: string;
  name: string;
  content: string;
  modified: boolean;
  type: string;
  size: number;
  lastModified: Date;
}

export function useFileOperations() {
    const loadFile = useCallback(async (path: string): Promise<ConfigFile> => {
    // Simulate API call - replace with actual implementation
        const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
        if (!response.ok) {
            throw new Error(`Failed to load file: ${response.statusText}`);
        }
    
        const data = await response.json();

        return {
            path,
            name: path.split('/').pop() || '',
            content: data.content,
            modified: false,
            type: getFileType(path),
            size: new Blob([data.content]).size,
            lastModified: new Date(data.lastModified || Date.now()),
        };
    }, []);

    const saveFile = useCallback(async (file: ConfigFile): Promise<void> => {
        const response = await fetch('/api/files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: file.path,
                content: file.content,
            }),
        });
    
        if (!response.ok) {
            throw new Error(`Failed to save file: ${response.statusText}`);
        }
    }, []);

    const loadDirectory = useCallback(async (path: string): Promise<ConfigFile[]> => {
        try {
            const response = await fetch(`/api/files/directory?path=${encodeURIComponent(path)}`);
            if (!response.ok) {
                // Return empty array for missing directories instead of throwing
                if (response.status === 404) return [];

                throw new Error(`Failed to load directory: ${response.statusText}`);
            }
      
            const data = await response.json();

            return data.files.map((file: any) => ({
                path: file.path,
                name: file.name,
                content: '',
                modified: false,
                type: getFileType(file.path),
                size: file.size,
                lastModified: new Date(file.lastModified),
            }));
        } catch (_error) {
            // For now, return mock data for development
            return createMockFiles(path);
        }
    }, []);

    const createFile = useCallback(async (fileName: string, content: string = ''): Promise<ConfigFile> => {
        const path = `/config/${fileName}`;
        const file: ConfigFile = {
            path,
            name: fileName,
            content,
            modified: true,
            type: getFileType(fileName),
            size: new Blob([content]).size,
            lastModified: new Date(),
        };

        // Save the file
        await saveFile(file);
    
        return {
            ...file,
            modified: false,
        };
    }, [saveFile]);

    const deleteFile = useCallback(async (path: string): Promise<void> => {
        const response = await fetch('/api/files', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path }),
        });
    
        if (!response.ok) {
            throw new Error(`Failed to delete file: ${response.statusText}`);
        }
    }, []);

    const validateFile = useCallback(async (file: ConfigFile): Promise<void> => {
    // Perform client-side validation
        if (file.type === 'json') {
            try {
                JSON.parse(file.content);
            } catch (_error) {
                throw new Error('Invalid JSON syntax');
            }
        }
    
        // Additional server-side validation could be added here
        const response = await fetch('/api/files/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: file.path,
                content: file.content,
                type: file.type,
            }),
        });
    
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Validation failed');
        }
    }, []);

    return {
        loadFile,
        saveFile,
        loadDirectory,
        createFile,
        deleteFile,
        validateFile,
    };
}

function getFileType(path: string): ConfigFile['type'] {
    const extension = path.split('.').pop()
        ?.toLowerCase();
    switch (extension) {
        case 'json':
            return 'json';
        case 'yaml':
        case 'yml':
            return 'yaml';
        case 'toml':
            return 'toml';
        case 'ini':
        case 'conf':
        case 'cfg':
            return 'ini';
        default:
            return 'txt';
    }
}

// Mock data for development
function createMockFiles(path: string): ConfigFile[] {
    const mockFiles = [
        {
            path: '/config/app.json',
            name: 'app.json',
            content: '{\n  "name": "vibe-kanban",\n  "version": "1.0.0",\n  "debug": true\n}',
            size: 65,
        },
        {
            path: '/config/database.yaml',
            name: 'database.yaml',
            content: 'host: localhost\nport: 5432\ndatabase: vibe_kanban\nssl: false',
            size: 58,
        },
        {
            path: '/config/redis.toml',
            name: 'redis.toml',
            content: '[redis]\nhost = "localhost"\nport = 6379\ndb = 0',
            size: 48,
        },
        {
            path: '/.vscode/settings.json',
            name: 'settings.json',
            content: '{\n  "editor.tabSize": 2,\n  "editor.insertSpaces": true\n}',
            size: 56,
        },
        {
            path: '~/.config/git/config',
            name: 'config',
            content: '[user]\n  name = Developer\n  email = dev@example.com',
            size: 48,
        }
    ];

    return mockFiles
        .filter(file => file.path.startsWith(path) || path === '/config' || path.includes('.config') || path.includes('.vscode'))
        .map(file => ({
            ...file,
            modified: false,
            type: getFileType(file.path),
            lastModified: new Date(Date.now() - Math.random() * 86_400_000 * 7), // Random date within last week
        }));
}