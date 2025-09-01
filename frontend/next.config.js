/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for GitHub Pages deployment
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages serves from a subdirectory, so we need to set the base path
  basePath: '/Explain-Dis',
  assetPrefix: '/Explain-Dis/',
}

module.exports = nextConfig
