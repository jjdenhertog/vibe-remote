# Coding Guidelines for Vibe-Remote-Workstation Project

This document outlines the comprehensive coding standards, patterns, and preferences for the Vibe-Remote-Workstation project. These guidelines focus on **how I write code** - the specific patterns, file organization, and coding style preferences that ensure consistency across all development work.

---

## Project Architecture

### Monorepo Structure
- **Use pnpm workspaces** with clear separation between `apps/` and `packages/`
- **Package naming**: `@vibe-remote/[package-name]` convention
- **Workspace dependencies**: Use `workspace:*` format
- **TypeScript project references** for efficient builds

```
vibe-remote-workstation/
├── apps/                    # Application-level code
│   └── web/                # Next.js frontend application  
├── packages/               # Shared libraries and utilities
│   ├── claude-wrapper/     # TypeScript CLI tool
│   ├── shared-types/       # Common TypeScript types (future)
│   └── shared-utils/       # Utility functions (future)
└── config/                 # TypeScript configurations
```

### Package Organization Standards
- Each package MUST have consistent structure: `src/`, `dist/`, `package.json`, `tsconfig.json`
- **NO barrel exports** - each type and function must be imported with full path
- Separate server-side and client-side utilities clearly
- Shared types MUST be in dedicated `@vibe-remote/shared-types` package

---

## **CRITICAL: NO Barrel Files Policy**

### **Barrel Files Are Strictly Forbidden**

This project enforces a strict **NO barrel files** policy:

- **NO `index.ts` files** for re-exporting modules
- **NO `export * from` patterns** 
- **ALL imports MUST use full paths** to specific files
- **Each file exports exactly ONE function OR ONE type**

```typescript
// ✅ CORRECT - Full path imports required (NO 'src' in path)
import { createConnection } from '@vibe-remote/shared-utils/connection/createConnection';
import { RemoteConfig } from '@vibe-remote/shared-types/remote/RemoteConfig';

// ❌ FORBIDDEN - 'src' in import paths
import { createConnection } from '@vibe-remote/shared-utils/src/connection/createConnection';
import { RemoteConfig } from '@vibe-remote/shared-types/src/remote/RemoteConfig';

// ❌ FORBIDDEN - Barrel imports not allowed
import { createConnection, RemoteConfig } from '@vibe-remote/shared-utils';
import * as utils from '@vibe-remote/shared-utils';
```

### Benefits of NO Barrel Files
- **Explicit dependencies**: Every import shows exactly which file is used
- **Better tree shaking**: Bundlers can eliminate unused code more effectively
- **Clearer debugging**: Stack traces point to exact source files
- **Prevents circular dependencies**: Full paths make dependency chains visible
- **Faster builds**: TypeScript doesn't need to resolve barrel exports

---

## File Organization Patterns

### Utility File Structure
Utilities are organized into **domain-specific directories** within `src/`:

```
packages/shared-utils/src/
├── vibe/                   # Vibe-Kanban utilities
│   └── createTask.ts      # One function per file
├── claude/                # Claude AI utilities
│   └── executeCommand.ts
├── remote/                # Remote connection utilities  
│   ├── establishConnection.ts
│   └── validateConnection.ts
├── validation/            # Validation utilities
│   ├── validateConfig.ts
│   └── validateCredentials.ts
└── utils/                 # General utilities
    ├── getConfigDir.ts
    └── getWorkspaceDir.ts
```

### Directory Naming Patterns
- **Domain-based grouping**: `vibe/`, `claude/`, `remote/`, `validation/`
- **Function-based grouping**: `array/`, `cache/`, `utils/`
- **Always plural for collections**: `functions/`, `utils/`, `validation/`

---

## One Function Per File Rule

### **CRITICAL: Each File Contains Exactly One Function OR One Type**

This is a fundamental pattern throughout the codebase - every utility function gets its own file, and every type gets its own file:

```typescript
// ✅ CORRECT - createTask.ts
export function createTask(title: string, description: string): Task {
    return {
        id: generateId(),
        title,
        description,
        created: new Date()
    };
}

// ✅ CORRECT - validateConnection.ts  
export function validateConnection(config: RemoteConfig): boolean {
    return !!(config.host && config.port && config.credentials);
}
```

### Benefits of One-Function-Per-File and One-Type-Per-File
- **Clear imports**: `import { createTask } from './vibe/createTask'`
- **Easy discovery**: Function/type location is predictable from name
- **Focused files**: Each file has single responsibility
- **Better organization**: Related functions and types grouped by domain directory
- **NO barrel files**: Full path imports ensure explicit dependencies

### File Naming for Functions and Types
- **File name MUST match export name**: `createTask.ts` exports `createTask`, `RemoteConfig.ts` exports `RemoteConfig`
- **camelCase for function files**: `createTask.ts`, `validateConnection.ts`
- **PascalCase for type files**: `RemoteConfig.ts`, `TaskConfig.ts`
- **Descriptive names**: File name should clearly indicate function/type purpose

---

## File and Directory Naming

### File Naming Conventions
- **camelCase** for utility files: `createTask.ts`, `validateConnection.ts`
- **PascalCase** for React components: `RemoteConnection.tsx`, `TaskManager.tsx`
- **PascalCase** for TypeScript types: `RemoteConfig.ts`, `TaskConfig.ts`
- **kebab-case** for directories: `remote-connection/`, `task-manager/`

### Variable and Function Naming
- **camelCase** for variables and functions: `remoteConfig`, `onConnectionClick`
- **SCREAMING_SNAKE_CASE** for constants: `DEFAULT_REMOTE_CONFIG`
- **PascalCase** for types and interfaces: `RemoteConfig`, `TaskConfig`

---

## Async/Await Preferences

### **CRITICAL: ALL Async Operations MUST Use errorBoundary**

Every single async operation in React components MUST be wrapped with the `errorBoundary` helper:

```typescript
// ✅ CORRECT - Required pattern for ALL async operations
const onConnectClick = useCallback(() => {
    errorBoundary(async () => {
        const connection = await establishConnection();
        await updateConfig(connection);
        enqueueSnackbar('Connected successfully');
    });
}, []);

// ✅ CORRECT - useEffect with async operations
useEffect(() => {
    errorBoundary(async () => {
        const config = await loadRemoteConfig();
        setConfig(config);
        setLoading(false);
    });
}, []);

// ✅ CORRECT - Event handlers with async operations
const onDeleteTaskClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const { taskId } = e.currentTarget.dataset;
    errorBoundary(async () => {
        await deleteTask(taskId);
        await reloadTasks();
    });
}, []);

// ❌ FORBIDDEN - Direct async without errorBoundary
const badHandler = useCallback(async () => {
    await connectToRemote(); // Will not handle errors properly
}, []);
```

### errorBoundary Pattern Rules
- **ALWAYS wrap** async operations in React components with `errorBoundary`
- **Centralized error handling** - errors are automatically shown to user
- **Optional cleanup function** as second parameter for loading states
- **Available in**: `@/helpers/errors/errorBoundary`

```typescript
// ✅ With cleanup function
const onConnectClick = useCallback(() => {
    errorBoundary(async () => {
        setConnecting(true);
        await establishConnection();
    }, () => {
        setConnecting(false); // Cleanup on error
    });
}, []);
```

### **ALWAYS Prefer async/await over Promises**

Throughout the codebase, async/await is consistently preferred over `.then()/.catch()` chains:

```typescript
// ✅ CORRECT - API utility functions with async/await
export async function establishConnection(config: RemoteConfig): Promise<Connection> {
    const response = await AxiosRequest.post(url, config);
    return response.data;
}

// ❌ AVOID - Promise chains (use async/await instead)
export function establishConnection(config: RemoteConfig): Promise<Connection> {
    return AxiosRequest.post(url, config)
        .then(response => response.data)
        .catch(error => {
            throw error;
        });
}
```

### Async Function Patterns
- **React components**: MUST use `errorBoundary` wrapper for all async operations
- **Utility functions**: Use direct async/await with try/catch if needed
- **Return types**: Always specify `Promise<T>` return types for async functions

---

## TypeScript Patterns

### Type Definitions
- **ALWAYS prefer `type` over `interface`** (enforced by ESLint rule `@typescript-eslint/consistent-type-definitions`)
- Use optional properties with `?` syntax consistently
- Utilize union types and discriminated unions effectively

```typescript
// ✅ CORRECT - Use type declarations
export type RemoteConfig = {
    host: string;
    port: number;
    credentials?: AuthCredentials;
    timeout?: number;
}

// ❌ INCORRECT - Don't use interfaces
export interface RemoteConfig {
    host: string;
    port: number;
}
```

### Response Type Patterns
- Response types use descriptive naming pattern:

```typescript
export type GetRemoteConfigResponse = RemoteConfig
export type CreateTaskResponse = {
    id: Task["id"];
    status: Task["status"];
    created: Task["created"];
}
```

### Generic Usage
- Use generics for reusable utility functions
- Follow `T`, `U`, `V` convention for type parameters

```typescript
export function validateRequired<T>(value: T, fieldName: string): T {
    if (!value) {
        throw new Error(`${fieldName} is required`);
    }
    return value;
}
```

---

## React Component Patterns

### Component Structure Requirements
- **MUST use functional components exclusively** (class components forbidden by ESLint)
- **MUST export components as default exports**
- **MUST destructure props** (required by ESLint)
- **SHOULD use React.memo** for performance when receiving props

```typescript
// ✅ CORRECT - Functional component with proper structure
export default function RemoteConnection() {
    const [connecting, setConnecting] = useState(false);
    const [config, setConfig] = useState<RemoteConfig | null>(null);
    
    // Component logic here
    
    return (
        <>
            {/* component JSX */}
        </>
    );
}
```

### State Management Standards
- **useState** for local component state
- **useCallback** MANDATORY for ALL event handlers (strictly enforced by ESLint)
- **useMemo** for expensive computations
- **Custom hooks** for reusable logic

---

## Event Handler Requirements

### **CRITICAL: All Event Handlers MUST Use useCallback**

This is strictly enforced by ESLint rule `react/jsx-no-bind`. NO exceptions allowed.

```typescript
// ✅ CORRECT - Required pattern
const onClick = useCallback(() => {
    // handler logic
}, []);

return <div onClick={onClick}>Click me</div>;

// ❌ ABSOLUTELY FORBIDDEN - Will cause ESLint error
return <div onClick={() => {}}>Click me</div>;
return <div onClick={handleClick.bind(this)}>Click me</div>;
```

### Event Handler Patterns
- **ALWAYS use useCallback** for event handlers
- **Include proper dependencies** in useCallback dependency array
- **Use descriptive names**: `onConnectClick`, `onSaveConfigClick`

```typescript
// ✅ CORRECT - Complete event handler pattern
const onConfigChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
}, []);

const onConnectClick = useCallback(() => {
    errorBoundary(async () => {
        await establishConnection(config);
    });
}, [config]);

return (
    <>
        <input name="host" onChange={onConfigChange} />
        <button onClick={onConnectClick}>Connect</button>
    </>
);
```

---

## Conditional Rendering Rules

### **CRITICAL: Explicit Boolean Coercion Required**

All conditional rendering MUST use explicit boolean coercion to prevent render leaks.

```typescript
// ✅ CORRECT - Required patterns
{!!connecting && <CircularProgress />}
{!!config && <div>{config.host}</div>}
{!!connected && !!config?.host && <RemoteConnection />}

// ❌ FORBIDDEN - Will cause ESLint error (react/jsx-no-leaked-render)
{connecting && <CircularProgress />}
{config && <div>{config.host}</div>}
{connected && config?.host && <RemoteConnection />}
```

### Conditional Rendering Best Practices
- **Use `!!` for boolean conversion** in all conditional renders
- **Use ternary operators** for conditional content with alternatives
- **Chain conditions** with `&&` after explicit boolean conversion

```typescript
// ✅ CORRECT - Complex conditional rendering
{!!connected && !!config?.host &&
    <>
        <ConnectionStatus />
        <TaskManager />
    </>
}

// ✅ CORRECT - Ternary with explicit boolean conversion  
{!!isConnecting ? <Spinner /> : <ConnectionForm />}
```

---

## API Route Patterns

### Route Structure Standards
- **Use `next-connect`** for route handling with typed request/response
- **Implement consistent error handling** using `generateError` helper
- **Use method-based routing** (GET, POST, PUT, DELETE)

```typescript
import { createRouter } from 'next-connect';
import type { NextApiRequest, NextApiResponse } from 'next';

const router = createRouter<NextApiRequest, NextApiResponse>()
    .get(async (_req, res) => {
        try {
            // GET implementation
            res.json(result);
        } catch (error) {
            console.error('Error getting resource:', error);
            res.status(500).json({ error: 'Failed to get resource' });
        }
    })
    .post(async (req, res) => {
        try {
            // POST implementation with validation
            if (!req.body.required_field) {
                return res.status(400).json({ error: 'Missing required field' });
            }
            // Process request...
        } catch (error) {
            console.error('Error creating resource:', error);
            res.status(500).json({ error: 'Failed to create resource' });
        }
    });

export default router.handler({
    onError: (err: unknown, req: NextApiRequest, res: NextApiResponse) => {
        generateError(req, res, "Resource Name", err);
    }
});
```

### Request/Response Standards
- **Input validation** with early returns for invalid data
- **Consistent error responses** with descriptive messages
- **Proper HTTP status codes**: 400 for client errors, 500 for server errors
- **Type-safe response interfaces** exported alongside handlers

---

## Error Handling Standards

### Error Boundary Pattern
MUST use the centralized `errorBoundary` helper for all async operations:

```typescript
// ✅ REQUIRED - Error boundary usage
const onConnectClick = useCallback(() => {
    errorBoundary(async () => {
        await establishConnection();
        enqueueSnackbar('Connected successfully');
    }, () => {
        setConnecting(false); // cleanup on error
    });
}, []);
```

### API Error Handling
- **Consistent error response format** across all endpoints
- **Method-specific error messages** based on HTTP method
- **Error logging** with descriptive context
- **Graceful degradation** for non-critical errors

```typescript
// Standard error generation pattern
export function generateError(req: NextApiRequest, res: NextApiResponse, subject: string, error: unknown) {
    let action: string;
    switch (req.method) {
        case "POST": action = "create"; break;
        case "PUT": action = "update"; break; 
        case "DELETE": action = "delete"; break;
        default: case "GET": action = 'load'; break;
    }
    
    if (typeof error === 'string') {
        res.status(400).json({ error });
    } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
    } else {
        res.status(400).json({ error: `Could not ${action} ${subject}` });
    }
}
```

---

## Import/Export Conventions

### Export Patterns
- **Named exports** required for utilities and types
- **Default exports** for React components and API route handlers
- **NO barrel exports** - `index.ts` files are forbidden
- **NO re-exports** - each import must use full path

```typescript
// ✅ CORRECT - Direct imports with full paths (NO 'src' in path)
import { RemoteConfig } from '@vibe-remote/shared-types/remote/RemoteConfig';
import { establishConnection } from '@vibe-remote/shared-utils/remote/establishConnection';

// ❌ FORBIDDEN - 'src' in import paths
import { RemoteConfig } from '@vibe-remote/shared-types/src/remote/RemoteConfig';
import { establishConnection } from '@vibe-remote/shared-utils/src/remote/establishConnection';

// ❌ FORBIDDEN - Barrel imports
import { RemoteConfig } from '@vibe-remote/shared-types';
import { establishConnection } from '@vibe-remote/shared-utils';
```

### Import Patterns
- **Full path imports** required - no barrel exports allowed
- **NO 'src' in import paths** - paths must exclude the 'src' directory
- **Grouped imports**: external libraries first, then internal modules
- **Type-only imports** when importing only types

```typescript
// ✅ CORRECT - Import organization with full paths (NO 'src' in path)
import { AxiosRequest } from '@vibe-remote/http-client/AxiosRequest';
import { generateError } from '@/helpers/errors/generateError';
import type { NextApiRequest, NextApiResponse } from 'next';
```

---

## Package Management

### Dependencies Standards
- **Use pnpm** as the package manager
- **Workspace dependencies** using `workspace:*` format
- **Peer dependencies** for shared packages appropriately
- **Separate dev dependencies** correctly

### Script Conventions
- **Consistent naming**: `build`, `dev`, `start`, `lint`, `type-check`
- **Workspace-aware scripts** using pnpm workspace commands
- **Build orchestration** with TypeScript project references

```json
{
    "scripts": {
        "build": "tsc --build",
        "build:packages": "tsc --build packages/*",
        "type-check": "pnpm -r run type-check",
        "lint": "pnpm -r --if-present run lint"
    }
}
```

---

## Code Style and Formatting

### Indentation and Spacing
- **4-space indentation** consistently (enforced by ESLint)
- **No tabs** - spaces only
- **Consistent spacing** in object literals and function parameters

### Function Declaration Styles
- **Named function exports** for utilities and main functions
- **Arrow functions** for React event handlers (with useCallback)
- **Function declarations** for standalone functions

```typescript
// ✅ Utility functions - function declarations
export function validateConnection(config?: RemoteConfig): boolean {
    return !!(config?.host && config?.port);
}

// ✅ React event handlers - arrow functions with useCallback
const onConfigChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setConfig(e.target.value);
}, []);
```

---

## Code Quality Commands

### **ALWAYS Run These Commands Before Committing**

```bash
# Lint all code and fix auto-fixable issues
pnpm run lint

# Run TypeScript type checking across all packages  
pnpm run type-check

# Build all packages to ensure compilation works
pnpm run build
```

### ESLint Enforcement
The project uses strict ESLint rules that enforce all the patterns in this guide:

- **`react/jsx-no-bind`**: Forces useCallback for all event handlers
- **`react/jsx-no-leaked-render`**: Requires `!!` for conditional rendering
- **`@typescript-eslint/consistent-type-definitions`**: Enforces `type` over `interface`
- **4-space indentation** strictly enforced

### Pre-commit Checklist
1. ✅ `pnpm run lint` passes without errors
2. ✅ `pnpm run type-check` passes without errors  
3. ✅ `pnpm run build` completes successfully
4. ✅ All event handlers use useCallback
5. ✅ All conditional rendering uses `!!` coercion
6. ✅ One function per file for utilities

---

## Code Reuse and Duplication Prevention

### **CRITICAL: Search Before Creating**

Before implementing any new function or utility, you MUST search the existing codebase to prevent duplication:

**Required Search Process:**
1. **Search by function name** - Use Grep to find similar function names
2. **Search by functionality** - Look for functions that do similar operations
3. **Check domain directories** - Examine relevant utility directories first
4. **Review related files** - Check files in the same feature area

### Mandatory Pre-Implementation Checklist

```typescript
// ✅ REQUIRED - Search process before creating new function
// 1. Search for existing implementations
//    Grep: "createTask", "taskCreate", "addTask"
// 2. Check domain directories
//    Look in: vibe/, task/, utils/, helpers/
// 3. Review similar files
//    Check files that import task utilities
// 4. Only then create if truly needed

// If similar function exists - EXTEND or REFACTOR it
// If duplicate found - USE existing and remove duplicate
// If close match found - CONSOLIDATE into single function
```

### Anti-Duplication Rules

- **NEVER create duplicate functions** - always search first
- **CONSOLIDATE similar functions** - refactor into single, flexible implementation
- **EXTEND existing functions** - add parameters rather than create new functions
- **REMOVE redundant functions** - delete duplicates during refactoring
- **USE existing utilities** - don't reinvent common operations

---

## Fresh Rebuild Policy - NO Fallback/Legacy Code

### **CRITICAL: Complete Refactor Policy**

This project follows a strict **NO fallback/legacy code** policy:

- **NO fallback functions** - If refactoring changes a function signature, update ALL usage sites
- **NO legacy properties** - Remove old properties entirely when refactoring data structures  
- **NO compatibility layers** - Do not create wrappers for old implementations
- **NO deprecated code paths** - Remove old code completely rather than marking as deprecated
- **COMPLETE refactors ONLY** - When changing an implementation, change it everywhere at once

### Required Approach

```typescript
// ✅ CORRECT - Complete refactor, one implementation
export function createConnection(config: RemoteConfig): Promise<Connection> {
    // Single, clean implementation
    return establishConnection(config);
}

export type RemoteConfig = {
    host: string;
    port: number;
    // oldProperty completely removed
}
```

### Refactor Requirements

1. **Identify ALL usage sites** before changing any implementation
2. **Update ALL files simultaneously** in a single change
3. **Remove old code entirely** - do not comment out or mark as deprecated
4. **Update ALL type definitions** to use new structures
5. **Test the complete change** across the entire codebase

---

## Summary of Critical Requirements

### **MUST DO** (Enforced by ESLint - Will Break Build)
1. **useCallback for ALL event handlers** - zero exceptions
2. **`!!` for conditional rendering** - prevent render leaks
3. **errorBoundary for ALL async operations in React** - zero exceptions
4. **One function per file** for utilities
5. **Props destructuring** in components
6. **4-space indentation**
7. **Type over interface**
8. **Functional components only**
9. **NO 'src' in import paths** - exclude 'src' directory from all imports
10. **Complete refactors only** - NO fallback/legacy code allowed
11. **Search before creating** - MUST check for existing implementations first

### **SHOULD DO** (Best Practices)
1. Use React.memo for components with props
2. Use full path imports for all internal modules
3. Follow naming conventions strictly
4. Organize utilities by domain directories
5. Implement proper TypeScript typing

### **NEVER DO** (Forbidden)
1. Inline functions in JSX
2. Boolean conditions without explicit coercion
3. Class components
4. Interface declarations
5. Direct boolean evaluation in conditional rendering
6. Barrel files or index.ts exports
7. Re-export patterns (export * from)
8. Include 'src' in import paths
9. Create fallback/legacy code for compatibility
10. Create duplicate functions without searching existing codebase first

This comprehensive guide ensures consistency and quality across the entire Vibe-Remote-Workstation codebase. All developers and AI code generators MUST follow these patterns without exception.