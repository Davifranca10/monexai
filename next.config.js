const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../'),
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { 
    unoptimized: true 
  },
};

module.exports = nextConfig;