import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // This app lives inside another project's folder; keep Turbopack rooted here.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
