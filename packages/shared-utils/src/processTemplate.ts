type ProcessTemplateContext = {
    taskId?: string;
    projectId?: string;
    taskTitle?: string;
    taskDescription?: string;
};

export function processTemplate(template: string, context: ProcessTemplateContext): string {
    let processed = template;

    // Replace template variables - handle both formats (camelCase and UPPER_CASE)
    processed = processed.replace(/{{taskId}}/g, context.taskId || '');
    processed = processed.replace(/{{projectId}}/g, context.projectId || '');
    processed = processed.replace(/{{taskTitle}}/g, context.taskTitle || '');
    processed = processed.replace(/{{taskDescription}}/g, context.taskDescription || '');
    
    // Also support UPPER_CASE format for backward compatibility
    processed = processed.replace(/{{TASK_ID}}/g, context.taskId || '');
    processed = processed.replace(/{{PROJECT_ID}}/g, context.projectId || '');
    processed = processed.replace(/{{TASK_TITLE}}/g, context.taskTitle || '');
    processed = processed.replace(/{{TASK_DESCRIPTION}}/g, context.taskDescription || '');

    return processed;
}
