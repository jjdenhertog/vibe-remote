'use client';

import React, { useState, useCallback } from 'react';
import { MonacoEditor, PreferenceEditor } from '@/components/editors';

const EXAMPLE_JSON = `{
  "theme": "dark",
  "fontSize": 14,
  "fontFamily": "JetBrains Mono",
  "lineNumbers": true,
  "minimap": false,
  "wordWrap": "on",
  "autoFormat": true,
  "keybindings": {
    "save": "ctrl+s",
    "format": "ctrl+shift+f"
  },
  "extensions": [
    "typescript",
    "json",
    "markdown"
  ]
}`;

const EXAMPLE_JAVASCRIPT = `// Monaco Editor JavaScript Example
function calculatePreferences(userSettings) {
  const defaults = {
    theme: 'vs-dark',
    fontSize: 14,
    lineNumbers: true,
    minimap: { enabled: true }
  };
  
  return {
    ...defaults,
    ...userSettings,
    computed: {
      isDarkTheme: userSettings.theme?.includes('dark') ?? true,
      isAccessible: userSettings.fontSize >= 12,
      hasValidConfig: validateConfig(userSettings)
    }
  };
}

function validateConfig(config) {
  return (
    config &&
    typeof config.fontSize === 'number' &&
    config.fontSize >= 8 &&
    config.fontSize <= 72
  );
}

export { calculatePreferences, validateConfig };`;

export default function MonacoExamplePage() {
    const [jsonValue, setJsonValue] = useState(EXAMPLE_JSON);
    const [jsValue, setJsValue] = useState(EXAMPLE_JAVASCRIPT);
    const [preferenceValue, setPreferenceValue] = useState(`{
  "editor": {
    "theme": "dark",
    "fontSize": 16,
    "fontFamily": "Fira Code",
    "lineNumbers": true
  },
  "ui": {
    "sidebarWidth": 300,
    "showStatusBar": true,
    "compactMode": false
  }
}`);

    const handleJsChange = useCallback((value?: string) => {
        setJsValue(value || '');
    }, []);

    const handleJsonChange = useCallback((value?: string) => {
        setJsonValue(value || '');
    }, []);

    const handlePreferenceChange = useCallback((value?: string) => {
        setPreferenceValue(value || '');
    }, []);

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Monaco Editor Examples</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Demonstrating Monaco editor integration with React and TypeScript
                </p>
            </div>

            {/* Basic Monaco Editor */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Basic Monaco Editor</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    A basic Monaco editor with JavaScript syntax highlighting and IntelliSense.
                </p>
                <div className="border rounded-lg overflow-hidden">
                    <MonacoEditor
                        value={jsValue}
                        language="javascript"
                        height="300px"
                        theme="vs-dark"
                        onChange={handleJsChange}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: true },
                            wordWrap: 'on',
                        }}
          />
                </div>
            </section>

            {/* JSON Editor */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">JSON Editor with Validation</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    JSON editor with syntax validation, formatting, and error highlighting.
                </p>
                <div className="border rounded-lg overflow-hidden">
                    <MonacoEditor
                        value={jsonValue}
                        language="json"
                        height="250px"
                        theme="vs-dark"
                        onChange={handleJsonChange}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            wordWrap: 'on',
                            formatOnPaste: true,
                            formatOnType: true,
                        }}
          />
                </div>
            </section>

            {/* Preference Editor */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Preference Editor</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Specialized editor for preference files with schema validation and auto-formatting.
                </p>
                <div className="border rounded-lg overflow-hidden">
                    <PreferenceEditor
                        value={preferenceValue}
                        preferenceName="app-settings"
                        height="350px"
                        validateOnChange
                        autoFormat
                        showMinimap={false}
                        onChange={handlePreferenceChange}
          />
                </div>
            </section>

            {/* Features Showcase */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Monaco Editor Features</h3>
                        <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                            <li>✓ Syntax highlighting for multiple languages</li>
                            <li>✓ IntelliSense and auto-completion</li>
                            <li>✓ Code folding and bracket matching</li>
                            <li>✓ Multi-cursor editing</li>
                            <li>✓ Find and replace</li>
                            <li>✓ Customizable themes</li>
                        </ul>
                    </div>
          
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Preference Editor Features</h3>
                        <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                            <li>✓ JSON schema validation</li>
                            <li>✓ Auto-formatting on save</li>
                            <li>✓ Real-time error highlighting</li>
                            <li>✓ Preference-specific schemas</li>
                            <li>✓ Status bar with validation info</li>
                            <li>✓ Read-only mode support</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Keyboard Shortcuts</h2>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium mb-2">General</h4>
                            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd> Format document</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+F</kbd> Find</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+H</kbd> Replace</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+/</kbd> Toggle comment</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Preference Editor</h4>
                            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+F</kbd> Format JSON</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd> Validate & format</li>
                                <li>Right-click for context menu with validation</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}