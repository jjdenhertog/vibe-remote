import { existsSync, readFileSync } from 'node:fs';
import { PreferenceContext } from '../types/PreferenceContext';


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
