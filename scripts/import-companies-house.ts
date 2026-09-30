/**
 * Weekly Companies House import.
 *
 *   COMPANIES_HOUSE_API_KEY=... node --experimental-strip-types scripts/import-companies-house.ts
 *
 * For each provider it finds the company by the strict rule in
 * lib/companies-house.ts, fetches the company profile and persons with
 * significant control, and writes data/companies-house/{slug}.json. A provider
 * that cannot be matched, or whose fetch fails, gets a record with no company
 * data, so its profile shows nothing rather than a guess or an old value.
 *
 * Git history of data/ is the audit trail of every change.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDERS } from "../lib/providers.ts";
import {
  AuthError,
  MATCH_RULE,
  client,
  companySummary,
  minimisePsc,
  nameCandidates,
  pickCompany,
  type CompanyProfile,
  type CompanyRecord,
} from "../lib/companies-house.ts";

const key = process.env.COMPANIES_HOUSE_API_KEY;
if (!key) {
  console.error("COMPANIES_HOUSE_API_KEY is not set.");
  process.exit(1);
}

const OUT = join(process.cwd(), "data", "companies-house");
mkdirSync(OUT, { recursive: true });
const ch = client(key);

// 600 requests per 5 minutes: one request every 0.6 s stays well inside it.
const pause = () => new Promise((r) => setTimeout(r, 600));

const summary: string[] = [];
for (const p of PROVIDERS) {
  const fetchedAt = new Date().toISOString();
  const record: CompanyRecord = {
    slug: p.slug,
    fetchedAt,
    status: "unmatched",
    match: { query: p.name, rule: MATCH_RULE, candidates: [], outcome: "" },
  };
  try {
    const hits = nameCandidates(p.name, await ch.search(p.name));
    await pause();
    record.match.candidates = hits.map((h) => ({ company_number: h.company_number, title: h.title }));

    const profiles: CompanyProfile[] = [];
    for (const h of hits.slice(0, 5)) {
      const prof = await ch.profile(h.company_number);
      await pause();
      if (prof) profiles.push(prof);
    }

    const picked = pickCompany(profiles);
    if (picked.kind === "matched") {
      record.status = "matched";
      record.match.outcome = `Matched ${picked.profile.company_number}`;
      record.company = companySummary(picked.profile);
      record.psc = minimisePsc(await ch.psc(picked.profile.company_number));
      await pause();
    } else if (picked.kind === "ambiguous") {
      record.match.outcome = `Ambiguous: ${picked.numbers.join(", ")}`;
    } else {
      record.match.outcome = hits.length ? "No candidate with a payments SIC code" : "No name match";
    }
  } catch (e) {
    // A rejected key invalidates the run: stop without touching any record.
    if (e instanceof AuthError) {
      console.error(`${e.message} Check the COMPANIES_HOUSE_API_KEY secret. No records were changed.`);
      process.exit(1);
    }
    record.status = "error";
    record.error = e instanceof Error ? e.message : String(e);
    delete record.company;
    delete record.psc;
  }
  writeFileSync(join(OUT, `${p.slug}.json`), JSON.stringify(record, null, 2) + "\n");
  summary.push(`${record.status.padEnd(9)} ${p.slug.padEnd(22)} ${record.match.outcome || record.error}`);
}

console.log(summary.join("\n"));
