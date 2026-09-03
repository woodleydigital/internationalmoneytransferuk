import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Canonical, indexable URLs only. Parameterised checker results are noindex and
// never listed here (build-spec §1.6.4).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, priority: 1 },
    { url: `${SITE.url}/how-we-calculate`, priority: 0.8 },
    { url: `${SITE.url}/about`, priority: 0.6 },
    { url: `${SITE.url}/about/matt-woodley`, priority: 0.5 },
  ];
}
