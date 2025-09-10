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