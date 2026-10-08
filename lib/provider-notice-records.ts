import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isFresh } from "./company-records";
import { NOTICE_SOURCES, extractProviderNotices, type ProviderNotice } from "./provider-notices";

export function loadProviderNotice(slug: string): ProviderNotice | null {
  const source = NOTICE_SOURCES.find((s) => s.slug === slug);
  const file = join(process.cwd(), "data", "notices", `${slug}.json`);
  if (!source || !existsSync(file)) return null;
  try {
    const rec = JSON.parse(readFileSync(file, "utf8")) as ProviderNotice;
    if (rec.slug !== slug || rec.url !== source.url || !isFresh(rec.fetchedAt)) return null;
    const quotations = extractProviderNotices(rec.quotations.join("\n"), source.name);
    return quotations.length ? { ...rec, publisher: source.publisher, quotations } : null;
  } catch { return null; }
}
