import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admins can paste any cover image URL, so allow any HTTPS host.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
