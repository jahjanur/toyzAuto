import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a second build live beside the main one (e.g. NEXT_DIST_DIR=.next-preview) without touching it.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: ["better-sqlite3"],
  // Hosts that build in "standalone" mode (e.g. Hostinger) must ship the SQL migrations, which are read from disk at startup.
  outputFileTracingIncludes: { "/**": ["./drizzle/**/*"] },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    remotePatterns: [{ protocol: "https", hostname: "toyzautoart.com" }],
  },
  experimental: {
    // Next 16.2 (pinned because 16.3+ needs glibc 2.30, newer than Hostinger's servers) still flags root params.
    rootParams: true,
    serverActions: { bodySizeLimit: "200mb" },
  },
  async rewrites() {
    // English lives at the root: /inventory is served by app/[locale] with locale "en", while the address stays /inventory.
    // This is done here, not in src/proxy.ts: behind some hosts (standalone builds, e.g. Hostinger) a proxy rewrite is
    // treated as an external URL and loops. "afterFiles" runs after public files but before dynamic routes.
    return {
      beforeFiles: [],
      afterFiles: [
        { source: "/", destination: "/en" },
        { source: "/:path((?!(?:fr|en|admin)(?:/|$)|api/|uploads/|_next/).+)", destination: "/en/:path" },
      ],
      fallback: [],
    };
  },
  async redirects() {
    // The Wheels page was removed; send old links to the Wheels & Tires service.
    return [
      { source: "/wheels", destination: "/services/wheels-and-tires", permanent: false },
      { source: "/fr/wheels", destination: "/fr/services/wheels-and-tires", permanent: false },
    ];
  },
};

export default nextConfig;
