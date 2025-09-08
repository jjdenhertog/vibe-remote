import { readFileSync, existsSync } from 'node:fs';

type AutomationPreferences = {
    automaticallyCreatePR: boolean;
    doCodeReviewBeforeFinishing: boolean;
};

export function readAutomationPreferences(): AutomationPreferences {
    const defaultPreferences: AutomationPreferences = {
        automaticallyCreatePR: false,
        doCodeReviewBeforeFinishing: false
    };

    const preferencesPath = '/workspace/data/preferences/automations.json';
    
    if (!existsSync(preferencesPath)) {
        return defaultPreferences;
    }

    try {
        const fileContent = readFileSync(preferencesPath, 'utf8');
        const preferences = JSON.parse(fileContent) as Partial<AutomationPreferences>;
        
        return {
            automaticallyCreatePR: preferences.automaticallyCreatePR ?? defaultPreferences.automaticallyCreatePR,
            doCodeReviewBeforeFinishing: preferences.doCodeReviewBeforeFinishing ?? defaultPreferences.doCodeReviewBeforeFinishing
        };
    } catch (error) {
        console.warn(`Warning: Could not read or parse automations.json: ${String(error)}`);

        return defaultPreferences;
    }
}