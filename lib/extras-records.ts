/** Readers for company extras and change logs written by the weekly workflow. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CompanyExtras } from "./company-extras";
import type { Change } from "./changes";
import { isFresh } from "./company-records";

/** Extras for the company we currently hold for this provider, fresh only. */
export function loadCompanyExtras(slug: string, number: string | undefined, now = new Date()): CompanyExtras | null {
  const file = join(process.cwd(), "data", "company-extras", `${slug}.json`);
  if (!number || !existsSync(file)) return null;
  try {
    const rec = JSON.parse(readFileSync(file, "utf8")) as CompanyExtras;
    return rec.number === number && isFresh(rec.fetchedAt, now) ? rec : null;
  } catch {
    return null;
  }
}

export function loadChanges(slug: string): Change[] {
  const file = join(process.cwd(), "data", "changes", `${slug}.json`);
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Change[];
  } catch {
    return [];
  }
}
