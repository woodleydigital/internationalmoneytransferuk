/** Reads provider statements written by scripts/import-disclosures.ts; fresh ones only. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { transferStatements, type DisclosureRecord } from "./disclosures";
import { isFresh } from "./company-records";

export function loadDisclosure(slug: string, now = new Date()): DisclosureRecord | null {
  const file = join(process.cwd(), "data", "disclosures", `${slug}.json`);
  if (!existsSync(file)) return null;
  try {
    const rec = JSON.parse(readFileSync(file, "utf8")) as DisclosureRecord;
    if (rec.slug !== slug || rec.status !== "found" || !isFresh(rec.fetchedAt, now)) return null;
    const statements = transferStatements(rec.statements);
    return statements.length ? { ...rec, statements } : null;
  } catch {
    return null;
  }
}
