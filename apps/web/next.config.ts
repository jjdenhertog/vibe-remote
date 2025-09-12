import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig: NextConfig = {
    // Only use standalone output for production builds
    ...(process.env.NODE_ENV === 'production' && {
        output: 'standalone',
        outputFileTracingRoot: path.join(__dirname, '../../'),
    }),
    
    // Pass through environment variables to the client
    env: {
        NEXT_PUBLIC_VIBE_KANBAN_URL: process.env.NEXT_PUBLIC_VIBE_KANBAN_URL || 'http://localhost:9091',
    },
    
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
    
    // Configure static file serving for Monaco Editor
    async headers() {
        return [
            {
                source: '/monaco-editor/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    }
                ],
            }
        ];
    },
};

export default nextConfig;
