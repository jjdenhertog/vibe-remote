'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { enqueueSnackbar } from 'notistack';
import { Save, FileText } from 'lucide-react';

export const ConfigPage = () => {
    const [projectContext, setProjectContext] = useState('');
    const [codingStandards, setCodingStandards] = useState('');
    const [activeTab, setActiveTab] = useState<'project-context' | 'coding-standards'>('project-context');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadFiles = useCallback(async () => {
        try {
            const [projectResponse, codingResponse] = await Promise.all([
                fetch('/api/preferences/project-context'),
                fetch('/api/preferences/coding-standards')
            ]);

            const projectData = await projectResponse.text();
            const codingData = await codingResponse.text();

            setProjectContext(projectData);
            setCodingStandards(codingData);
        } catch (error) {
            console.error('Error loading files:', error);
            enqueueSnackbar('Error loading preference files', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            await Promise.all([
                fetch('/api/preferences/project-context', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: projectContext
                }),
                fetch('/api/preferences/coding-standards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: codingStandards
                })
            ]);

            enqueueSnackbar('Preferences saved successfully', { variant: 'success' });
        } catch (error) {
            console.error('Error saving files:', error);
            enqueueSnackbar('Error saving preference files', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    }, [projectContext, codingStandards]);

    const handleProjectContextChange = useCallback((value: string | undefined) => {
        setProjectContext(value || '');
    }, []);

    const handleCodingStandardsChange = useCallback((value: string | undefined) => {
        setCodingStandards(value || '');
    }, []);

    const handleProjectTabClick = useCallback(() => {
        setActiveTab('project-context');
    }, []);

    const handleCodingTabClick = useCallback(() => {
        setActiveTab('coding-standards');
    }, []);

    const handleSaveClick = useCallback(() => {
        handleSave().catch(console.error);
    }, [handleSave]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading preferences...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto py-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Configuration Editor
                            </h1>
                            <button
                                type="button"
                                onClick={handleSaveClick}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save All'}
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex space-x-8 px-4">
                            <button
                                type="button"
                                onClick={handleProjectTabClick}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'project-context'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                <FileText className="w-4 h-4 inline-block mr-2" />
                                Project Context
                            </button>
                            <button
                                type="button"
                                onClick={handleCodingTabClick}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'coding-standards'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                <FileText className="w-4 h-4 inline-block mr-2" />
                                Coding Standards
                            </button>
                        </nav>
                    </div>

                    {/* Editor */}
                    <div className="h-[600px]">
                        {activeTab === 'project-context' ? (
                            <Editor
                                value={projectContext}
                                language="markdown"
                                theme="vs-dark"
                                onChange={handleProjectContextChange}
                                options={{
                                    fontSize: 14,
                                    wordWrap: 'on',
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        ) : (
                            <Editor
                                value={codingStandards}
                                language="markdown"
                                theme="vs-dark"
                                onChange={handleCodingStandardsChange}
                                options={{
                                    fontSize: 14,
                                    wordWrap: 'on',
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};