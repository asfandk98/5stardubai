/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'alainhotel.com',
      },
      {
        protocol: 'https',
        hostname: 'api.alainhotel.com',
      },
    ],
  },

  output: 'standalone',
  reactCompiler: true,
};

export default nextConfig;