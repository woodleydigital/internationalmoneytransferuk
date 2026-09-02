import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// robots.txt controls crawling only; indexing is controlled by meta robots
// (standard §7). Nothing that is needed to render the page is blocked.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
