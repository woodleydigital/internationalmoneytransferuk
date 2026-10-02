/** Reads provider service quotes written by scripts/import-service-facts.ts; fresh ones only. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ServiceRecord } from "./service-facts";
import { isFresh } from "./company-records";

export function loadServiceRecord(slug: string, now = new Date()): ServiceRecord | null {
  const file = join(process.cwd(), "data", "services", `${slug}.json`);
  if (!existsSync(file)) return null;
  try {
    const rec = JSON.parse(readFileSync(file, "utf8")) as ServiceRecord;
    return rec.status === "found" && rec.quotes.length && isFresh(rec.fetchedAt, now) ? rec : null;
  } catch {
    return null;
  }
}
