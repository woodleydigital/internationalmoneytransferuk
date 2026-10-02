import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { PROVIDERS, isIndexable, providerUrl } from "@/lib/providers";

// Canonical, indexable URLs only. Noindex pages (Tier 3 profiles, pages awaiting
// data) and parameterised results are never listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/",
    "/compare/",
    "/compare/providers/",
    "/check-a-provider/",
    "/how-we-calculate/",
    "/methodology/",
    "/how-we-get-paid/",
    "/code-of-ethics/",
    "/corrections/",
    "/about/",
    "/about/matt-woodley/",
    "/for-providers/",
    "/privacy/",
    "/entitymap.html",
  ];
  const profiles = PROVIDERS.filter(isIndexable).map(providerUrl);
  return [...pages, ...profiles].map((path) => ({ url: `${SITE.url}${path}` }));
}
