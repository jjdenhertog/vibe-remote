import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry point - the main CLI executable
  entry: {
    'vibe-kanban-taskpicker': 'src/vibe-kanban-taskpicker.ts'
  },
  
  // Output single bundled file (not split)
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
  noExternal: ['@vibe-remote/vibe-kanban-api', '@vibe-remote/shared-utils'],
  
  // Ensure proper file extensions for ESM
  outExtension({ format }) {
    return {
      js: '.mjs',
    };
  },
});