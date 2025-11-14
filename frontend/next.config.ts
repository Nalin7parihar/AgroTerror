import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    resolveAlias: {
      // Add any alias configurations if needed
    },
  },
  // Transpile Three.js packages for compatibility
  transpilePackages: ['@react-three/fiber', '@react-three/drei'],
  // Experimental features for better Three.js support
  experimental: {
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei', 'three'],
  },
};

export default nextConfig;
