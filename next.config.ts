const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  reactCompiler: true,
  turbopack: {}, // Silence Turbopack/Webpack conflict error
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.SERVER_URL || "http://localhost:5001/api"}/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${process.env.SERVER_URL || "http://localhost:5001/api"}/auth/:path*`,
      }
    ];
  },
};

export default withPWA(nextConfig);
