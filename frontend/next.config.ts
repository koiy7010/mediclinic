import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  allowedDevOrigins: ['192.168.0.249'],
};

export default nextConfig;
