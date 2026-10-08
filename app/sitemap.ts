import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { isIndexable, providerUrl } from "@/lib/providers";
import { loadEntries } from "@/lib/directory-data";
import { isIndexableEntry } from "@/lib/directory";

// Re-read daily so new and refreshed profiles appear with their record dates.
export const revalidate = 86_400;

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
    "/glossary/",
    "/status/",
  ];
  const profiles = loadEntries()
    .filter((e) => isIndexable(e.provider) || isIndexableEntry(e))
    // A fetch time does not establish a substantive page modification.
    .map((e) => ({ url: `${SITE.url}${providerUrl(e.provider)}` }));
  return [...pages.map((path) => ({ url: `${SITE.url}${path}` })), ...profiles];
}
