import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  compress: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "clsx", "tailwind-merge"],
  },
};

export default nextConfig;

