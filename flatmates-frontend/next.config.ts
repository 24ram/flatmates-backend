import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Tell Next.js this is the workspace root — fixes multi-lockfile confusion
  outputFileTracingRoot: path.join(__dirname, "../"),
};

export default nextConfig;
