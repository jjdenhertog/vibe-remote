import type { editor   } from 'monaco-editor';

export type MonacoEditorProps = {
  value?: string;
  defaultValue?: string;
  language?: string;
  theme?: string;
  options?: editor.IStandaloneEditorConstructionOptions;
  onChange?: (value: string | undefined, event: editor.IModelContentChangedEvent) => void;
  onMount?: (editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => void;
  beforeMount?: (monaco: typeof import('monaco-editor')) => void;
  width?: string | number;
  height?: string | number;
  className?: string;
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  loading?: React.ReactNode;
  keepCurrentModel?: boolean;
  saveViewState?: boolean;
  path?: string;
}

export type PreferenceEditorProps = {
  preferenceName?: string;
  schema?: object;
  validateOnChange?: boolean;
  autoFormat?: boolean;
  showMinimap?: boolean;
  readOnly?: boolean;
} & Omit<MonacoEditorProps, 'language' | 'options'>

export type MonacoTheme = {
  name: string;
  displayName: string;
  isDark: boolean;
}

export type ValidationError = {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export type EditorConfig = {
  theme: MonacoTheme['name'];
  fontSize: number;
  fontFamily: string;
  lineNumbers: 'on' | 'off' | 'relative' | 'interval';
  minimap: boolean;
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  autoFormat: boolean;
  validateOnSave: boolean;
}

// Re-export commonly used Monaco types

export type EditorInstance = editor.IStandaloneCodeEditor;
export type Monaco = typeof import('monaco-editor');
export {type languages, type IRange, type editor} from 'monaco-editor';