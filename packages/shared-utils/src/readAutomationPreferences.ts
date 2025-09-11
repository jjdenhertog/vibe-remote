import { existsSync, readFileSync } from 'node:fs';

export type AutomationPreferences = {
    automaticallyCreatePR: boolean;
    doCodeReviewBeforeFinishing: boolean;
    automaticTaskPicking: boolean;
    baseBranch: string;
    autoMergePR?: boolean;
    autoMergeDecisionMode?: 'always' | 'claude-decision';
    autoMergePrompt?: string;
};

export function readAutomationPreferences(): AutomationPreferences {

    const defaultPreferences: AutomationPreferences = {
        automaticallyCreatePR: false,
        doCodeReviewBeforeFinishing: false,
        automaticTaskPicking: false,
        baseBranch: 'dev'
    };

    const preferencesPath = '/workspace/data/preferences/automations.json';

    if (!existsSync(preferencesPath))
        return defaultPreferences;

    try {
        const fileContent = readFileSync(preferencesPath, 'utf8');
        const preferences = JSON.parse(fileContent) as Partial<AutomationPreferences>;

        const result: AutomationPreferences = {
            automaticallyCreatePR: preferences.automaticallyCreatePR ?? defaultPreferences.automaticallyCreatePR,
            doCodeReviewBeforeFinishing: preferences.doCodeReviewBeforeFinishing ?? defaultPreferences.doCodeReviewBeforeFinishing,
            automaticTaskPicking: preferences.automaticTaskPicking ?? defaultPreferences.automaticTaskPicking,
            baseBranch: preferences.baseBranch ?? defaultPreferences.baseBranch
        };

        if (preferences.autoMergePR !== undefined)
            result.autoMergePR = preferences.autoMergePR;

        if (preferences.autoMergeDecisionMode !== undefined)
            result.autoMergeDecisionMode = preferences.autoMergeDecisionMode;

        if (preferences.autoMergePrompt !== undefined)
            result.autoMergePrompt = preferences.autoMergePrompt;

        return result;
    } catch (error) {
        console.warn(`Warning: Could not read or parse automations.json: ${String(error)}`);

        return defaultPreferences;
    }
}
