# Configurator UI Component Architecture

## Overview
Comprehensive architecture design for the preference editor system configurator UI component within the @apps/web Next.js application.

## Existing App Analysis

### Current Structure
- **Framework**: Next.js 15.5.2 with App Router
- **React Version**: 19.1.0
- **Styling**: TailwindCSS v4
- **TypeScript**: Full TypeScript support
- **Fonts**: Geist Sans & Geist Mono
- **Build**: Standalone output for production

### Current App Structure
```
apps/web/
├── app/
│   ├── layout.tsx       # Root layout with fonts and global styles
│   ├── page.tsx         # Home page (to be replaced/extended)
│   └── globals.css      # TailwindCSS imports + CSS variables
├── package.json         # Dependencies and scripts
└── next.config.ts       # Next.js configuration
```

## Component Architecture Design

### 1. Component Hierarchy

```
ConfiguratorApp
├── ConfiguratorLayout
│   ├── ConfiguratorHeader
│   │   ├── BrandLogo
│   │   ├── ActionButtons
│   │   │   ├── SaveButton
│   │   │   ├── ResetButton
│   │   │   └── ExportButton
│   │   └── StatusIndicator
│   ├── ConfiguratorSidebar
│   │   ├── FileTree
│   │   │   ├── FileTreeNode
│   │   │   └── FileTreeActions
│   │   ├── ConfigSection
│   │   └── PreferencesPanel
│   └── ConfiguratorMain
│       ├── EditorPanel
│       │   ├── MonacoEditor
│       │   ├── EditorTabs
│       │   └── EditorActions
│       ├── PreviewPanel
│       │   ├── LivePreview
│       │   └── PreviewActions
│       └── ValidationPanel
│           ├── ErrorList
│           └── WarningList
└── ConfiguratorModals
    ├── UnsavedChangesModal
    ├── ErrorModal
    └── ConfirmationModal
```

### 2. Core Components Detail

#### ConfiguratorApp
- **Purpose**: Root configurator component
- **State**: Global configuration state, active files, editor modes
- **Location**: `/apps/web/app/configurator/page.tsx`

#### ConfiguratorLayout
- **Purpose**: Main layout container with responsive design
- **Features**: Split pane layout, resizable panels
- **Responsive**: Mobile-first with collapsible sidebar

#### EditorPanel with Monaco Integration
- **Purpose**: Code editing with syntax highlighting
- **Features**: 
  - Multi-language support (JSON, YAML, TOML, JS, TS)
  - Auto-completion for configuration schemas
  - Error highlighting and validation
  - Diff view for comparing changes

### 3. File Structure

```
apps/web/
├── app/
│   ├── configurator/
│   │   ├── page.tsx                    # Main configurator page
│   │   ├── layout.tsx                  # Configurator-specific layout
│   │   └── loading.tsx                 # Loading state
├── components/
│   └── configurator/
│       ├── ConfiguratorApp.tsx
│       ├── layout/
│       │   ├── ConfiguratorLayout.tsx
│       │   ├── ConfiguratorHeader.tsx
│       │   └── ConfiguratorSidebar.tsx
│       ├── editor/
│       │   ├── MonacoEditor.tsx
│       │   ├── EditorPanel.tsx
│       │   └── EditorTabs.tsx
│       ├── navigation/
│       │   ├── FileTree.tsx
│       │   ├── FileTreeNode.tsx
│       │   └── PreferencesPanel.tsx
│       ├── modals/
│       │   ├── UnsavedChangesModal.tsx
│       │   └── ErrorModal.tsx
│       └── ui/
│           ├── StatusIndicator.tsx
│           ├── ActionButtons.tsx
│           └── ValidationPanel.tsx
├── hooks/
│   └── configurator/
│       ├── useConfiguratorState.ts
│       ├── useFileOperations.ts
│       ├── useMonacoEditor.ts
│       └── useValidation.ts
├── lib/
│   └── configurator/
│       ├── configTypes.ts
│       ├── fileOperations.ts
│       ├── validation.ts
│       └── storage.ts
└── styles/
    └── configurator/
        └── monaco-theme.css
```

## State Management Strategy

### 1. State Architecture
Using React's Context API with useReducer for complex state management:

```typescript
interface ConfiguratorState {
  // File Management
  files: ConfigFile[]
  activeFileId: string | null
  unsavedChanges: Record<string, boolean>
  
  // Editor State
  editorMode: 'edit' | 'preview' | 'split'
  cursorPosition: Position
  selectedText: string
  
  // Validation
  errors: ValidationError[]
  warnings: ValidationWarning[]
  
  // UI State
  sidebarVisible: boolean
  panelSizes: PanelSizes
  theme: 'light' | 'dark' | 'auto'
}
```

### 2. Context Providers
```typescript
<ConfiguratorProvider>
  <FileProvider>
    <EditorProvider>
      <ValidationProvider>
        <ConfiguratorApp />
      </ValidationProvider>
    </EditorProvider>
  </FileProvider>
</ConfiguratorProvider>
```

### 3. Custom Hooks
- **useConfiguratorState**: Global state management
- **useFileOperations**: File CRUD operations
- **useMonacoEditor**: Monaco editor integration
- **useValidation**: Real-time validation
- **useAutoSave**: Automatic saving functionality

## Monaco Editor Integration

### 1. Installation & Setup
```bash
npm install @monaco-editor/react monaco-editor
```

### 2. Monaco Configuration
- **Languages**: JSON, YAML, TOML, JavaScript, TypeScript
- **Themes**: Custom dark/light themes matching app design
- **Features**: IntelliSense, error squiggles, auto-formatting

### 3. Schema Integration
```typescript
interface MonacoConfig {
  schemas: {
    [fileType: string]: JSONSchema7
  }
  validation: boolean
  autocompletion: boolean
  errorChecking: boolean
}
```

## File Navigation Interface

### 1. File Tree Component
- **Virtual scrolling** for large file lists
- **Search and filter** capabilities
- **Drag and drop** for file organization
- **Context menus** for file operations

### 2. File Operations
```typescript
interface FileOperations {
  createFile(path: string, type: FileType): Promise<void>
  deleteFile(id: string): Promise<void>
  renameFile(id: string, newName: string): Promise<void>
  moveFile(id: string, newPath: string): Promise<void>
  duplicateFile(id: string): Promise<void>
}
```

### 3. File Types Support
- Configuration files (JSON, YAML, TOML)
- Environment files (.env)
- Script files (JS, TS)
- Documentation (MD)

## Save/Update Functionality

### 1. Save Strategies
- **Auto-save**: Every 30 seconds with debouncing
- **Manual save**: Ctrl+S or save button
- **Batch save**: Save all modified files
- **Save on focus loss**: Prevent data loss

### 2. Persistence Layer
```typescript
interface StorageAdapter {
  save(fileId: string, content: string): Promise<void>
  load(fileId: string): Promise<string>
  delete(fileId: string): Promise<void>
  list(): Promise<FileMetadata[]>
  backup(): Promise<BackupInfo>
}
```

### 3. Conflict Resolution
- **Last-write-wins** with warnings
- **Three-way merge** for complex conflicts
- **Manual resolution** interface

## Error Handling & Validation

### 1. Validation Pipeline
```typescript
interface ValidationPipeline {
  syntaxValidation(content: string, fileType: string): ValidationResult
  schemaValidation(content: object, schema: JSONSchema7): ValidationResult
  crossFileValidation(files: ConfigFile[]): ValidationResult
  businessLogicValidation(config: Configuration): ValidationResult
}
```

### 2. Error Categories
- **Syntax Errors**: JSON parsing, YAML formatting
- **Schema Errors**: Missing required fields, type mismatches  
- **Logic Errors**: Invalid configurations, circular dependencies
- **Warning Errors**: Deprecated options, performance concerns

### 3. Error Display
- **Inline markers** in Monaco editor
- **Error panel** with detailed descriptions
- **Toast notifications** for critical errors
- **Status bar indicators** for error counts

## Responsive Design Strategy

### 1. Breakpoints
- **Mobile**: < 768px - Single column, collapsed sidebar
- **Tablet**: 768px - 1024px - Resizable panels
- **Desktop**: > 1024px - Full three-panel layout

### 2. Mobile Adaptations
- **Bottom sheet** for file navigation
- **Swipe gestures** between panels
- **Touch-optimized** controls
- **Simplified** toolbar

## Performance Considerations

### 1. Code Splitting
```typescript
// Lazy load Monaco editor
const MonacoEditor = lazy(() => import('./components/MonacoEditor'))

// Route-based splitting
const ConfiguratorApp = lazy(() => import('./pages/ConfiguratorApp'))
```

### 2. Virtualization
- **File tree virtualization** for large projects
- **Editor content virtualization** for large files
- **Infinite scrolling** for error lists

### 3. Memoization
- **Component memoization** with React.memo
- **Callback memoization** with useCallback
- **Value memoization** with useMemo

## Security Considerations

### 1. Input Validation
- **XSS prevention** in configuration values
- **Path traversal** protection in file operations
- **Content sanitization** before save operations

### 2. Access Control
- **Read-only modes** for certain files
- **Permission checks** before modifications
- **Audit logging** for all changes

## Testing Strategy

### 1. Component Testing
- **Unit tests** for all components with Jest/RTL
- **Integration tests** for component interactions
- **Visual regression tests** with Storybook

### 2. E2E Testing
- **User workflows** with Playwright
- **Cross-browser testing** 
- **Performance testing** with Lighthouse

## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)
1. Setup component structure
2. Implement basic layout
3. Integrate Monaco editor
4. Basic file operations

### Phase 2: Advanced Features (Week 3-4)
1. State management implementation
2. Validation system
3. File tree with operations
4. Save/auto-save functionality

### Phase 3: Polish & Performance (Week 5-6)
1. Error handling improvements
2. Responsive design implementation
3. Performance optimizations
4. Testing implementation

## Dependencies

### Required Packages
```json
{
  "@monaco-editor/react": "^4.6.0",
  "monaco-editor": "^0.50.0",
  "react-resizable-panels": "^2.0.0",
  "js-yaml": "^4.1.0",
  "@iarna/toml": "^2.2.5",
  "ajv": "^8.12.0",
  "fuse.js": "^7.0.0"
}
```

### Dev Dependencies
```json
{
  "@storybook/react": "^7.6.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "jest": "^29.7.0"
}
```

---

This architecture provides a robust, scalable foundation for the configurator UI that can be implemented by development teams following the specified component hierarchy and patterns.