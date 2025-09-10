'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { enqueueSnackbar } from 'notistack';
import { Save, ArrowLeft, ToggleLeft, ToggleRight, CheckCircle2, GitPullRequest, Settings, GitBranch, GitMerge, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { BranchInfo, ProjectBranchesResponse } from '@vibe-remote/vibe-kanban-api/types/api';

type AutomationSettings = {
    automaticallyCreatePR: boolean;
    doCodeReviewBeforeFinishing: boolean;
    automaticTaskPicking: boolean;
    baseBranch: string;
    automaticallyMergePR: boolean;
    mergeDecisionMode: 'always' | 'claude-decision';
    claudeMergePrompt: string;
};


export const AutomationsPage = () => {
    const [settings, setSettings] = useState<AutomationSettings>({
        automaticallyCreatePR: false,
        doCodeReviewBeforeFinishing: false,
        automaticTaskPicking: false,
        baseBranch: 'main',
        automaticallyMergePR: false,
        mergeDecisionMode: 'always',
        claudeMergePrompt: 'Review this pull request and decide if it should be automatically merged.\n\nConsider:\n- Code quality and test coverage\n- Potential breaking changes\n- Security implications\n- Performance impact\n\nRespond with either "MERGE" or "DO NOT MERGE" followed by your reasoning.'
    });
    const [jsonValue, setJsonValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [branchData, setBranchData] = useState<ProjectBranchesResponse | null>(null);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [showPromptEditor, setShowPromptEditor] = useState(false);

    const loadSettings = useCallback(async () => {
        try {
            const response = await fetch('/api/preferences/automations');
            const data = await response.text();

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
                    claudeMergePrompt: 'Review this pull request and decide if it should be automatically merged.\n\nConsider:\n- Code quality and test coverage\n- Potential breaking changes\n- Security implications\n- Performance impact\n\nRespond with either "MERGE" or "DO NOT MERGE" followed by your reasoning.',
                    ...parsed
                };
                setSettings(mergedSettings);
                setJsonValue(JSON.stringify(mergedSettings, null, 2));
                setJsonError(null);
                // Set prompt editor visibility based on loaded settings
                setShowPromptEditor(mergedSettings.mergeDecisionMode === 'claude-decision');
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
        setShowPromptEditor(mode === 'claude-decision');
    }, [settings]);

    const handleClaudePromptChange = useCallback((value: string | undefined = '') => {
        const newSettings = {
            ...settings,
            claudeMergePrompt: value
        };
        setSettings(newSettings);
        setJsonValue(JSON.stringify(newSettings, null, 2));
        setJsonError(null);
    }, [settings]);

    const handlePromptEditorToggle = useCallback(() => {
        setShowPromptEditor(!showPromptEditor);
    }, [showPromptEditor]);

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

                            {/* Automatically Merge PR */}
                            {!!settings.automaticallyCreatePR && (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ml-8 border-l-4 border-blue-500">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <GitMerge className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    Automatically Merge PR
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Automatically merge the PR after creation
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAutoMergeToggle}
                                            className={`p-1 rounded-full transition-colors ${
                                                settings.automaticallyMergePR 
                                                    ? 'text-green-600 hover:text-green-700' 
                                                    : 'text-gray-400 hover:text-gray-500'
                                            }`}
                                        >
                                            {settings.automaticallyMergePR ? (
                                                <ToggleRight className="w-8 h-8" />
                                            ) : (
                                                <ToggleLeft className="w-8 h-8" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Merge Decision Mode */}
                                    {!!settings.automaticallyMergePR && (
                                        <div className="mt-4 pl-8">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Merge Decision Mode
                                            </label>
                                            <select
                                                value={settings.mergeDecisionMode}
                                                onChange={handleMergeDecisionModeChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="always">Always Merge</option>
                                                <option value="claude-decision">Claude Decision</option>
                                            </select>

                                            {/* Claude Prompt Editor Toggle */}
                                            {settings.mergeDecisionMode === 'claude-decision' && (
                                                <div className="mt-3">
                                                    <button
                                                        type="button"
                                                        onClick={handlePromptEditorToggle}
                                                        className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                                    >
                                                        <Sparkles className="w-4 h-4" />
                                                        {showPromptEditor ? 'Hide' : 'Edit'} Claude Prompt
                                                    </button>

                                                    {/* Claude Prompt Editor */}
                                                    {!!showPromptEditor && (
                                                        <div className="mt-3">
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                                                Claude will use this prompt to decide whether to merge
                                                            </label>
                                                            <div className="h-[200px] border rounded-lg overflow-hidden">
                                                                <Editor
                                                                    value={settings.claudeMergePrompt}
                                                                    language="markdown"
                                                                    theme="vs-dark"
                                                                    onChange={handleClaudePromptChange}
                                                                    options={{
                                                                        fontSize: 12,
                                                                        wordWrap: 'on',
                                                                        minimap: { enabled: false },
                                                                        scrollBeyondLastLine: false,
                                                                        automaticLayout: true,
                                                                        lineNumbers: 'off',
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

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

                            {/* Automatic Task Picking */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                Automatic Task Picking
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Automatically pick and start the next appropriate task when ready
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleTaskPickingToggle}
                                        className={`p-1 rounded-full transition-colors ${
                                            settings.automaticTaskPicking 
                                                ? 'text-green-600 hover:text-green-700' 
                                                : 'text-gray-400 hover:text-gray-500'
                                        }`}
                                    >
                                        {settings.automaticTaskPicking ? (
                                            <ToggleRight className="w-8 h-8" />
                                        ) : (
                                            <ToggleLeft className="w-8 h-8" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Base Branch Selection */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-start">
                                    <GitBranch className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3 mt-1" />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                            Base Branch for Tasks
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                            Select the branch to use as base when starting new tasks
                                        </p>
                                        
                                        {branchesLoading ? (
                                            <div className="text-sm text-gray-500">Loading branches...</div>
                                        ) : branchData ? (
                                            <div className="space-y-2">
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                    Project: {branchData.projectName}
                                                </div>
                                                <select
                                                    value={settings.baseBranch}
                                                    onChange={handleBranchSelectChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {branchData.branches.map((branch: BranchInfo) => (
                                                        <option key={branch.name} value={branch.name}>
                                                            {branch.name} {branch.is_current ? ' (current)' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-red-600 dark:text-red-400">
                                                Failed to load branches. Check if Vibe Kanban is running.
                                            </div>
                                        )}
                                    </div>
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
                                    {!!settings.automaticallyCreatePR && !!settings.automaticallyMergePR && (
                                        <div className="flex items-center pl-4">
                                            <span className="w-2 h-2 rounded-full mr-2 bg-purple-500" />
                                            <span className="text-blue-800 dark:text-blue-200">
                                                Auto Merge: {settings.mergeDecisionMode === 'always' ? 'Always' : 'Claude Decision'}
                                            </span>
                                        </div>
                                    )}
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
                                    <div className="flex items-center">
                                        {!!settings.automaticTaskPicking && (
                                            <span className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                                        )}
                                        {!settings.automaticTaskPicking && (
                                            <span className="w-2 h-2 rounded-full mr-2 bg-gray-400" />
                                        )}
                                        <span className="text-blue-800 dark:text-blue-200">
                                            Task Picking: {settings.automaticTaskPicking ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 rounded-full mr-2 bg-blue-500" />
                                        <span className="text-blue-800 dark:text-blue-200">
                                            Base Branch: {settings.baseBranch}
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