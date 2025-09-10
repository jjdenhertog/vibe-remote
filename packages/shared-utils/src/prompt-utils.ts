import { existsSync, readFileSync } from 'node:fs';
import { PreferenceContext } from './preference-context';

/**
 * Reads preference files from the workspace
 */
export function readPreferenceFiles(): PreferenceContext {
    const context: PreferenceContext = {};

    // Check for coding standards - single path only
    const codingStandardsPath = '/workspace/data/preferences/coding-standards.md';
    if (existsSync(codingStandardsPath)) {
        try {
            context.codingStandards = readFileSync(codingStandardsPath, 'utf8');
        } catch (error) {
            console.warn(`Warning: Could not read ${codingStandardsPath}: ${String(error)}`);
        }
    }

    // Check for project context - single path only
    const projectContextPath = '/workspace/data/preferences/project-context.md';
    if (existsSync(projectContextPath)) {
        try {
            context.projectContext = readFileSync(projectContextPath, 'utf8');
        } catch (error) {
            console.warn(`Warning: Could not read ${projectContextPath}: ${String(error)}`);
        }
    }

    return context;
}

/**
 * Prepends context information to the prompt
 */
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

/**
 * Reads a prompt template from the specified file path
 * @param templatePath - The path to the template file
 * @param templateName - The name of the template (for logging)
 * @returns The template content or null if not found or error
 */
export function readPromptTemplate(templatePath: string, templateName: string): string | null {
    if (!existsSync(templatePath)) {
        return null;
    }

    try {
        return readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.warn(`Warning: Could not read ${templateName}: ${String(error)}`);
        
        return null;
    }
}

/**
 * Processes template with context replacements
 * Handles both camelCase and UPPER_CASE template variables
 */
export function processTemplate(template: string, context: {
    taskTitle?: string;
    taskDescription?: string;
    projectContext?: string;
    codingStandards?: string;
}): string {
    let processed = template;

    // Replace template variables - handle both formats (camelCase and UPPER_CASE)
    processed = processed.replace(/{{TASK_TITLE}}/g, context.taskTitle || '');
    processed = processed.replace(/{{taskTitle}}/g, context.taskTitle || '');
    processed = processed.replace(/{{TASK_DESCRIPTION}}/g, context.taskDescription || '');
    processed = processed.replace(/{{taskDescription}}/g, context.taskDescription || '');
    
    // Replace context placeholders
    processed = processed.replace(/{{PROJECT_CONTEXT}}/g, context.projectContext || 'No project context available');
    processed = processed.replace(/{{CODING_STANDARDS}}/g, context.codingStandards || 'No coding standards available');

    return processed;
}

/**
 * Reads the auto-merge prompt template from the expected location
 * @returns The template content or null if not found
 */
export function readAutoMergePromptTemplate(): string | null {
    const templatePath = '/workspace/data/preferences/auto-merge-prompt.md';

    return readPromptTemplate(templatePath, 'auto-merge-prompt.md');
}