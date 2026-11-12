import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a second build live beside the main one (e.g. NEXT_DIST_DIR=.next-preview) without touching it.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["better-sqlite3"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    remotePatterns: [{ protocol: "https", hostname: "toyzautoart.com" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "200mb" },
  },
  async redirects() {
    // The Wheels page was removed; send old links to the Wheels & Tires service.
    return [
      { source: "/wheels", destination: "/services/wheels-and-tires", permanent: false },
      { source: "/fr/wheels", destination: "/fr/services/wheels-and-tires", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        // Preserve .module.css so Next exports its scoped class names.
      },
    },
  },
};

export default nextConfig;
