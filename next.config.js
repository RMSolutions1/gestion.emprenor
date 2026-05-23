const path = require('path');

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  productionBrowserSourceMaps: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.filename = 'static/chunks/[name]-[contenthash:8].js';
      config.output.chunkFilename = 'static/chunks/[contenthash:16].js';
    }
    return config;
  },
};

module.exports = nextConfig;
