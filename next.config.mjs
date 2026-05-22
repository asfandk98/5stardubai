/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '5stardubai.com',
      },
    ],
  },
  output: 'standalone',
  reactCompiler: true,
};

export default nextConfig;
