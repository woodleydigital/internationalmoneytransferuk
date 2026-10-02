/** Reads Ombudsman complaint records written by scripts/import-fos.ts; fresh ones only. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { FosRecord } from "./fos";
import { isFresh } from "./company-records";

export function loadFosRecord(slug: string, now = new Date()): FosRecord | null {
  const file = join(process.cwd(), "data", "fos", `${slug}.json`);
  if (!existsSync(file)) return null;
  try {
    const rec = JSON.parse(readFileSync(file, "utf8")) as FosRecord;
    return rec.status !== "no-company" && rec.periods.length && isFresh(rec.fetchedAt, now) ? rec : null;
  } catch {
    return null;
  }
}
