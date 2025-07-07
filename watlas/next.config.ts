import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'static.wikia.nocookie.net',
      'encrypted-tbn0.gstatic.com',
      // ajoute ici les autres domaines de tes images externes
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
