/** Reads provider service quotes written by scripts/import-service-facts.ts; fresh ones only. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { findServiceQuotes, mergeQuotes, type ServiceRecord } from "./service-facts";
import { isFresh } from "./company-records";

export function loadServiceRecord(slug: string, now = new Date()): ServiceRecord | null {
  const file = join(process.cwd(), "data", "services", `${slug}.json`);
  if (!existsSync(file)) return null;
  try {
    const rec = JSON.parse(readFileSync(file, "utf8")) as ServiceRecord;
    if (rec.slug !== slug || rec.status !== "found" || !rec.quotes.length || !isFresh(rec.fetchedAt, now)) return null;
    // Apply today's extraction rules to stored quotes too, without pretending
    // that their source pages have been fetched again.
    const quotes = mergeQuotes([], rec.quotes.flatMap((q) => {
      const url = new URL(q.url);
      if (!/^https?:$/.test(url.protocol)) return [];
      return findServiceQuotes(q.text, q.url).filter((candidate) => candidate.topic === q.topic);
    }));
    return quotes.length ? { ...rec, quotes } : null;
  } catch {
    return null;
  }
}
