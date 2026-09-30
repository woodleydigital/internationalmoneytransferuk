/** Reads provider statements written by scripts/import-disclosures.ts; fresh ones only. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DisclosureRecord } from "./disclosures";
import { isFresh } from "./company-records";

export function loadDisclosure(slug: string, now = new Date()): DisclosureRecord | null {
  const file = join(process.cwd(), "data", "disclosures", `${slug}.json`);
  if (!existsSync(file)) return null;
  try {
    const rec = JSON.parse(readFileSync(file, "utf8")) as DisclosureRecord;
    return rec.status === "found" && rec.statements.length && isFresh(rec.fetchedAt, now) ? rec : null;
  } catch {
    return null;
  }
}
