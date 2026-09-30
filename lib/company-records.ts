/**
 * Reads the Companies House records written by scripts/import-companies-house.ts.
 * A record is shown only if it is a confirmed match fetched within MAX_AGE_DAYS:
 * if the import stops running, the data disappears rather than going stale.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CompanyRecord } from "./companies-house";

export const MAX_AGE_DAYS = 14;

export function isFresh(fetchedAt: string, now = new Date()): boolean {
  const age = now.getTime() - new Date(fetchedAt).getTime();
  return age >= 0 && age <= MAX_AGE_DAYS * 86_400_000;
}

export function loadCompanyRecord(slug: string, now = new Date()): CompanyRecord | null {
  const file = join(process.cwd(), "data", "companies-house", `${slug}.json`);
  if (!existsSync(file)) return null;
  try {
    const rec = JSON.parse(readFileSync(file, "utf8")) as CompanyRecord;
    return rec.status === "matched" && rec.company && isFresh(rec.fetchedAt, now) ? rec : null;
  } catch {
    return null;
  }
}
