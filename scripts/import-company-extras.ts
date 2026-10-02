/**
 * More of the public Companies House record for each matched company.
 *
 *   COMPANIES_HOUSE_API_KEY=... node --experimental-strip-types scripts/import-company-extras.ts [slug ...]
 *
 * Runs after import-companies-house.ts and reads its matches. For each company
 * it fetches previous names, the filing history, the charges summary, the
 * chain of corporate owners registered at Companies House (up to four levels),
 * and headline figures from the latest accounts when they were filed as iXBRL.
 * Writes data/company-extras/{slug}.json. Individuals are never stored.
 */
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDERS } from "../lib/providers.ts";
import { AuthError } from "../lib/companies-house.ts";
import {
  controlText,
  latestAccounts,
  parseIxbrl,
  summariseFilings,
  ukCompanyNumber,
  type CompanyExtras,
  type CorporatePsc,
  type FilingItem,
  type OwnerLink,
} from "../lib/company-extras.ts";

const KEY = process.env.COMPANIES_HOUSE_API_KEY;
if (!KEY) throw new Error("Set COMPANIES_HOUSE_API_KEY.");
const AUTH = `Basic ${Buffer.from(`${KEY}:`).toString("base64")}`;
const API = "https://api.company-information.service.gov.uk";
const DOC_API = "https://document-api.company-information.service.gov.uk";
const CH_PUBLIC = "https://find-and-update.company-information.service.gov.uk";
const OUT = join(process.cwd(), "data", "company-extras");
mkdirSync(OUT, { recursive: true });

const pause = () => new Promise((r) => setTimeout(r, 350));

async function get<T>(url: string, accept = "application/json"): Promise<T | null> {
  await pause();
  const res = await fetch(url, { headers: { Authorization: AUTH, Accept: accept }, signal: AbortSignal.timeout(60_000) });
  if (res.status === 404) return null;
  if (res.status === 401 || res.status === 403) throw new AuthError(`Companies House rejected the API key (${res.status}).`);
  if (!res.ok) throw new Error(`Companies House returned ${res.status} for ${url}`);
  return (accept === "application/json" ? res.json() : res.text()) as Promise<T>;
}

/** Corporate owners up the chain, following only companies registered at Companies House. */
async function ownerChain(number: string): Promise<OwnerLink[]> {
  const chain: OwnerLink[] = [];
  const seen = new Set([number]);
  let current = number;
  for (let depth = 0; depth < 4; depth++) {
    const psc = (await get<{ items?: CorporatePsc[] }>(`${API}/company/${current}/persons-with-significant-control?items_per_page=100`))?.items ?? [];
    // Corporate owners only, still current. Individuals are never followed or stored.
    const corporate = psc.filter((p) => !p.ceased_on && /corporate-entity|legal-person/.test(p.kind ?? ""));
    if (corporate.length !== 1) {
      // None, or several: record each without following, so the chain never guesses.
      for (const p of corporate) chain.push(link(p));
      break;
    }
    const owner = corporate[0];
    chain.push(link(owner));
    const next = ukCompanyNumber(owner);
    if (!next || seen.has(next)) break;
    seen.add(next);
    current = next;
  }
  return chain;
}

function link(p: CorporatePsc): OwnerLink {
  const number = ukCompanyNumber(p);
  return {
    name: p.name,
    number,
    registeredIn: p.identification?.country_registered ?? p.identification?.place_registered,
    control: controlText(p.natures_of_control),
    url: number ? `${CH_PUBLIC}/company/${number}` : undefined,
  };
}

async function accounts(number: string, filings: FilingItem[]) {
  const f = latestAccounts(filings);
  if (!f?.links?.document_metadata) return undefined;
  const id = f.links.document_metadata.split("/document/").pop();
  const meta = await get<{ resources?: Record<string, unknown> }>(`${DOC_API}/document/${id}`);
  const url = `${CH_PUBLIC}/company/${number}/filing-history`;
  const base = { madeUpTo: f.description_values?.made_up_date, filedOn: f.date, url };
  if (!meta?.resources || !("application/xhtml+xml" in meta.resources)) return { ...base, figures: [] };
  const html = await get<string>(`${DOC_API}/document/${id}/content`, "application/xhtml+xml");
  return { ...base, figures: html ? parseIxbrl(html) : [] };
}

const only = new Set(process.argv.slice(2));
const summary: string[] = [];
for (const p of PROVIDERS) {
  if (only.size && !only.has(p.slug)) continue;
  const chFile = join(process.cwd(), "data", "companies-house", `${p.slug}.json`);
  const outFile = join(OUT, `${p.slug}.json`);
  const ch = existsSync(chFile) ? JSON.parse(readFileSync(chFile, "utf8")) : null;
  const number: string | undefined = ch?.status === "matched" ? ch.company?.number : undefined;
  if (!number) {
    // No confirmed company: no extras, and none left over from an earlier match.
    if (existsSync(outFile)) unlinkSync(outFile);
    continue;
  }
  try {
    const profile = await get<{ previous_company_names?: { name: string; effective_from?: string; ceased_on?: string }[] }>(`${API}/company/${number}`);
    const filings = (await get<{ items?: FilingItem[] }>(`${API}/company/${number}/filing-history?items_per_page=100`))?.items ?? [];
    const charges = await get<{ total_count?: number; satisfied_count?: number; part_satisfied_count?: number; unfiltered_count?: number }>(`${API}/company/${number}/charges`);
    const total = charges?.total_count ?? charges?.unfiltered_count ?? 0;
    const satisfied = charges?.satisfied_count ?? 0;
    const rec: CompanyExtras = {
      slug: p.slug,
      number,
      fetchedAt: new Date().toISOString(),
      previousNames: (profile?.previous_company_names ?? []).map((n) => ({ name: n.name, from: n.effective_from, to: n.ceased_on })),
      timeline: summariseFilings(number, filings),
      charges: charges ? { total, satisfied, outstanding: Math.max(0, total - satisfied), url: `${CH_PUBLIC}/company/${number}/charges` } : undefined,
      owners: await ownerChain(number),
      accounts: await accounts(number, filings).catch(() => undefined),
    };
    writeFileSync(outFile, JSON.stringify(rec, null, 2) + "\n");
    summary.push(`${p.slug.padEnd(24)} names ${rec.previousNames.length} filings ${rec.timeline.length} charges ${total} owners ${rec.owners.map((o) => o.name).join(" → ") || "-"} figures ${rec.accounts?.figures.length ?? 0}`);
  } catch (e) {
    if (e instanceof AuthError) throw e;
    // Leave nothing rather than a partial or stale record.
    if (existsSync(outFile)) unlinkSync(outFile);
    summary.push(`${p.slug.padEnd(24)} error ${e instanceof Error ? e.message : String(e)}`);
  }
}
console.log(summary.join("\n"));
