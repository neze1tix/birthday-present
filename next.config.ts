/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/birthday-present', // ТОЧНОЕ название твоего репозитория!
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;