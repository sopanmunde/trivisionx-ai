import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // output: "standalone", // Uncomment to enable standalone mode for Docker
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

