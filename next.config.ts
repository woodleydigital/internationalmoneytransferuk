import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Route shape from CLAUDE.md: /providers/{slug}/, /compare/, etc.
  trailingSlash: true,
  async redirects() {
    return [
      // The Transfer Tracker relied on human test transfers; the site is fully automated.
      { source: "/tracker/", destination: "/methodology/", permanent: true },
      // Removed from the directory; send visitors to the A–Z list.
      { source: "/providers/small-world/", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
