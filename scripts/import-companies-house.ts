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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDERS } from "../lib/providers.ts";
import {
  AuthError,
  MATCH_RULE,
  chooseStatedCompany,
  client,
  companySummary,
  minimisePsc,
  nameCandidates,
  pickCompany,
  type CompanyProfile,
  type CompanyRecord,
} from "../lib/companies-house.ts";
import { statedCompanyNumbers, type DisclosureRecord } from "../lib/disclosures.ts";

function readDisclosure(slug: string): DisclosureRecord | null {
  const f = join(process.cwd(), "data", "disclosures", `${slug}.json`);
  if (!existsSync(f)) return null;
  try {
    return JSON.parse(readFileSync(f, "utf8")) as DisclosureRecord;
  } catch {
    return null;
  }
}

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
    // 1. A company number the provider states on its own website, chosen by
    //    chooseStatedCompany (see lib/companies-house.ts).
    const disclosure = readDisclosure(p.slug);
    const stated = statedCompanyNumbers(disclosure).slice(0, 6);
    if (stated.length) {
      const profiles = new Map<string, CompanyProfile>();
      for (const n of stated) {
        const prof = await ch.profile(n);
        await pause();
        if (prof) profiles.set(n, prof);
      }
      const chosen = chooseStatedCompany(p.name, disclosure!.statements, profiles);
      if (chosen) {
        const prof = chosen.profile;
        record.status = "matched";
        record.match = {
          query: disclosure!.url,
          rule: chosen.rule,
          candidates: [...profiles.values()].map((x) => ({ company_number: x.company_number, title: x.company_name })),
          outcome: `Matched ${prof.company_number} from the provider's website`,
        };
        record.company = companySummary(prof);
        record.psc = minimisePsc(await ch.psc(prof.company_number));
        await pause();
        writeFileSync(join(OUT, `${p.slug}.json`), JSON.stringify(record, null, 2) + "\n");
        summary.push(`${record.status.padEnd(9)} ${p.slug.padEnd(22)} ${record.match.outcome}`);
        continue;
      }
      // The provider's own site names companies but none is clearly its own:
      // that is better evidence than a name coincidence, so do not fall back.
      record.match = {
        query: disclosure!.url,
        rule: MATCH_RULE,
        candidates: [...profiles.values()].map((x) => ({ company_number: x.company_number, title: x.company_name })),
        outcome: "Provider's website states other companies; no name fallback",
      };
      writeFileSync(join(OUT, `${p.slug}.json`), JSON.stringify(record, null, 2) + "\n");
      summary.push(`${record.status.padEnd(9)} ${p.slug.padEnd(22)} ${record.match.outcome}`);
      continue;
    }

    // 2. Otherwise the strict name rule. Search the name and its "UK" variant: groups often run a separate UK
    // company (e.g. a ring-fenced "UK Bank plc") that a plain search can miss,
    // and finding both must make the match ambiguous, not pick the wrong one.
    const seen = new Map<string, { title: string; company_number: string; company_status?: string }>();
    for (const q of [p.name, `${p.name} UK`]) {
      for (const item of await ch.search(q)) seen.set(item.company_number, item);
      await pause();
    }
    const hits = nameCandidates(p.name, [...seen.values()]);
    record.match.candidates = hits.map((h) => ({ company_number: h.company_number, title: h.title }));

    const profiles: CompanyProfile[] = [];
    for (const h of hits.slice(0, 8)) {
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
