/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/birthday-present',
  images: {
    unoptimized: true,
  },
  trailingSlash: true, // Добавь эту строку!
};

module.exports = nextConfig;