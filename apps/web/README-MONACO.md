# Monaco Editor Setup for @apps/web

## Overview

This project now includes a complete Monaco Editor setup for React with TypeScript support, specifically configured for editing JSON preference files.

## 📦 Installed Packages

- `@monaco-editor/react` ^4.7.0 - React wrapper for Monaco Editor
- `monaco-editor` ^0.52.2 - Core Monaco Editor package

## 🏗️ Architecture

### Core Components

#### `/components/editors/`
- **`MonacoEditor.tsx`** - Base Monaco editor wrapper component
- **`PreferenceEditor.tsx`** - Specialized editor for JSON preference files
- **`MonacoDemo.tsx`** - Demo component for testing
- **`index.ts`** - Barrel export for all editor components

#### `/lib/monaco/`
- **`config.ts`** - Monaco editor configuration, themes, and schema definitions

#### `/types/`
- **`monaco.ts`** - TypeScript type definitions and interfaces

### Key Features

#### MonacoEditor Component
- 🎨 **Theme Support**: Built-in themes (vs, vs-dark, hc-black, hc-light) + custom themes
- ⌨️ **Keyboard Shortcuts**: Ctrl+S for formatting, context menus
- 🔧 **Customizable Options**: Full Monaco editor options support
- 📝 **Multiple Languages**: Support for JavaScript, JSON, TypeScript, etc.

#### PreferenceEditor Component
- ✅ **JSON Validation**: Real-time validation with error highlighting
- 🔄 **Auto-formatting**: Format on save and auto-format option
- 📋 **Schema Support**: JSON schema validation for different preference types
- 📊 **Status Bar**: Shows validation status and error count
- 🎯 **Preference-specific**: Tailored for editing configuration files

## 🚀 Usage Examples

### Basic Monaco Editor

```tsx
import { MonacoEditor } from '@/components/editors';

function MyComponent() {
  const [code, setCode] = useState('const hello = "world";');
  
  return (
    <MonacoEditor
      value={code}
      language="javascript"
      theme="vs-dark"
      height="400px"
      onChange={(value) => setCode(value || '')}
      options={{
        fontSize: 14,
        minimap: { enabled: true },
        wordWrap: 'on',
      }}
    />
  );
}
```

### Preference Editor

```tsx
import { PreferenceEditor } from '@/components/editors';

function SettingsEditor() {
  const [preferences, setPreferences] = useState('{"theme": "dark"}');
  
  return (
    <PreferenceEditor
      value={preferences}
      preferenceName="ui" // Enables UI-specific schema
      height="300px"
      validateOnChange={true}
      autoFormat={true}
      showMinimap={false}
      onChange={(value) => setPreferences(value || '')}
    />
  );
}
```

## 🎨 Available Themes

- `vs` - Light theme
- `vs-dark` - Dark theme  
- `hc-black` - High contrast dark
- `hc-light` - High contrast light
- `preference-light` - Custom light theme for preferences
- `preference-dark` - Custom dark theme for preferences

## 📝 Schema Support

The PreferenceEditor supports different schemas based on the `preferenceName` prop:

- **`editor`** - Editor-specific preferences (theme, fontSize, etc.)
- **`ui`** - UI preferences (sidebar, statusBar, etc.)
- **Custom schemas** - Pass your own schema via the `schema` prop

## ⌨️ Keyboard Shortcuts

### General
- `Ctrl+S` - Format document
- `Ctrl+F` - Find
- `Ctrl+H` - Replace
- `Ctrl+/` - Toggle comment

### Preference Editor
- `Ctrl+F` - Format JSON (if autoFormat enabled)
- `Ctrl+S` - Validate and format
- Right-click - Context menu with validation options

## 🔧 Configuration

### Next.js Configuration

The `next.config.ts` has been updated with Monaco Editor support:

```typescript
// Monaco Editor configuration
webpack: (config, { isServer }) => {
  // Handle Monaco Editor imports
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
  }

  // Configure Monaco Editor worker loading
  config.module.rules.push({
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader' },
  });

  return config;
},

// Transpile Monaco Editor packages
transpilePackages: ['monaco-editor'],
```

### TypeScript Configuration

All Monaco Editor types are properly configured with strict typing support.

## 🧪 Testing the Integration

1. **Development Server**: `pnpm run dev`
2. **Visit**: `http://localhost:3000/monaco-example`
3. **Type Check**: `pnpm run type-check`

The example page demonstrates:
- Basic Monaco editor with JavaScript
- JSON editor with validation
- Preference editor with schema
- All keyboard shortcuts and features

## 📁 File Structure

```
apps/web/
├── components/
│   └── editors/
│       ├── MonacoEditor.tsx
│       ├── PreferenceEditor.tsx
│       ├── MonacoDemo.tsx
│       └── index.ts
├── lib/
│   └── monaco/
│       └── config.ts
├── types/
│   └── monaco.ts
├── app/
│   └── monaco-example/
│       └── page.tsx
└── next.config.ts (updated)
```

## 🐛 Troubleshooting

### Build Issues
- Monaco Editor requires client-side rendering (`'use client'` directive)
- Webpack configuration handles Monaco's Node.js dependencies

### TypeScript Issues
- All types are properly exported from `@/types/monaco`
- Use the provided interfaces for type safety

### Performance
- Monaco Editor loads lazily by default
- Workers are configured for syntax highlighting
- Static assets are cached with proper headers

## 🎯 Next Steps

1. **Customize Themes**: Add more custom themes in `lib/monaco/config.ts`
2. **Add Languages**: Configure additional language support
3. **Schema Extensions**: Add more preference schemas
4. **Integration**: Connect to your preference management system
5. **Persistence**: Add auto-save functionality

## 🔗 References

- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)
- [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- [JSON Schema Validation](https://json-schema.org/)