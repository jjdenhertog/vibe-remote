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
