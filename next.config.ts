import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.SERVER_URL || 'http://localhost:5001/api'}/:path*`,
      },
      {
        source: '/auth/:path*', // Also catch /auth if used directly, though api is preferred
        destination: `${process.env.SERVER_URL || 'http://localhost:5001/api'}/auth/:path*`,
      }
    ];
  },
};

export default nextConfig;
