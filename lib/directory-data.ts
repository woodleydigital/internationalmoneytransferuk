/** Server-side loader: every provider joined with its fresh public-record data. */
import { PROVIDERS } from "./providers";
import { loadCompanyRecord } from "./company-records";
import { loadDisclosure } from "./disclosure-records";
import { loadServiceRecord } from "./service-records";
import { makeEntry, type Entry } from "./directory";

export function loadEntries(now = new Date()): Entry[] {
  return PROVIDERS.map((p) => makeEntry(p, loadCompanyRecord(p.slug, now), loadDisclosure(p.slug, now), loadServiceRecord(p.slug, now)));
}

export function loadEntry(slug: string, now = new Date()): Entry | null {
  return loadEntries(now).find((e) => e.provider.slug === slug) ?? null;
}
