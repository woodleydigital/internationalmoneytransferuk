/**
 * The directory view of each provider: the provider entry joined with the
 * public-record data we hold for it. Filtering and sorting are pure functions so
 * the server-rendered pages (and tests) share one implementation.
 *
 * Sorting is alphabetical or by a recorded date. There is no ranking, rating or
 * "best" order anywhere in the directory.
 */
import type { CompanyRecord } from "./companies-house";
import type { DisclosureRecord } from "./disclosures";
import type { ServiceRecord } from "./service-facts";
import { PROVIDERS, initialOf, type Provider, type ProviderKind } from "./providers.ts";

export interface Entry {
  provider: Provider;
  company: CompanyRecord | null;
  statement: DisclosureRecord | null;
  /** What the provider says about its service, quoted. */
  service: ServiceRecord | null;
  /** FRNs the provider states on its own site (unverified). */
  statedFrns: string[];
}

export function makeEntry(
  provider: Provider,
  company: CompanyRecord | null,
  statement: DisclosureRecord | null,
  service: ServiceRecord | null = null,
): Entry {
  const statedFrns = [...new Set((statement?.statements ?? []).flatMap((s) => s.frns))];
  return { provider, company, statement, service, statedFrns };
}

/**
 * A profile is indexable when the topical map marks it for indexing and it
 * holds at least two of the three fresh public-record blocks: a Companies
 * House record, the provider's regulatory statement, and what it says about
 * its service. Anything thinner stays noindex until it has more.
 */
export function isIndexableEntry(e: Entry): boolean {
  const blocks = [Boolean(e.company?.company), Boolean(e.statement), Boolean(e.service?.quotes.length)];
  return e.provider.indexWhenVerified && blocks.filter(Boolean).length >= 2;
}

export type Sort = "az" | "za" | "oldest" | "newest";

export interface Filters {
  q: string;
  kinds: ProviderKind[];
  hasCompany: boolean;
  hasStatement: boolean;
  /** Company statuses, in Companies House's own wording (e.g. "active"). */
  statuses: string[];
  sort: Sort;
}

type Params = Record<string, string | string[] | undefined>;
const all = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
const first = (v: string | string[] | undefined) => all(v)[0] ?? "";

const KINDS: ProviderKind[] = ["bank", "transfer", "broker"];
const SORTS: Sort[] = ["az", "za", "oldest", "newest"];

export function parseFilters(params: Params): Filters {
  const sort = first(params.sort) as Sort;
  return {
    q: first(params.q).trim().slice(0, 80),
    kinds: all(params.kind).filter((k): k is ProviderKind => KINDS.includes(k as ProviderKind)),
    hasCompany: first(params.company) === "1",
    hasStatement: first(params.statement) === "1",
    statuses: all(params.status).map((x) => x.toLowerCase().replace(/[^a-z-]/g, "")).filter(Boolean).slice(0, 10),
    sort: SORTS.includes(sort) ? sort : "az",
  };
}

export function isFiltered(f: Filters): boolean {
  return Boolean(f.q || f.kinds.length || f.hasCompany || f.hasStatement || f.statuses.length || f.sort !== "az");
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

/** Match the search box against the brand, its slug and its registered company name. */
function matchesQuery(e: Entry, q: string): boolean {
  if (!q) return true;
  const n = norm(q);
  return [e.provider.name, e.provider.slug, e.company?.company?.name ?? ""].some((s) => norm(s).includes(n));
}

export function applyFilters(entries: Entry[], f: Filters, ignore?: keyof Filters): Entry[] {
  const out = entries.filter(
    (e) =>
      (ignore === "q" || matchesQuery(e, f.q)) &&
      (ignore === "kinds" || !f.kinds.length || f.kinds.includes(e.provider.kind)) &&
      (ignore === "hasCompany" || !f.hasCompany || Boolean(e.company?.company)) &&
      (ignore === "hasStatement" || !f.hasStatement || Boolean(e.statement)) &&
      (ignore === "statuses" || !f.statuses.length || f.statuses.includes(e.company?.company?.status ?? "")),
  );
  const byName = (a: Entry, b: Entry) =>
    a.provider.name.localeCompare(b.provider.name, "en-GB", { sensitivity: "base" });
  const inc = (e: Entry) => e.company?.company?.incorporated ?? "";
  switch (f.sort) {
    case "za":
      return out.sort((a, b) => byName(b, a));
    case "oldest":
    case "newest": {
      // Providers without a recorded incorporation date go last, A–Z.
      const dir = f.sort === "oldest" ? 1 : -1;
      return out.sort((a, b) => {
        const x = inc(a), y = inc(b);
        if (!x || !y) return x ? -1 : y ? 1 : byName(a, b);
        return x === y ? byName(a, b) : x < y ? -dir : dir;
      });
    }
    default:
      return out.sort(byName);
  }
}

/** Counts of each non-empty key, sorted by key. */
function countBy(entries: Entry[], key: (e: Entry) => string | undefined): [string, number][] {
  const m = new Map<string, number>();
  for (const e of entries) {
    const k = key(e);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
}

/** When we last fetched any public record for this provider (ISO), if ever. */
export function checkedAt(e: Entry): string | undefined {
  const d = [e.company?.fetchedAt, e.statement?.fetchedAt, e.service?.fetchedAt].filter((x): x is string => Boolean(x)).sort();
  return d[d.length - 1];
}

/** How many entries each facet option would show, given the other filters. */
export function facetCounts(entries: Entry[], f: Filters) {
  const kindBase = applyFilters(entries, f, "kinds");
  return {
    kinds: Object.fromEntries(KINDS.map((k) => [k, kindBase.filter((e) => e.provider.kind === k).length])) as Record<ProviderKind, number>,
    hasCompany: applyFilters(entries, f, "hasCompany").filter((e) => e.company?.company).length,
    hasStatement: applyFilters(entries, f, "hasStatement").filter((e) => e.statement).length,
    statuses: countBy(applyFilters(entries, f, "statuses"), (e) => e.company?.company?.status),
  };
}

/** Group an A–Z (or Z–A) list under its initial letters, keeping order. */
export function groupByLetter(entries: Entry[]): [string, Entry[]][] {
  const groups = new Map<string, Entry[]>();
  for (const e of entries) {
    const k = initialOf(e.provider.name);
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  return [...groups.entries()];
}

/** Two-letter monogram for a brand, used instead of logos we have no right to show. */
export function monogram(name: string): string {
  const words = name
    .replace(/[^A-Za-z0-9& ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !/^(of|the|and)$/i.test(w));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words[0].slice(0, 2).toUpperCase();
}

export function similar(entries: Entry[], e: Entry, n = 6): Entry[] {
  return entries
    .filter((x) => x.provider.kind === e.provider.kind && x.provider.slug !== e.provider.slug)
    .sort((a, b) => a.provider.name.localeCompare(b.provider.name, "en-GB"))
    .slice(0, n);
}

export function allProviders(): Provider[] {
  return PROVIDERS;
}
