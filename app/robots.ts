import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// robots.txt controls crawling only; indexing is controlled by meta robots.
// Nothing that is needed to render the page is blocked.
export default function robots(): MetadataRoute.Robots {
  return {
    // Search results call the FCA Register live: crawlers must not trigger look-ups.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/check-a-provider/?"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
