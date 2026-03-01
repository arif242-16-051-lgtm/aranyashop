import type { NextConfig } from "next";

/**
 * Dev proxy: rewrites /api/* → http://localhost:8080/api/*
 *
 * In LOCAL DEV: Next.js rewrites handle the proxy so browser code can call
 *   fetch("/api/health") without CORS issues.
 *
 * In PRODUCTION (Nginx): Nginx routes /api/* directly to the Spring Boot
 *   backend and serves the Next.js static build for everything else.
 *   These rewrites are never reached in production because Nginx intercepts
 *   /api/* first — so frontend code stays the same in both environments.
 */
const nextConfig: NextConfig = {
  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
