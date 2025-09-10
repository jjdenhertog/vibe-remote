'use client';

import React from 'react';
import type { AutomationSettings as AutomationSettingsType } from '@vibe-remote/shared-utils/automation-types';

type AutomationStatusSummaryProps = {
    readonly settings: AutomationSettingsType;
};

export const AutomationStatusSummary: React.FC<AutomationStatusSummaryProps> = ({ settings }) => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Current Automation Status
            </h3>
            <div className="space-y-2">
                <div className="flex items-center">
                    {!!settings.automaticallyCreatePR && (
                        <span className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                    )}
                    {!settings.automaticallyCreatePR && (
                        <span className="w-2 h-2 rounded-full mr-2 bg-gray-400" />
                    )}
                    <span className="text-blue-800 dark:text-blue-200">
                        Auto PR: {settings.automaticallyCreatePR ? 'Enabled' : 'Disabled'}
                    </span>
                </div>
                {!!(settings.automaticallyCreatePR && settings.automaticallyMergePR) && (
                    <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full mr-2 bg-green-500" />
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
    );
};