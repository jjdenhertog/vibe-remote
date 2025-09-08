export function processTemplate(template: string, prompt: string): string {
    return template.replace(/%REPLACE_WITH_PROMPT%/g, prompt);
}