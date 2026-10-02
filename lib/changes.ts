/**
 * Profile change log: what changed in our public-record data for a provider
 * from one weekly import to the next. Built by comparing each record with its
 * previous version, by plain code. Values are copied, never described.
 *
 * Only authoritative registers are logged. Website wording is not: it varies
 * with how a page renders from run to run, which would fill the log with noise.
 */

export interface Change {
  date: string;
  source: "Companies House" | "Financial Ombudsman Service";
  field: string;
  from?: string;
  to?: string;
}

type Json = Record<string, any>;

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Changes between two versions of a provider's records. `before` may be missing (first import). */
export function diffRecords(kind: "companies-house" | "fos", before: Json | null, after: Json | null, date: string): Change[] {
  if (!before || !after) return [];
  const out: Change[] = [];
  if (kind === "companies-house") {
    const a = before.status === "matched" ? before.company : null;
    const b = after.status === "matched" ? after.company : null;
    // Only compare the same company: a re-match is our process, not a change at the company.
    if (!a || !b || a.number !== b.number) return [];
    const fields: [string, string][] = [
      ["name", "Registered name"],
      ["status", "Company status"],
      ["registeredOffice", "Registered office"],
      ["lastAccountsMadeUpTo", "Latest accounts made up to"],
      ["accountsNextDue", "Next accounts due"],
    ];
    for (const [k, label] of fields) {
      if (!same(a[k], b[k])) out.push({ date, source: "Companies House", field: label, from: a[k] ?? "—", to: b[k] ?? "—" });
    }
  }
  if (kind === "fos") {
    const latest = (r: Json) => r.periods?.[0];
    const a = latest(before), b = latest(after);
    if (a && b && a.period?.label !== b.period?.label && b.figures) {
      out.push({ date, source: "Financial Ombudsman Service", field: `Complaints data published for ${b.period.label}` });
    }
  }
  return out;
}
