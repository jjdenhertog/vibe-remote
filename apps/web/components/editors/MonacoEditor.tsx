'use client';

import React, { useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { MonacoEditorProps, Monaco, EditorInstance } from '@/types/monaco';
import { DEFAULT_EDITOR_OPTIONS, configureMonaco } from '@/lib/monaco/config';

const DEFAULT_OPTIONS = {};

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
    value,
    defaultValue,
    language = 'javascript',
    theme = 'vs-dark',
    options = DEFAULT_OPTIONS,
    onChange,
    onMount,
    beforeMount,
    width = '100%',
    height = '400px',
    className,
    wrapperProps,
    loading,
    keepCurrentModel = false,
    saveViewState = true,
    path,
}) => {
    const editorRef = useRef<EditorInstance | null>(null);
    const monacoRef = useRef<Monaco | null>(null);

    const handleBeforeMount = useCallback((monaco: Monaco) => {
        monacoRef.current = monaco;
    
        // Configure Monaco with our defaults
        configureMonaco(monaco);
    
        // Call user's beforeMount if provided
        beforeMount?.(monaco);
    }, [beforeMount]);

    const handleMount = useCallback((editor: EditorInstance, monaco: Monaco) => {
        editorRef.current = editor;
    
        // Add keyboard shortcuts
        // eslint-disable-next-line no-bitwise
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            // Format document on Ctrl+S
            editor.getAction('editor.action.formatDocument')?.run();
        });

        // Add context menu options
        editor.addAction({
            id: 'format-json',
            label: 'Format JSON',
            contextMenuGroupId: 'modification',
            precondition: 'editorLangId == json',
            run: () => {
                editor.getAction('editor.action.formatDocument')?.run();
            },
        });

        // Call user's onMount if provided
        onMount?.(editor, monaco);
    }, [onMount]);

    const handleChange = useCallback((value: string | undefined, event: any) => {
        onChange?.(value, event);
    }, [onChange]);

    const editorOptions = {
        ...DEFAULT_EDITOR_OPTIONS,
        ...options,
    };

    return (
        <div 
            className={`monaco-editor-wrapper ${className || ''}`}
            {...wrapperProps}
    >
            <Editor
                width={width}
                height={height}
                language={language}
                theme={theme}
                value={value || ''}
                defaultValue={defaultValue || ''}
                options={editorOptions}
                onChange={handleChange}
                onMount={handleMount}
                beforeMount={handleBeforeMount}
                loading={loading}
                keepCurrentModel={keepCurrentModel}
                saveViewState={saveViewState}
                {...(path && { path })}
      />
        </div>
    );
};

export default MonacoEditor;