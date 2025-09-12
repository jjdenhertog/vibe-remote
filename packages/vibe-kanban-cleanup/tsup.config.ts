import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points - the main CLI executables
  entry: {
    'vibe-kanban-cleanup': 'src/vibe-kanban-cleanup.ts',
    'vibe-kanban-sync-status': 'src/vibe-kanban-sync-status.ts'
  },
  
  // Output single bundled files (not split)
  splitting: false,
  
  // Include all dependencies in the bundle (important for CLI tools)
  bundle: true,
  
  // Generate source maps for debugging
  sourcemap: true,
  
  // Clean output directory before build
  clean: true,
  
  // Target Node.js environment
  platform: 'node',
  target: 'node20',
  
  // Output format - use ESM for top-level await support
  format: ['esm'],
  
  // Keep the shebang for CLI executables
  shims: true,
  
  // Minify for production
  minify: false, // Keep false for better error stack traces
  
  // Generate TypeScript declarations - disabled for now to avoid project reference issues
  dts: false,
  
  // External packages that should not be bundled (none for CLI tools - we want everything bundled)
  external: [],
  
  // Ensure workspace dependencies are bundled
  noExternal: ['@vibe-remote/vibe-kanban-api', '@vibe-remote/shared-utils', '@vibe-remote/github'],
  
  // Ensure proper file extensions for ESM
  outExtension({ format }) {
    return {
      js: '.mjs',
    };
  },
});