type ProcessTemplateContext = {
    taskTitle?: string;
    taskDescription?: string;
};

export function processTemplate(template: string, context: ProcessTemplateContext): string {
    let processed = template;

    // Replace template variables - handle both formats (camelCase and UPPER_CASE)
    processed = processed.replace(/{{TASK_TITLE}}/g, context.taskTitle || '');
    processed = processed.replace(/{{TASK_DESCRIPTION}}/g, context.taskDescription || '');

    return processed;
}
