/**
 * Half-yearly Financial Ombudsman Service complaints data for each provider.
 *
 *   node --experimental-strip-types scripts/import-fos.ts
 *
 * Finds the two latest half-yearly publications in the Ombudsman's sitemap,
 * downloads each "Business complaints data" workbook, and links a business to
 * a provider only when its published name is exactly the registered company
 * name we hold from Companies House. Writes data/fos/{slug}.json. If the
 * workbook layout changes, the run stops rather than misreading figures.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDERS } from "../lib/providers.ts";
import { readXlsx } from "../lib/xlsx.ts";
import { normaliseBusiness, parseFosWorkbook, periodPages, periodSpan, type FosFigures, type FosPeriod, type FosRecord } from "../lib/fos.ts";

const UA = "IMTUKDirectoryBot/1.0 (+https://internationalmoneytransfer.uk/methodology/)";
const BASE = "https://www.financial-ombudsman.org.uk";
const OUT = join(process.cwd(), "data", "fos");
mkdirSync(OUT, { recursive: true });

const get = (url: string) => fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60_000) });

const sitemap = await (await get(`${BASE}/sitemap.xml`)).text();
const pages = periodPages(sitemap).slice(0, 2);
if (!pages.length) throw new Error("No half-yearly complaints data pages found in the Ombudsman's sitemap.");

const periods: { period: FosPeriod; figures: Map<string, FosFigures> }[] = [];
for (const p of pages) {
  const html = await (await get(p.url)).text();
  const href = html.match(/href="([^"]*Business-complaints-data[^"]*\.xlsx)"/i)?.[1];
  if (!href) throw new Error(`No business complaints workbook linked from ${p.url}`);
  const fileUrl = new URL(href, `${BASE}/`).toString();
  const bytes = new Uint8Array(await (await get(fileUrl)).arrayBuffer());
  const { figures, averageUpheld } = parseFosWorkbook(readXlsx(bytes));
  periods.push({ period: { label: p.label, span: periodSpan(p.label), pageUrl: p.url, fileUrl, averageUpheld }, figures });
  console.log(`${p.label}: ${figures.size} businesses`);
}

const summary: string[] = [];
for (const prov of PROVIDERS) {
  const chFile = join(process.cwd(), "data", "companies-house", `${prov.slug}.json`);
  const ch = existsSync(chFile) ? JSON.parse(readFileSync(chFile, "utf8")) : null;
  const company: string | undefined = ch?.status === "matched" ? ch.company?.name : undefined;
  const rec: FosRecord = { slug: prov.slug, fetchedAt: new Date().toISOString(), status: "no-company", periods: [] };
  if (company) {
    rec.company = company;
    rec.periods = periods.map(({ period, figures }) => ({ period, figures: figures.get(normaliseBusiness(company)) ?? null }));
    rec.status = rec.periods.some((x) => x.figures) ? "listed" : "not-listed";
  }
  writeFileSync(join(OUT, `${prov.slug}.json`), JSON.stringify(rec, null, 2) + "\n");
  const latest = rec.periods[0]?.figures;
  summary.push(`${rec.status.padEnd(10)} ${prov.slug.padEnd(24)} ${company ?? ""} ${latest ? `new ${latest.newCases} upheld ${Math.round((latest.upheld ?? 0) * 100)}%` : ""}`);
}
console.log(summary.join("\n"));
