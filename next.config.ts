import type { NextConfig } from "next";
import path from "node:path";

// On GitHub Pages the site lives under /bernardo-portfolio and is served as static files.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  // This app lives inside another project's folder; keep Turbopack rooted here.
  turbopack: { root: path.resolve(__dirname) },
  ...(process.env.STATIC_EXPORT ? { output: "export", basePath, trailingSlash: true } : {}),
};

export default nextConfig;
