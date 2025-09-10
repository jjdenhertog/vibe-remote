'use client';

import React from 'react';
import { Editor } from '@monaco-editor/react';
import { Save } from 'lucide-react';

type ClaudePromptEditorProps = {
    readonly prompt: string;
    readonly onPromptChange: (value: string) => void;
    readonly onSave: () => void;
    readonly onBack: () => void;
    readonly saving: boolean;
};

export const ClaudePromptEditor: React.FC<ClaudePromptEditorProps> = ({
    prompt,
    onPromptChange,
    onSave,
    onBack,
    saving
}) => {
    const handleChange = React.useCallback((value: string | undefined) => {
        onPromptChange(value || '');
    }, [onPromptChange]);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Merge Decision Prompt
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This prompt will be used by Claude to decide whether to automatically merge pull requests.
                    The prompt should include clear criteria for when to merge or not merge.
                </p>
            </div>

            <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <Editor
                    height="300px"
                    language="markdown"
                    theme="vs-dark"
                    value={prompt}
                    onChange={handleChange}
                    options={{
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        automaticLayout: true
                    }}
                />
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Prompt'}
                </button>
            </div>
        </div>
    );
};