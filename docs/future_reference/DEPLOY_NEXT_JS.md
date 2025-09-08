# Next.js Standalone Deployment Guide

This document explains how the Vibe Remote workstation deploys the built-in Next.js web application using modern 2025 best practices.

## Overview

The Vibe Remote workstation includes a built-in Next.js web application that provides a web interface for the development environment. This app is deployed using Next.js standalone mode for optimal Docker containerization.

## Architecture

### Directory Structure

```
/workspace/
├── credentials/     # Authentication & configs (persistent volume)
├── project/         # User's cloned project (persistent volume)
├── data/           # Vibe-Kanban data (persistent volume)
└── vibe-web/       # Built-in web app (from Docker image)
    ├── apps/web/server.js         # Next.js standalone server
    ├── apps/web/.next/static/     # Static assets
    ├── apps/web/public/           # Public files
    ├── node_modules/              # Minimal runtime dependencies
    └── package.json               # Standalone package manifest
```

### Separation of Concerns

- **`/workspace/project/`** - Reserved for user's development projects
- **`/workspace/vibe-web/`** - Built-in web application (not user-modifiable)
- **Persistent volumes** - Only credentials, project, and data are persistent
- **Web app isolation** - Built-in app is rebuilt with each container update

## Next.js Configuration

### Standalone Mode Setup

**File: `apps/web/next.config.ts`**
```typescript
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    // Only use standalone output for production builds
    ...(process.env.NODE_ENV === 'production' && {
        output: 'standalone',
        outputFileTracingRoot: path.join(__dirname, '../../'),
    })
};

export default nextConfig;
```

### Key Features

- **Conditional standalone mode** - Only activates for production builds
- **Development unchanged** - `pnpm run dev` works normally
- **Monorepo support** - `outputFileTracingRoot` handles workspace dependencies
- **Minimal dependencies** - Only includes required runtime modules

## Docker Build Process

### Multi-Stage Build

#### Stage 1: Builder
```dockerfile
# Build stage
FROM ubuntu:22.04 AS builder

# Install Node.js and pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm@10.15.0

# Copy source and build
WORKDIR /build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY apps/ ./apps/
COPY config/ ./config/
COPY tsconfig.json eslint.config.mjs ./

# Build everything including Next.js standalone
RUN pnpm install --frozen-lockfile && \
    pnpm run build && \
    cd apps/web && \
    pnpm run build
```

#### Stage 2: Production
```dockerfile
# Copy Next.js standalone app (includes full monorepo structure)  
COPY --from=builder /build/apps/web/.next/standalone/ /workspace/vibe-web/
# Copy static files relative to server.js location
COPY --from=builder /build/apps/web/.next/static/ /workspace/vibe-web/apps/web/.next/static/
# Copy public files relative to server.js location  
COPY --from=builder /build/apps/web/public/ /workspace/vibe-web/apps/web/public/
```

### Build Output Structure

When Next.js builds in standalone mode, it creates:

```
apps/web/.next/
├── standalone/
│   ├── apps/web/server.js    # Main server file
│   ├── apps/web/.next/       # Next.js runtime
│   ├── node_modules/         # Minimal dependencies
│   └── package.json          # Runtime manifest
├── static/                   # Static assets (CSS, JS)
└── cache/                    # Build cache (not copied)
```

## Runtime Configuration

### Supervisor Process

**File: `supervisor/supervisord.conf`**
```ini
[program:vibe-remote-web]
command=node apps/web/server.js
directory=/workspace/vibe-web
autostart=true
autorestart=true
user=developer
environment=HOST=0.0.0.0,PORT=8080,NODE_ENV="production"
```

### Key Runtime Details

- **Working directory** - `/workspace/vibe-web` (where standalone root is copied)
- **Command** - `node apps/web/server.js` (relative to working directory)
- **Static files** - Served automatically by Next.js server from `.next/static/`
- **Public files** - Served from `public/` directory
- **Port** - 8080 (mapped to external port via Docker)

## Benefits of This Approach

### 2025 Best Practices

1. **Smaller Images** - ~100MB vs 500MB+ with full node_modules
2. **Faster Startup** - No npm install required at runtime
3. **Security** - No source code or dev dependencies in production
4. **Cloud Ready** - Works with Kubernetes, Docker Swarm, serverless

### Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| **Command** | `pnpm run dev` | `node server.js` |
| **Hot Reload** | ✅ Yes | ❌ No |
| **Source Maps** | ✅ Yes | ❌ No (unless configured) |
| **File Size** | Large (dev deps) | Small (runtime only) |
| **Startup Time** | Slower | Faster |

## Troubleshooting

### Common Issues

**Server not found:**
```bash
Error: Cannot find module '/workspace/vibe-web/server.js'
```
- Check that standalone build completed successfully
- Verify COPY commands in Dockerfile copied to correct locations

**Static files not loading:**
```
404 errors for CSS/JS files
```
- Ensure static files copied to `apps/web/.next/static/`
- Check that path is relative to `server.js` location

**Module not found errors:**
```bash
Error: Cannot find module 'some-dependency'
```
- Verify `outputFileTracingRoot` is set correctly for monorepo
- Check that all dependencies are properly traced

### Debugging Commands

```bash
# Check standalone structure
docker run -it --entrypoint /bin/bash your-image
cd /workspace/vibe-web
ls -la apps/web/

# Verify static files
ls -la apps/web/.next/static/

# Test server manually
cd /workspace/vibe-web
node apps/web/server.js
```

## Development Workflow

### Local Development

```bash
# Run in development mode (unchanged)
pnpm run dev

# Test production build locally
pnpm run build:web
cd apps/web
pnpm run start
```

### Container Testing

```bash
# Build with no cache
pnpm run docker:push:no-cache

# Test container locally
docker run -p 8080:8080 jjdenhertog/viberemote:latest
```

## References

- [Next.js Standalone Output Documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
- [Docker Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Docker Deployment Guide](https://nextjs.org/docs/deployment#docker-image)