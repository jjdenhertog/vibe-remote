'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { MonacoEditor } from './MonacoEditor';
import type { PreferenceEditorProps, ValidationError, Monaco, EditorInstance } from '@/types/monaco';
import { 
    PREFERENCE_EDITOR_OPTIONS, 
    configureMonaco, 
    getPreferenceSchema 
} from '@/lib/monaco/config';

type PreferenceEditorState = {
  isValid: boolean;
  errors: ValidationError[];
  formatted: boolean;
}

export const PreferenceEditor: React.FC<PreferenceEditorProps> = ({
    value,
    defaultValue = '{\n  \n}',
    preferenceName,
    schema,
    validateOnChange = true,
    autoFormat = true,
    showMinimap = false,
    readOnly = false,
    theme = 'preference-dark',
    onChange,
    onMount,
    beforeMount,
    className,
    ...props
}) => {
    const [state, setState] = useState<PreferenceEditorState>({
        isValid: true,
        errors: [],
        formatted: false,
    });
    const editorRef = useRef<EditorInstance | null>(null);
    const monacoRef = useRef<Monaco | null>(null);

    const validateJSON = useCallback((jsonString: string): ValidationError[] => {
        const errors: ValidationError[] = [];
    
        if (!jsonString) return errors;
    
        try {
            JSON.parse(jsonString);
        } catch (error) {
            if (error instanceof SyntaxError && error.message) {
                const match = /at position (\d+)/.exec(error.message);
                const position = match?.[1] ? parseInt(match[1], 10) : 0;
        
                // Convert position to line/column
                const lines = jsonString.slice(0, position).split('\n');
                const line = lines.length;
                const lastLine = lines.at(-1);
                const column = lastLine ? lastLine.length + 1 : 1;
        
                errors.push({
                    line,
                    column,
                    message: error.message,
                    severity: 'error',
                });
            }
        }
    
        return errors;
    }, []);

    const formatJSON = useCallback((jsonString: string | undefined): string => {
        if (!jsonString) return '';

        try {
            return JSON.stringify(JSON.parse(jsonString), null, 2);
        } catch {
            return jsonString;
        }
    }, []);

    const handleBeforeMount = useCallback((monaco: Monaco) => {
        monacoRef.current = monaco;
        configureMonaco(monaco);

        // Set up JSON schema if provided
        const jsonSchema = schema || getPreferenceSchema(preferenceName);
        if (jsonSchema) {
            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                allowComments: true,
                trailingCommas: 'ignore',
                schemas: [
                    {
                        uri: `http://vibe-remote.com/schemas/${preferenceName || 'default'}.json`,
                        fileMatch: ['*'],
                        schema: jsonSchema,
                    }
                ],
                enableSchemaRequest: true,
            });
        }

        beforeMount?.(monaco);
    }, [beforeMount, schema, preferenceName]);

    const handleMount = useCallback((editor: EditorInstance, monaco: Monaco) => {
        editorRef.current = editor;

        // Add preference-specific keyboard shortcuts
        // eslint-disable-next-line no-bitwise
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
            if (autoFormat) {
                const currentValue = editor.getValue();
                const formatted = formatJSON(currentValue);
                if (formatted !== currentValue) {
                    editor.setValue(formatted);
                    setState(prev => ({ ...prev, formatted: true }));
                }
            }
        });

        // Add preference validation on save
        // eslint-disable-next-line no-bitwise
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            const currentValue = editor.getValue() || '';
            const errors = validateJSON(currentValue);
      
            setState(prev => ({
                ...prev,
                isValid: errors.length === 0,
                errors,
            }));

            if (errors.length === 0 && autoFormat) {
                const formatted = formatJSON(currentValue);
                if (formatted !== currentValue) {
                    editor.setValue(formatted);
                }
            }
        });

        // Add context menu for preferences
        editor.addAction({
            id: 'validate-preferences',
            label: 'Validate Preferences',
            contextMenuGroupId: 'navigation',
            run: () => {
                const currentValue = editor.getValue() || '';
                const errors = validateJSON(currentValue);
        
                setState(prev => ({
                    ...prev,
                    isValid: errors.length === 0,
                    errors,
                }));

                const model = editor.getModel();
                if (model) {
                    if (errors.length === 0) {
                        monaco.editor.setModelMarkers(model, 'preference-validator', []);
                    } else {
                        const markers = errors.map(error => ({
                            startLineNumber: error.line,
                            startColumn: error.column,
                            endLineNumber: error.line,
                            endColumn: error.column + 1,
                            message: error.message,
                            severity: error.severity === 'error' ? 8 : 4, // Monaco severity values
                        }));
                        monaco.editor.setModelMarkers(model, 'preference-validator', markers);
                    }
                }
            },
        });

        onMount?.(editor, monaco);
    }, [onMount, autoFormat, formatJSON, validateJSON]);

    const handleChange = useCallback((value: string | undefined, event: any) => {
        if (validateOnChange && value) {
            const errors = validateJSON(value);
            setState(prev => ({
                ...prev,
                isValid: errors.length === 0,
                errors,
                formatted: false,
            }));
        }

        onChange?.(value, event);
    }, [onChange, validateOnChange, validateJSON]);

    // Auto-format on first load if enabled
    useEffect(() => {
        if (autoFormat && value && editorRef.current && !state.formatted) {
            const formatted = formatJSON(value);
            if (formatted !== value && onChange) {
                onChange(formatted, {} as any);
            }

            setState(prev => ({ ...prev, formatted: true }));
        }
    }, [value, autoFormat, formatJSON, onChange, state.formatted]);

    const editorOptions = {
        ...PREFERENCE_EDITOR_OPTIONS,
        minimap: { enabled: showMinimap },
        readOnly,
    };

    return (
        <div className={`preference-editor ${className || ''}`}>
            {/* Status bar */}
            <div className="preference-editor-status bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm flex items-center justify-between border-b">
                <div className="flex items-center space-x-4">
                    <span className="text-gray-600 dark:text-gray-400">
                        {preferenceName ? `${preferenceName} preferences` : 'JSON preferences'}
                    </span>
                    {state.errors.length > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                        {state.errors.length} error{state.errors.length === 1 ? '' : 's'}
                    </span>
                    )}
                    {state.isValid ? <span className="text-green-600 dark:text-green-400">Valid JSON</span> : null}
                </div>
                <div className="flex items-center space-x-2">
                    {autoFormat ? <span className="text-xs text-gray-500">Auto-format: ON</span> : null}
                    {readOnly ? <span className="text-xs text-orange-500">Read-only</span> : null}
                </div>
            </div>

            {/* Editor */}
            <MonacoEditor
                value={value || ''}
                defaultValue={defaultValue}
                language="json"
                theme={theme}
                options={editorOptions}
                onChange={handleChange}
                onMount={handleMount}
                beforeMount={handleBeforeMount}
                {...props}
      />

            {/* Error list */}
            {state.errors.length > 0 && (
            <div className="preference-editor-errors border-t bg-red-50 dark:bg-red-900/20">
                <div className="p-2">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                        Validation Errors:
                    </h4>
                    <ul className="text-xs space-y-1">
                        {state.errors.map((error, index) => (
                            <li key={index} className="text-red-700 dark:text-red-300">
                                Line {error.line}, Column {error.column}: {error.message}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            )}
        </div>
    );
};

export default PreferenceEditor;