import { existsSync, readFileSync } from 'node:fs';

export type AutomationPreferences = {
    automaticallyCreatePR: boolean;
    doCodeReviewBeforeFinishing: boolean;
    automaticTaskPicking: boolean;
    baseBranch: string;
    automaticallyMergePR?: boolean;
    mergeDecisionMode?: 'always' | 'claude-decision';
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
            automaticallyCreatePR: !!preferences.automaticallyCreatePR,
            doCodeReviewBeforeFinishing: !!preferences.doCodeReviewBeforeFinishing,
            automaticTaskPicking: !!preferences.automaticTaskPicking,
            baseBranch: preferences.baseBranch ?? defaultPreferences.baseBranch,
            automaticallyMergePR: !!preferences.automaticallyMergePR,
            mergeDecisionMode: preferences.mergeDecisionMode || 'always'
        };


        return result;
    } catch (error) {
        console.warn(`Warning: Could not read or parse automations.json: ${String(error)}`);

        return defaultPreferences;
    }
}
