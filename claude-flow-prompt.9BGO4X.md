 You are orchestrating a Claude Flow Swarm using Claude Code's Task tool for agent execution.

  🚨 CRITICAL INSTRUCTION: Use Claude Code's Task Tool for ALL Agent Spawning!
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Claude Code's Task tool = Spawns agents that DO the actual work
  ❌ MCP tools = Only for coordination setup, NOT for execution
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🎯 OBJECTIVE: # Project Context

This project is a "vibe workstation" released to docker. Only the web environment can be tested using pnpm run dev:web. But the actual testing cannot really be done as we need to run it "as a docker container" to really work with it.

# Goal
It aims to be a vibe coding workstation where you can load of tasks or generate tasks using claude MCP (by SSH-ing into it).

# Important
- WE ARE NOT USING A TEST FRAMEWORK (like Jest or Vitest etc!)
- `pnpm run -r type-check`
- `pnpm run -r lint`
- `pnpm run build:clean`
- `pnpm run build:packages`

---

# Coding Standards

# Coding Guidelines for Vibe-Remote-Workstation Project

This document outlines the comprehensive coding standards, patterns, and preferences for the Vibe-Remote-Workstation project. These guidelines focus on **how I write code** - the specific patterns, file organization, and coding style preferences that ensure consistency across all development work.

## IMPORTANT
- Do not assume or guess the eneds. Only create the things that are briefed
- Do not overeginieer, keep it lean & clean
- Always run pnpm -r run lint and pnpm -r run type-check. Fix any errors, leave the warnings
- WE ARE NOT USING A TEST FRAMEWORK (like Jest or Vitest etc!)
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

---

Title: [AI] Implement PR merge execution with gh CLI

Description:**Priority: MEDIUM**
**Dependencies: None**

Implement a simple fallback PR merge function for "always merge" mode:

1. **Create merge function** at `packages/vibe-kanban-cleanup/src/functions/mergePullRequest.ts`:
   - Accept PR URL as parameter
   - Execute `gh pr merge --squash --body "Auto-merged by vibe-kanban" --delete-branch`
   - Suppress and ignore worktree checkout errors (expected behavior)
   - Return merge status

2. **Implement error handling**:
   - Catch gh CLI errors and categorize them
   - Specifically suppress worktree-related checkout errors
   - Log merge attempts with timestamps
   - Return success/failure status

3. **Keep it simple**:
   - This is only used when auto-merge mode is "always" (not Claude decision)
   - No complex logic needed - just execute the merge command
   - Focus on reliable execution and error suppression

**Acceptance Criteria:**
- Successfully merges PR using gh CLI with squash strategy
- Properly suppresses worktree checkout errors
- Returns clear success/failure status
- Simple implementation for "always merge" mode

  🐝 SWARM CONFIGURATION:
  - Strategy: auto
  - Mode: centralized
  - Max Agents: 5
  - Timeout: 200 minutes
  - Parallel Execution: MANDATORY (Always use BatchTool)
  - Review Mode: false
  - Testing Mode: false
  - Analysis Mode: DISABLED

  🚨 CRITICAL: PARALLEL EXECUTION IS MANDATORY! 🚨

  📋 CLAUDE-FLOW SWARM BATCHTOOL INSTRUCTIONS

  ⚡ THE GOLDEN RULE:
  If you need to do X operations, they should be in 1 message, not X messages.

  🎯 MANDATORY PATTERNS FOR CLAUDE-FLOW SWARMS:

  1️⃣ **SWARM INITIALIZATION** - Use Claude Code's Task Tool for Agents:

  Step A: Optional MCP Coordination Setup (Single Message):
  ```javascript
  [MCP Tools - Coordination ONLY]:
    // Set up coordination topology (OPTIONAL)
    mcp__claude-flow__swarm_init {"topology": "mesh", "maxAgents": 5}
    mcp__claude-flow__agent_spawn {"type": "coordinator", "name": "SwarmLead"}
    mcp__claude-flow__memory_store {"key": "swarm/objective", "value": "build me a REST API"}
    mcp__claude-flow__memory_store {"key": "swarm/config", "value": {"strategy": "auto"}}
  ```

  Step B: REQUIRED - Claude Code Task Tool for ACTUAL Agent Execution (Single Message):
  ```javascript
  [Claude Code Task Tool - CONCURRENT Agent Spawning]:
    // Spawn ALL agents using Task tool in ONE message
    Task("Coordinator", "Lead swarm coordination. Use hooks for memory sharing.", "coordinator")
    Task("Researcher", "Analyze requirements and patterns. Coordinate via hooks.", "researcher")
    Task("Backend Dev", "Implement server-side features. Share progress via hooks.", "coder")
    Task("Frontend Dev", "Build UI components. Sync with backend via memory.", "coder")
    Task("QA Engineer", "Create and run tests. Report findings via hooks.", "tester")

    // Batch ALL todos in ONE TodoWrite call (5-10+ todos)
    TodoWrite {"todos": [
      {"id": "1", "content": "Initialize 5 agent swarm", "status": "completed", "priority": "high"},
      {"id": "2", "content": "Analyze: build me a REST API", "status": "in_progress", "priority": "high"},
      {"id": "3", "content": "Design architecture", "status": "pending", "priority": "high"},
      {"id": "4", "content": "Implement backend", "status": "pending", "priority": "high"},
      {"id": "5", "content": "Implement frontend", "status": "pending", "priority": "high"},
      {"id": "6", "content": "Write unit tests", "status": "pending", "priority": "medium"},
      {"id": "7", "content": "Integration testing", "status": "pending", "priority": "medium"},
      {"id": "8", "content": "Performance optimization", "status": "pending", "priority": "low"},
      {"id": "9", "content": "Documentation", "status": "pending", "priority": "low"}
    ]}
  ```

  ⚠️ CRITICAL: Claude Code's Task tool does the ACTUAL work!
  - MCP tools = Coordination setup only
  - Task tool = Spawns agents that execute real work
  - ALL agents MUST be spawned in ONE message
  - ALL todos MUST be batched in ONE TodoWrite call

  2️⃣ **TASK COORDINATION** - Batch ALL assignments:
  ```javascript
  [Single Message]:
    // Assign all tasks
    mcp__claude-flow__task_assign {"taskId": "research-1", "agentId": "researcher-1"}
    mcp__claude-flow__task_assign {"taskId": "design-1", "agentId": "architect-1"}
    mcp__claude-flow__task_assign {"taskId": "code-1", "agentId": "coder-1"}
    mcp__claude-flow__task_assign {"taskId": "code-2", "agentId": "coder-2"}

    // Communicate to all agents
    mcp__claude-flow__agent_communicate {"to": "all", "message": "Begin phase 1"}

    // Update multiple task statuses
    mcp__claude-flow__task_update {"taskId": "research-1", "status": "in_progress"}
    mcp__claude-flow__task_update {"taskId": "design-1", "status": "pending"}
  ```

  3️⃣ **MEMORY COORDINATION** - Store/retrieve in batches:
  ```javascript
  [Single Message]:
    // Store multiple findings
    mcp__claude-flow__memory_store {"key": "research/requirements", "value": {...}}
    mcp__claude-flow__memory_store {"key": "research/constraints", "value": {...}}
    mcp__claude-flow__memory_store {"key": "architecture/decisions", "value": {...}}

    // Retrieve related data
    mcp__claude-flow__memory_retrieve {"key": "research/*"}
    mcp__claude-flow__memory_search {"pattern": "architecture"}
  ```

  4️⃣ **FILE & CODE OPERATIONS** - Parallel execution:
  ```javascript
  [Single Message]:
    // Read multiple files
    Read {"file_path": "/src/index.js"}
    Read {"file_path": "/src/config.js"}
    Read {"file_path": "/package.json"}

    // Write multiple files
    Write {"file_path": "/src/api/auth.js", "content": "..."}
    Write {"file_path": "/src/api/users.js", "content": "..."}
    Write {"file_path": "/tests/auth.test.js", "content": "..."}

    // Update memory with results
    mcp__claude-flow__memory_store {"key": "code/api/auth", "value": "implemented"}
    mcp__claude-flow__memory_store {"key": "code/api/users", "value": "implemented"}
  ```

  5️⃣ **MONITORING & STATUS** - Combined checks:
  ```javascript
  [Single Message]:
    mcp__claude-flow__swarm_monitor {}
    mcp__claude-flow__swarm_status {}
    mcp__claude-flow__agent_list {"status": "active"}
    mcp__claude-flow__task_status {"includeCompleted": false}
    TodoRead {}
  ```

  ❌ NEVER DO THIS (Sequential = SLOW):
  ```
  Message 1: mcp__claude-flow__agent_spawn
  Message 2: mcp__claude-flow__agent_spawn
  Message 3: TodoWrite (one todo)
  Message 4: Read file
  Message 5: mcp__claude-flow__memory_store
  ```

  ✅ ALWAYS DO THIS (Batch = FAST):
  ```
  Message 1: [All operations in one message]
  ```

  💡 BATCHTOOL BEST PRACTICES:
  - Group by operation type (all spawns, all reads, all writes)
  - Use TodoWrite with 5-10 todos at once
  - Combine file operations when analyzing codebases
  - Store multiple memory items per message
  - Never send more than one message for related operations

  🤖 AUTO STRATEGY - INTELLIGENT TASK ANALYSIS:
  The swarm will analyze "build me a REST API" and automatically determine the best approach.

  ANALYSIS APPROACH:
  1. Task Decomposition: Break down the objective into subtasks
  2. Skill Matching: Identify required capabilities and expertise
  3. Agent Selection: Spawn appropriate agent types based on needs
  4. Workflow Design: Create optimal execution flow

  MCP TOOL PATTERN:
  - Start with memory_store to save the objective analysis
  - Use task_create to build a hierarchical task structure
  - Spawn agents with agent_spawn based on detected requirements
  - Monitor with swarm_monitor and adjust strategy as needed

  🎯 CENTRALIZED MODE - SINGLE COORDINATOR:
  All decisions flow through one coordinator agent.

  COORDINATION PATTERN:
  - Spawn a single COORDINATOR as the first agent
  - All other agents report to the coordinator
  - Coordinator assigns tasks and monitors progress
  - Use agent_assign for task delegation
  - Use swarm_monitor for oversight

  BENEFITS:
  - Clear chain of command
  - Consistent decision making
  - Simple communication flow
  - Easy progress tracking

  BEST FOR:
  - Small to medium projects
  - Well-defined objectives
  - Clear task dependencies


  🤖 RECOMMENDED AGENT COMPOSITION (Auto-detected):
  ⚡ SPAWN ALL AGENTS IN ONE BATCH - Copy this entire block:

  ```
  [BatchTool - Single Message]:
    mcp__claude-flow__agent_spawn {"type": "coordinator", "name": "SwarmLead"}
    mcp__claude-flow__agent_spawn {"type": "researcher", "name": "RequirementsAnalyst"}
    mcp__claude-flow__agent_spawn {"type": "architect", "name": "SystemDesigner"}
    mcp__claude-flow__memory_store {"key": "swarm/objective", "value": "build me a REST API"}
    mcp__claude-flow__task_create {"name": "Analyze Requirements", "assignTo": "RequirementsAnalyst"}
    mcp__claude-flow__task_create {"name": "Design Architecture", "assignTo": "SystemDesigner", "dependsOn": ["Analyze Requirements"]}
    TodoWrite {"todos": [
      {"id": "1", "content": "Initialize swarm coordination", "status": "completed", "priority": "high"},
      {"id": "2", "content": "Analyze objective requirements", "status": "in_progress", "priority": "high"},
      {"id": "3", "content": "Design system architecture", "status": "pending", "priority": "high"},
      {"id": "4", "content": "Spawn additional agents as needed", "status": "pending", "priority": "medium"}
    ]}
  ```

  📋 MANDATORY PARALLEL WORKFLOW:

  1. **INITIAL SPAWN (Single BatchTool Message):**
     - Spawn ALL agents at once
     - Create ALL initial todos at once
     - Store initial memory state
     - Create task hierarchy

     Example:
     ```
     [BatchTool]:
       mcp__claude-flow__agent_spawn (coordinator)
       mcp__claude-flow__agent_spawn (architect)
       mcp__claude-flow__agent_spawn (coder-1)
       mcp__claude-flow__agent_spawn (coder-2)
       mcp__claude-flow__agent_spawn (tester)
       mcp__claude-flow__memory_store { key: "init", value: {...} }
       mcp__claude-flow__task_create { name: "Main", subtasks: [...] }
       TodoWrite { todos: [5-10 todos at once] }
     ```

  2. **TASK EXECUTION (Parallel Batches):**
     - Assign multiple tasks in one batch
     - Update multiple statuses together
     - Store multiple results simultaneously

  3. **MONITORING (Combined Operations):**
     - Check all agent statuses together
     - Retrieve multiple memory items
     - Update all progress markers

  🔧 AVAILABLE MCP TOOLS FOR SWARM COORDINATION:

  📊 MONITORING & STATUS:
  - mcp__claude-flow__swarm_status - Check current swarm status and agent activity
  - mcp__claude-flow__swarm_monitor - Real-time monitoring of swarm execution
  - mcp__claude-flow__agent_list - List all active agents and their capabilities
  - mcp__claude-flow__task_status - Check task progress and dependencies

  🧠 MEMORY & KNOWLEDGE:
  - mcp__claude-flow__memory_store - Store knowledge in swarm collective memory
  - mcp__claude-flow__memory_retrieve - Retrieve shared knowledge from memory
  - mcp__claude-flow__memory_search - Search collective memory by pattern
  - mcp__claude-flow__memory_sync - Synchronize memory across agents

  🤖 AGENT MANAGEMENT:
  - mcp__claude-flow__agent_spawn - Spawn specialized agents for tasks
  - mcp__claude-flow__agent_assign - Assign tasks to specific agents
  - mcp__claude-flow__agent_communicate - Send messages between agents
  - mcp__claude-flow__agent_coordinate - Coordinate agent activities

  📋 TASK ORCHESTRATION:
  - mcp__claude-flow__task_create - Create new tasks with dependencies
  - mcp__claude-flow__task_assign - Assign tasks to agents
  - mcp__claude-flow__task_update - Update task status and progress
  - mcp__claude-flow__task_complete - Mark tasks as complete with results

  🎛️ COORDINATION MODES:
  1. CENTRALIZED (default): Single coordinator manages all agents
     - Use when: Clear hierarchy needed, simple workflows
     - Tools: agent_assign, task_create, swarm_monitor

  2. DISTRIBUTED: Multiple coordinators share responsibility
     - Use when: Large scale tasks, fault tolerance needed
     - Tools: agent_coordinate, memory_sync, task_update

  3. HIERARCHICAL: Tree structure with team leads
     - Use when: Complex projects with sub-teams
     - Tools: agent_spawn (with parent), task_create (with subtasks)

  4. MESH: Peer-to-peer agent coordination
     - Use when: Maximum flexibility, self-organizing teams
     - Tools: agent_communicate, memory_store/retrieve

  ⚡ EXECUTION WORKFLOW - ALWAYS USE BATCHTOOL:

  1. SPARC METHODOLOGY WITH PARALLEL EXECUTION:

     S - Specification Phase (Single BatchTool):
     ```
     [BatchTool]:
       mcp__claude-flow__memory_store { key: "specs/requirements", value: {...} }
       mcp__claude-flow__task_create { name: "Requirement 1" }
       mcp__claude-flow__task_create { name: "Requirement 2" }
       mcp__claude-flow__task_create { name: "Requirement 3" }
       mcp__claude-flow__agent_spawn { type: "researcher", name: "SpecAnalyst" }
     ```

     P - Pseudocode Phase (Single BatchTool):
     ```
     [BatchTool]:
       mcp__claude-flow__memory_store { key: "pseudocode/main", value: {...} }
       mcp__claude-flow__task_create { name: "Design API" }
       mcp__claude-flow__task_create { name: "Design Data Model" }
       mcp__claude-flow__agent_communicate { to: "all", message: "Review design" }
     ```

     A - Architecture Phase (Single BatchTool):
     ```
     [BatchTool]:
       mcp__claude-flow__agent_spawn { type: "architect", name: "LeadArchitect" }
       mcp__claude-flow__memory_store { key: "architecture/decisions", value: {...} }
       mcp__claude-flow__task_create { name: "Backend", subtasks: [...] }
       mcp__claude-flow__task_create { name: "Frontend", subtasks: [...] }
     ```

     R - Refinement Phase (Single BatchTool):
     ```
     [BatchTool]:
       mcp__claude-flow__swarm_monitor {}
       mcp__claude-flow__task_update { taskId: "1", progress: 50 }
       mcp__claude-flow__task_update { taskId: "2", progress: 75 }
       mcp__claude-flow__memory_store { key: "learnings/iteration1", value: {...} }
     ```

     C - Completion Phase (Single BatchTool):
     ```
     [BatchTool]:
       mcp__claude-flow__task_complete { taskId: "1", results: {...} }
       mcp__claude-flow__task_complete { taskId: "2", results: {...} }
       mcp__claude-flow__memory_retrieve { pattern: "**/*" }
       TodoWrite { todos: [{content: "Final review", status: "completed"}] }
     ```


  🤝 AGENT TYPES & THEIR MCP TOOL USAGE:

  COORDINATOR:
  - Primary tools: swarm_monitor, agent_assign, task_create
  - Monitors overall progress and assigns work
  - Uses memory_store for decisions and memory_retrieve for context

  RESEARCHER:
  - Primary tools: memory_search, memory_store
  - Gathers information and stores findings
  - Uses agent_communicate to share discoveries

  CODER:
  - Primary tools: task_update, memory_retrieve, memory_store
  - Implements solutions and updates progress
  - Retrieves specs from memory, stores code artifacts

  ANALYST:
  - Primary tools: memory_search, swarm_monitor
  - Analyzes data and patterns
  - Stores insights and recommendations

  TESTER:
  - Primary tools: task_status, agent_communicate
  - Validates implementations
  - Reports issues via task_update

  📝 EXAMPLE MCP TOOL USAGE PATTERNS:

  1. Starting a swarm:
     mcp__claude-flow__agent_spawn {"type": "coordinator", "name": "SwarmLead"}
     mcp__claude-flow__memory_store {"key": "objective", "value": "build me a REST API"}
     mcp__claude-flow__task_create {"name": "Main Objective", "type": "parent"}

  2. Spawning worker agents:
     mcp__claude-flow__agent_spawn {"type": "researcher", "capabilities": ["web-search"]}
     mcp__claude-flow__agent_spawn {"type": "coder", "capabilities": ["python", "testing"]}
     mcp__claude-flow__task_assign {"taskId": "task-123", "agentId": "agent-456"}

  3. Coordinating work:
     mcp__claude-flow__agent_communicate {"to": "agent-123", "message": "Begin phase 2"}
     mcp__claude-flow__memory_store {"key": "phase1/results", "value": {...}}
     mcp__claude-flow__task_update {"taskId": "task-123", "progress": 75}

  4. Monitoring progress:
     mcp__claude-flow__swarm_monitor {}
     mcp__claude-flow__task_status {"includeCompleted": true}
     mcp__claude-flow__agent_list {"status": "active"}

  💾 MEMORY PATTERNS:

  Use hierarchical keys for organization:
  - "specs/requirements" - Store specifications
  - "architecture/decisions" - Architecture choices
  - "code/modules/[name]" - Code artifacts
  - "tests/results/[id]" - Test outcomes
  - "docs/api/[endpoint]" - Documentation

  🚀 BEGIN SWARM EXECUTION:

  Start by spawning a coordinator agent and creating the initial task structure. Use the MCP tools to orchestrate the swarm, coordinate agents, and track progress. Remember to store
  important decisions and artifacts in collective memory for other agents to access.

  The swarm should be self-documenting - use memory_store to save all important information, decisions, and results throughout the execution.