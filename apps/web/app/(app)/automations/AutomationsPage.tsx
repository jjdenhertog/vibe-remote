'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Save, ArrowLeft, Code } from 'lucide-react';
import Link from 'next/link';
import type { ProjectBranchesResponse } from '@vibe-remote/vibe-kanban-api/types/api';
import { AutomationSettings } from './components/AutomationSettings';
import { JsonEditor } from './components/JsonEditor';

type AutomationSettings = {
    automaticallyCreatePR: boolean;
    doCodeReviewBeforeFinishing: boolean;
    automaticTaskPicking: boolean;
    baseBranch: string;
    automaticallyMergePR: boolean;
    mergeDecisionMode: 'always' | 'claude-decision';
};


export const AutomationsPage = () => {
    const [settings, setSettings] = useState<AutomationSettings>({
        automaticallyCreatePR: false,
        doCodeReviewBeforeFinishing: false,
        automaticTaskPicking: false,
        baseBranch: 'main',
        automaticallyMergePR: false,
        mergeDecisionMode: 'always'
    });
    const [reviewPrompt, setReviewPrompt] = useState('');
    const [automergePrompt, setAutomergePrompt] = useState('');
    const [jsonValue, setJsonValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [branchData, setBranchData] = useState<ProjectBranchesResponse>();
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [showJsonEditor, setShowJsonEditor] = useState(false);

    const loadSettings = useCallback(async () => {
        try {
            const [automationResponse, reviewResponse, automergeResponse] = await Promise.all([
                fetch('/api/preferences/automations'),
                fetch('/api/preferences/review-prompt'),
                fetch('/api/preferences/automerge-prompt')
            ]);
            
            const data = await automationResponse.text();
            const reviewData = await reviewResponse.text();
            const automergeData = await automergeResponse.text();

            try {
                const parsed = JSON.parse(data);
                // Ensure new fields have defaults if not present
                const mergedSettings = {
                    automaticallyCreatePR: false,
                    doCodeReviewBeforeFinishing: false,
                    automaticTaskPicking: false,
                    baseBranch: 'main',
                    automaticallyMergePR: false,
                    mergeDecisionMode: 'always' as const,
                    ...parsed
                };
                setSettings(mergedSettings);
                setJsonValue(JSON.stringify(mergedSettings, null, 2));
                setReviewPrompt(reviewData);
                setAutomergePrompt(automergeData);
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

    const loadBranches = useCallback(async () => {
        setBranchesLoading(true);
        try {
            const response = await fetch('/api/project-branches');
            if (response.ok) {
                const data = await response.json();
                setBranchData(data);
            } else {
                console.error('Failed to fetch branches:', response.statusText);
                enqueueSnackbar('Failed to fetch project branches', { variant: 'warning' });
            }
        } catch (error) {
            console.error('Error loading branches:', error);
            enqueueSnackbar('Error loading project branches', { variant: 'error' });
        } finally {
            setBranchesLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
        loadBranches();
    }, [loadSettings, loadBranches]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            // Validate JSON before saving
            const parsedSettings = JSON.parse(jsonValue);
            
            await Promise.all([
                fetch('/api/preferences/automations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: jsonValue
                }),
                fetch('/api/preferences/review-prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: reviewPrompt
                }),
                fetch('/api/preferences/automerge-prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: automergePrompt
                })
            ]);

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
    }, [jsonValue, reviewPrompt, automergePrompt]);

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

    const handleTaskPickingToggle = useCallback(() => {
        handleToggle('automaticTaskPicking');
    }, [handleToggle]);

    const handleBranchChange = useCallback((branch: string) => {
        const newSettings = {
            ...settings,
            baseBranch: branch
        };
        setSettings(newSettings);
        setJsonValue(JSON.stringify(newSettings, null, 2));
        setJsonError(null);
    }, [settings]);

    const handleBranchSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        handleBranchChange(e.target.value);
    }, [handleBranchChange]);

    const handleAutoMergeToggle = useCallback(() => {
        handleToggle('automaticallyMergePR');
    }, [handleToggle]);

    const handleMergeDecisionModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = e.target.value as 'always' | 'claude-decision';
        const newSettings = {
            ...settings,
            mergeDecisionMode: mode
        };
        setSettings(newSettings);
        setJsonValue(JSON.stringify(newSettings, null, 2));
        setJsonError(null);
        // Keep the current JSON editor state when changing modes
    }, [settings]);


    const handleJsonEditorToggle = useCallback(() => {
        setShowJsonEditor(!showJsonEditor);
    }, [showJsonEditor]);

    const handleReviewPromptChange = useCallback((value: string | undefined) => {
        setReviewPrompt(value || '');
    }, []);

    const handleAutomergePromptChange = useCallback((value: string | undefined) => {
        setAutomergePrompt(value || '');
    }, []);


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
            <div className="container mx-auto py-6 max-w-4xl">
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
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleJsonEditorToggle}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Code className="w-4 h-4" />
                                    {showJsonEditor ? 'Hide JSON' : 'Edit as JSON'}
                                </button>
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
                    </div>

                    <div className="p-6">
                        {showJsonEditor ? (
                            /* JSON Editor */
                            <JsonEditor
                                jsonValue={jsonValue}
                                jsonError={jsonError}
                                onChange={handleJsonChange}
                            />
                        ) : (
                            /* Visual Controls */
                            <AutomationSettings
                                settings={settings}
                                branchData={branchData}
                                branchesLoading={branchesLoading}
                                reviewPrompt={reviewPrompt}
                                automergePrompt={automergePrompt}
                                onAutoPRToggle={handleAutoPRToggle}
                                onCodeReviewToggle={handleCodeReviewToggle}
                                onTaskPickingToggle={handleTaskPickingToggle}
                                onBranchSelectChange={handleBranchSelectChange}
                                onAutoMergeToggle={handleAutoMergeToggle}
                                onMergeDecisionModeChange={handleMergeDecisionModeChange}
                                onReviewPromptChange={handleReviewPromptChange}
                                onAutomergePromptChange={handleAutomergePromptChange}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};