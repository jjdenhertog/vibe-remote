import { readFileSync, existsSync } from 'node:fs';

type PreferenceContext = {
    codingStandards?: string;
    projectContext?: string;
}

type AutomationPreferences = {
    automaticallyCreatePR: boolean;
    doCodeReviewBeforeFinishing: boolean;
}

export function readPreferenceFiles(): PreferenceContext {
    const context: PreferenceContext = {};
    
    // Check for coding standards
    const codingStandardsPath = '/workspace/data/preferences/coding-standards.md';
    if (existsSync(codingStandardsPath)) {
        try {
            context.codingStandards = readFileSync(codingStandardsPath, 'utf8');
        } catch (error) {
            console.warn(`Warning: Could not read coding-standards.md: ${String(error)}`);
        }
    }
    
    // Check for project context
    const projectContextPath = '/workspace/data/preferences/project-context.md';
    if (existsSync(projectContextPath)) {
        try {
            context.projectContext = readFileSync(projectContextPath, 'utf8');
        } catch (error) {
            console.warn(`Warning: Could not read project-context.md: ${String(error)}`);
        }
    }
    
    return context;
}

export function prependContextToPrompt(prompt: string, context: PreferenceContext): string {
    let enhancedPrompt = prompt;
    
    if (context.codingStandards) {
        enhancedPrompt = `# Coding Standards\n\n${context.codingStandards}\n\n---\n\n${enhancedPrompt}`;
    }
    
    if (context.projectContext) {
        enhancedPrompt = `# Project Context\n\n${context.projectContext}\n\n---\n\n${enhancedPrompt}`;
    }
    
    return enhancedPrompt;
}

export function readAutomationPreferences(): AutomationPreferences {
    const defaultPreferences: AutomationPreferences = {
        automaticallyCreatePR: false,
        doCodeReviewBeforeFinishing: false
    };

    const preferencesPath = '/workspace/data/preferences/automations.json';
    
    if (!existsSync(preferencesPath)) 
        return defaultPreferences;

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

export function readPRPromptTemplate(): string | null {
    const prPromptPath = '/workspace/data/preferences/pr-prompt.md';
    
    if (!existsSync(prPromptPath)) {
        return null;
    }

    try {
        return readFileSync(prPromptPath, 'utf8');
    } catch (error) {
        console.warn(`Warning: Could not read pr-prompt.md: ${String(error)}`);

        return null;
    }
}

export function generateCodeReviewPrompt(originalPrompt: string, prPromptTemplate: string): string {
    const taskSection = `\n\nThe following task was executed:\n\n${originalPrompt}`;
    
    return `${taskSection}${prPromptTemplate}`;
}