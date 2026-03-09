/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/birthday-present', // Название вашего репозитория
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;