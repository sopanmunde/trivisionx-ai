import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {

  },
  output: "standalone", // Uncomment to enable standalone mode for Docker
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

