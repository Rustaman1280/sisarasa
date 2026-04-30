import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/wilayah/:path*',
        destination: 'https://wilayah.id/api/:path*',
      },
    ];
  },
};

export default nextConfig;
