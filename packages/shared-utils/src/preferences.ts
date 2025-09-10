import { existsSync, readFileSync } from 'node:fs';
import type { AutomationSettings } from './automation-types.js';
import { DEFAULT_AUTOMATION_SETTINGS } from './automation-types.js';

export type AutomationPreferences = AutomationSettings;

export function readAutomationPreferences(): AutomationPreferences {
    const defaultPreferences: AutomationPreferences = DEFAULT_AUTOMATION_SETTINGS;

    const preferencesPath = '/workspace/data/preferences/automations.json';

    if (!existsSync(preferencesPath)) {
        return defaultPreferences;
    }

    try {
        const fileContent = readFileSync(preferencesPath, 'utf8');
        const preferences = JSON.parse(fileContent) as Partial<AutomationPreferences>;

        // Merge with defaults to ensure all properties are present
        const result: AutomationPreferences = {
            ...defaultPreferences,
            ...preferences
        };

        return result;
    } catch (error) {
        console.warn(`Warning: Could not read or parse automations.json: ${String(error)}`);

        return defaultPreferences;
    }
}