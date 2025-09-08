'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { enqueueSnackbar } from 'notistack';
import { Save, ArrowLeft, ToggleLeft, ToggleRight, CheckCircle2, GitPullRequest } from 'lucide-react';
import Link from 'next/link';

type AutomationSettings = {
    automaticallyCreatePR: boolean;
    doCodeReviewBeforeFinishing: boolean;
};

export const AutomationsPage = () => {
    const [settings, setSettings] = useState<AutomationSettings>({
        automaticallyCreatePR: false,
        doCodeReviewBeforeFinishing: false
    });
    const [jsonValue, setJsonValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        try {
            const response = await fetch('/api/preferences/automations');
            const data = await response.text();

            try {
                const parsed = JSON.parse(data);
                setSettings(parsed);
                setJsonValue(JSON.stringify(parsed, null, 2));
                setJsonError(null);
            } catch (parseError) {
                console.error('Error parsing automation settings:', parseError);
                setJsonValue(data);
                setJsonError('Invalid JSON format');
            }
        } catch (error) {
            console.error('Error loading automation settings:', error);
            enqueueSnackbar('Error loading automation settings', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            // Validate JSON before saving
            const parsedSettings = JSON.parse(jsonValue);
            
            await fetch('/api/preferences/automations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: jsonValue
            });

            setSettings(parsedSettings);
            setJsonError(null);
            enqueueSnackbar('Automation settings saved successfully', { variant: 'success' });
        } catch (error) {
            console.error('Error saving automation settings:', error);
            if (error instanceof SyntaxError) {
                setJsonError('Invalid JSON format');
                enqueueSnackbar('Invalid JSON format', { variant: 'error' });
            } else {
                enqueueSnackbar('Error saving automation settings', { variant: 'error' });
            }
        } finally {
            setSaving(false);
        }
    }, [jsonValue]);

    const handleJsonChange = useCallback((value: string | undefined = '') => {
        setJsonValue(value);
        
        try {
            JSON.parse(value);
            setJsonError(null);
        } catch {
            setJsonError('Invalid JSON format');
        }
    }, []);

    const handleToggle = useCallback((key: keyof AutomationSettings) => {
        const newSettings = {
            ...settings,
            [key]: !settings[key]
        };
        setSettings(newSettings);
        setJsonValue(JSON.stringify(newSettings, null, 2));
        setJsonError(null);
    }, [settings]);

    const handleAutoPRToggle = useCallback(() => {
        handleToggle('automaticallyCreatePR');
    }, [handleToggle]);

    const handleCodeReviewToggle = useCallback(() => {
        handleToggle('doCodeReviewBeforeFinishing');
    }, [handleToggle]);

    const handleSaveClick = useCallback(() => {
        handleSave().catch(console.error);
    }, [handleSave]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-lg">Loading automation settings...</div>
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
                            <div className="flex items-center">
                                <Link
                                    href="/"
                                    className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Automation Configuration
                                </h1>
                            </div>
                            <button
                                type="button"
                                onClick={handleSaveClick}
                                disabled={saving || !!jsonError}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 p-6">
                        {/* Visual Controls */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Automation Settings
                            </h2>
                            
                            {/* Automatically Create PR */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <GitPullRequest className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                Automatically Create PR
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Create a pull request automatically when a task is finished
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAutoPRToggle}
                                        className={`p-1 rounded-full transition-colors ${
                                            settings.automaticallyCreatePR 
                                                ? 'text-green-600 hover:text-green-700' 
                                                : 'text-gray-400 hover:text-gray-500'
                                        }`}
                                    >
                                        {settings.automaticallyCreatePR ? (
                                            <ToggleRight className="w-8 h-8" />
                                        ) : (
                                            <ToggleLeft className="w-8 h-8" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Code Review Before Finishing */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                Code Review Before Finishing
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                AI performs an additional code review round before task completion
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCodeReviewToggle}
                                        className={`p-1 rounded-full transition-colors ${
                                            settings.doCodeReviewBeforeFinishing 
                                                ? 'text-green-600 hover:text-green-700' 
                                                : 'text-gray-400 hover:text-gray-500'
                                        }`}
                                    >
                                        {settings.doCodeReviewBeforeFinishing ? (
                                            <ToggleRight className="w-8 h-8" />
                                        ) : (
                                            <ToggleLeft className="w-8 h-8" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    Current Status
                                </h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex items-center">
                                        {!!settings.automaticallyCreatePR && (
                                            <span className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                                        )}
                                        {!settings.automaticallyCreatePR && (
                                            <span className="w-2 h-2 rounded-full mr-2 bg-gray-400" />
                                        )}
                                        <span className="text-blue-800 dark:text-blue-200">
                                            Auto PR Creation: {settings.automaticallyCreatePR ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        {!!settings.doCodeReviewBeforeFinishing && (
                                            <span className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                                        )}
                                        {!settings.doCodeReviewBeforeFinishing && (
                                            <span className="w-2 h-2 rounded-full mr-2 bg-gray-400" />
                                        )}
                                        <span className="text-blue-800 dark:text-blue-200">
                                            Code Review: {settings.doCodeReviewBeforeFinishing ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* JSON Editor */}
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
                            <div className="h-[400px] border rounded-lg overflow-hidden">
                                <Editor
                                    value={jsonValue}
                                    language="json"
                                    theme="vs-dark"
                                    onChange={handleJsonChange}
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
                    </div>
                </div>
            </div>
        </div>
    );
};