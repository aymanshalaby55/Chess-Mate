import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://assets.example.com/account123/**')],
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Only run this on client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
