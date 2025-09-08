'use client';

import React, { useState, useCallback } from 'react';
import { PreferenceEditor } from './PreferenceEditor';

const DEMO_PREFERENCES = `{
  "editor": {
    "theme": "dark",
    "fontSize": 14,
    "fontFamily": "JetBrains Mono",
    "lineNumbers": true,
    "minimap": false,
    "wordWrap": "on"
  },
  "ui": {
    "sidebarWidth": 280,
    "showStatusBar": true,
    "compactMode": false
  },
  "shortcuts": {
    "save": "ctrl+s",
    "format": "ctrl+shift+f",
    "find": "ctrl+f"
  }
}`;

export const MonacoDemo: React.FC = () => {
    const [value, setValue] = useState(DEMO_PREFERENCES);
    
    const handleChange = useCallback((newValue?: string) => {
        setValue(newValue || '');
    }, []);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2">Monaco Editor Demo</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Edit the JSON preferences below. The editor provides validation, 
                    auto-formatting, and schema-based IntelliSense.
                </p>
            </div>
      
            <div className="border rounded-lg overflow-hidden">
                <PreferenceEditor
                    value={value}
                    preferenceName="demo"
                    height="300px"
                    validateOnChange
                    autoFormat
                    showMinimap={false}
                    onChange={handleChange}
        />
            </div>
      
            <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Try:</strong> Add invalid JSON to see error highlighting</p>
                <p><strong>Keyboard:</strong> Ctrl+F to format, Ctrl+S to validate and format</p>
                <p><strong>Context menu:</strong> Right-click for validation options</p>
            </div>
        </div>
    );
};