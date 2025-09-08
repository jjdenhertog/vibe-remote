// Monaco Editor Components
export { MonacoEditor } from './MonacoEditor';
export { PreferenceEditor } from './PreferenceEditor';

// Type exports
export type {
    MonacoEditorProps,
    PreferenceEditorProps,
    ValidationError,
    EditorConfig,
    Monaco,
    EditorInstance
} from '@/types/monaco';

// Configuration exports
export {
    DEFAULT_EDITOR_OPTIONS,
    JSON_EDITOR_OPTIONS,
    PREFERENCE_EDITOR_OPTIONS,
    THEMES,
    configureMonaco,
    getPreferenceSchema
} from '@/lib/monaco/config';