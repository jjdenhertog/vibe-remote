'use client';

import React from 'react';
import { ToggleLeft, ToggleRight, CheckCircle2, GitPullRequest, Settings, GitBranch, GitMerge, Sparkles } from 'lucide-react';
import type { BranchInfo, ProjectBranchesResponse } from '@vibe-remote/vibe-kanban-api/types/api';
import type { AutomationSettings as AutomationSettingsType } from '@vibe-remote/shared-utils/automation-types';
import { ClaudePromptEditor } from './ClaudePromptEditor';
import { AutomationStatusSummary } from './AutomationStatusSummary';

type AutomationSettingsProps = {
    readonly settings: AutomationSettingsType;
    readonly branchData: ProjectBranchesResponse | null;
    readonly branchesLoading: boolean;
    readonly showPromptEditor: boolean;
    readonly saving: boolean;
    readonly onAutoPRToggle: () => void;
    readonly onCodeReviewToggle: () => void;
    readonly onTaskPickingToggle: () => void;
    readonly onBranchSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    readonly onAutoMergeToggle: () => void;
    readonly onMergeDecisionModeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    readonly onPromptEditorToggle: () => void;
    readonly onClaudePromptChange: (value: string) => void;
    readonly onSaveClick: () => void;
};

export const AutomationSettings: React.FC<AutomationSettingsProps> = ({
    settings,
    branchData,
    branchesLoading,
    showPromptEditor,
    saving,
    onAutoPRToggle,
    onCodeReviewToggle,
    onTaskPickingToggle,
    onBranchSelectChange,
    onAutoMergeToggle,
    onMergeDecisionModeChange,
    onPromptEditorToggle,
    onClaudePromptChange,
    onSaveClick
}) => {
    return (
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
                        onClick={onAutoPRToggle}
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
                            onClick={onAutoMergeToggle}
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
                                onChange={onMergeDecisionModeChange}
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
                                        onClick={onPromptEditorToggle}
                                        className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        {showPromptEditor ? 'Hide' : 'Edit'} Claude Prompt
                                    </button>

                                    {/* Inline Prompt Editor */}
                                    {showPromptEditor ? <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                                        <ClaudePromptEditor
                                            prompt={settings.claudeMergePrompt}
                                            onPromptChange={onClaudePromptChange}
                                            onSave={onSaveClick}
                                            onBack={onPromptEditorToggle}
                                            saving={saving}
                                        />
                                    </div> : null}
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
                        onClick={onCodeReviewToggle}
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
                        onClick={onTaskPickingToggle}
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
                                    onChange={onBranchSelectChange}
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
            <div className="mt-6">
                <AutomationStatusSummary settings={settings} />
            </div>
        </div>
    );
};