import { createJsonPreferenceRoute } from '@vibe-remote/shared-utils/route-factory';

const DEFAULT_AUTOMATIONS = {
    automaticallyCreatePR: false,
    doCodeReviewBeforeFinishing: false,
    automaticTaskPicking: false,
    baseBranch: 'main',
    autoMergePR: false,
    autoMergeDecisionMode: 'claude-decision',
    autoMergePrompt: ''
};

function preprocessAutomationSettings(data: unknown, defaultContent: typeof DEFAULT_AUTOMATIONS): unknown {
    const parsed = data as Record<string, unknown>;
    
    // Set defaults for missing auto-merge fields
    return {
        ...parsed,
        autoMergePR: parsed.autoMergePR ?? defaultContent.autoMergePR,
        autoMergeDecisionMode: parsed.autoMergeDecisionMode ?? defaultContent.autoMergeDecisionMode,
        autoMergePrompt: parsed.autoMergePrompt ?? defaultContent.autoMergePrompt
    };
}

function validateAutomationSettings(data: unknown): { isValid: boolean; error?: string } {
    if (typeof data !== 'object' || data === null) {
        return { isValid: false, error: 'Data must be an object' };
    }

    const parsed = data as Record<string, unknown>;

    // Validate required fields
    if (typeof parsed.automaticallyCreatePR !== 'boolean') {
        return { isValid: false, error: 'automaticallyCreatePR must be a boolean' };
    }

    if (typeof parsed.doCodeReviewBeforeFinishing !== 'boolean') {
        return { isValid: false, error: 'doCodeReviewBeforeFinishing must be a boolean' };
    }

    if (typeof parsed.automaticTaskPicking !== 'boolean') {
        return { isValid: false, error: 'automaticTaskPicking must be a boolean' };
    }

    if (typeof parsed.baseBranch !== 'string') {
        return { isValid: false, error: 'baseBranch must be a string' };
    }

    // Validate optional auto-merge fields if present
    if (parsed.autoMergePR !== undefined && typeof parsed.autoMergePR !== 'boolean') {
        return { isValid: false, error: 'autoMergePR must be a boolean' };
    }

    if (parsed.autoMergeDecisionMode !== undefined && 
        (typeof parsed.autoMergeDecisionMode !== 'string' || 
        !['always', 'claude-decision'].includes(parsed.autoMergeDecisionMode))) {
        return { isValid: false, error: 'autoMergeDecisionMode must be either "always" or "claude-decision"' };
    }

    if (parsed.autoMergePrompt !== undefined && typeof parsed.autoMergePrompt !== 'string') {
        return { isValid: false, error: 'autoMergePrompt must be a string' };
    }

    return { isValid: true };
}

const { GET, POST } = createJsonPreferenceRoute({
    fileName: 'automations.json',
    defaultContent: DEFAULT_AUTOMATIONS,
    displayName: 'automation settings',
    preprocessor: preprocessAutomationSettings,
    validator: validateAutomationSettings
});

export { GET, POST };