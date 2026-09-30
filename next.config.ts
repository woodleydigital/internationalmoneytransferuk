import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Route shape from CLAUDE.md: /providers/{slug}/, /compare/, etc.
  trailingSlash: true,
};

export default nextConfig;
