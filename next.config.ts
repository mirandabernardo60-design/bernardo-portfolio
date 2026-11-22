import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

// On GitHub Pages the site lives under /bernardo-portfolio and is served as static files.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

// Song covers live in public/music/art on the local machine only (gitignored), like the MP3s.
const localArt = fs.existsSync(path.resolve(__dirname, "public/music/art/song-01.jpg"));

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_LOCAL_ART: localArt ? "1" : "" },
  // This app lives inside another project's folder; keep Turbopack rooted here.
  turbopack: { root: path.resolve(__dirname) },
  ...(process.env.STATIC_EXPORT ? { output: "export", basePath, trailingSlash: true } : {}),
};

export default nextConfig;
