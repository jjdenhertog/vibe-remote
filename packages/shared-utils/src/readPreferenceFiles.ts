import { readPreferenceFile } from './readPreferenceFile';

export type PreferenceContext = {
    codingStandards: string;
    projectContext: string;
};


export function readPreferenceFiles(): PreferenceContext {
    return {
        codingStandards: readPreferenceFile('coding-standards.md') || '',
        projectContext: readPreferenceFile('project-context.md') || ''
    };
}
