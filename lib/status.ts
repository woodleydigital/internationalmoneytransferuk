/**
 * Pipeline status: what each automated import last did, read from the records
 * it wrote. Describes our own process, never a provider.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDERS } from "./providers";
import { isFresh } from "./company-records";

interface Raw {
  slug: string;
  fetchedAt?: string;
  status?: string;
}

function readDir(dir: string): Map<string, Raw> {
  const path = join(process.cwd(), "data", dir);
  const out = new Map<string, Raw>();
  if (!existsSync(path)) return out;
  for (const f of readdirSync(path).filter((x) => x.endsWith(".json"))) {
    try {
      const r = JSON.parse(readFileSync(join(path, f), "utf8")) as Raw;
      out.set(r.slug ?? f.replace(/\.json$/, ""), r);
    } catch {
      // An unreadable file counts as no record.
    }
  }
  return out;
}

function readLogos(): Map<string, Raw> {
  const f = join(process.cwd(), "data", "logos.json");
  const out = new Map<string, Raw>();
  if (!existsSync(f)) return out;
  const idx = JSON.parse(readFileSync(f, "utf8")) as Record<string, { file: string; fetchedAt: string }>;
  for (const [slug, r] of Object.entries(idx)) {
    if (existsSync(join(process.cwd(), "public", r.file))) out.set(slug, { slug, fetchedAt: r.fetchedAt, status: "saved" });
  }
  return out;
}

/** Outcome labels in plain English, describing our import rather than the provider. */
export const OUTCOME: Record<string, string> = {
  matched: "Company identified",
  unmatched: "No certain match",
  found: "Found",
  none: "Nothing found",
  blocked: "Site did not allow access",
  error: "Could not be read",
  saved: "Logo saved",
  listed: "In published data",
  "not-listed": "No exact match in published data",
  "no-company": "No company identified",
  "saved-extras": "Collected",
};

export interface Pipeline {
  key: "companies-house" | "extras" | "disclosures" | "services" | "fos" | "logos";
  name: string;
  what: string;
  lastRun?: string;
  counts: [string, number][];
  stale: number;
  records: Map<string, Raw>;
}

const latest = (rs: Raw[]) => rs.map((r) => r.fetchedAt).filter((d): d is string => Boolean(d)).sort().pop();

function count(rs: Raw[]): [string, number][] {
  const m = new Map<string, number>();
  for (const r of rs) m.set(r.status ?? "error", (m.get(r.status ?? "error") ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export function pipelines(now = new Date()): Pipeline[] {
  const ch = readDir("companies-house");
  const ds = readDir("disclosures");
  const sv = readDir("services");
  const fo = readDir("fos");
  const ex = readDir("company-extras");
  for (const r of ex.values()) r.status = "saved-extras";
  const lg = readLogos();
  const make = (key: Pipeline["key"], name: string, what: string, records: Map<string, Raw>): Pipeline => {
    const rs = [...records.values()];
    return {
      key,
      name,
      what,
      lastRun: latest(rs),
      counts: count(rs),
      stale: rs.filter((r) => r.fetchedAt && !isFresh(r.fetchedAt, now)).length,
      records,
    };
  };
  return [
    make("companies-house", "Companies House records", "Looks up the company behind each provider and copies its public record.", ch),
    make("extras", "Ownership, accounts and filings", "Follows each matched company's corporate owners, filing history, charges and machine-readable accounts at Companies House.", ex),
    make("disclosures", "Provider statements", "Reads each provider’s own website for what it says about its regulation, quoted word for word.", ds),
    make("services", "Service details", "Reads each provider’s own website for what it says about countries, payout methods, speed, fees, limits and safeguarding, quoted word for word.", sv),
    make("fos", "Ombudsman complaints", "Matches each provider’s registered company to the Financial Ombudsman Service’s half-yearly complaints data.", fo),
    make("logos", "Provider logos", "Saves the icon each provider publishes on its own website.", lg),
  ];
}

/** The next weekly run: Mondays at 05:17 UTC, as scheduled in the import workflow. */
export function nextRun(now = new Date()): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 17));
  const days = (1 - d.getUTCDay() + 7) % 7;
  d.setUTCDate(d.getUTCDate() + days);
  if (d <= now) d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

export const providerCount = () => PROVIDERS.length;
