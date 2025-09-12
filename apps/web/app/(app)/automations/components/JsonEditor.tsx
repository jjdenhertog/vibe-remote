'use client';

import React from 'react';
import { Editor } from '@monaco-editor/react';

type JsonEditorProps = {
    readonly jsonValue: string;
    readonly jsonError: string | null;
    readonly onChange: (value: string | undefined) => void;
};

export const JsonEditor: React.FC<JsonEditorProps> = ({ 
    jsonValue, 
    jsonError, 
    onChange 
}) => {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                JSON Configuration
            </h2>
            {!!jsonError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-700 dark:text-red-400">
                        {jsonError}
                    </p>
                </div>
            )}
            <div className="h-[400px] min-h-[200px] max-h-[800px] resize-y overflow-auto border rounded-lg">
                <Editor
                    value={jsonValue}
                    language="json"
                    theme="vs-dark"
                    onChange={onChange}
                    options={{
                        fontSize: 14,
                        wordWrap: 'on',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        formatOnPaste: true,
                        formatOnType: true,
                    }}
                />
            </div>
        </div>
    );
};