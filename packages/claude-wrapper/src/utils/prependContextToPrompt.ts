import { PreferenceContext } from "../types/PreferenceContext";


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
