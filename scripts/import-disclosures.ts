/**
 * Weekly read of each provider's own website for its regulatory statement.
 *
 *   node --experimental-strip-types scripts/import-disclosures.ts
 *
 * Fetches the provider's homepage (respecting robots.txt, identifying ourselves),
 * keeps any sentence that states an FRN or, alongside the FCA/PRA, a company
 * number, and writes data/disclosures/{slug}.json. Nothing is paraphrased.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDERS } from "../lib/providers.ts";
import { findStatements, htmlToText, robotsAllows, type DisclosureRecord } from "../lib/disclosures.ts";

const UA = "IMTUKDirectoryBot/1.0 (+https://internationalmoneytransfer.uk/methodology/)";
const OUT = join(process.cwd(), "data", "disclosures");
mkdirSync(OUT, { recursive: true });

async function get(url: string): Promise<Response> {
  return fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,*/*;q=0.8", "Accept-Language": "en-GB" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
}

const summary: string[] = [];
for (const p of PROVIDERS) {
  if (!p.website) continue;
  const rec: DisclosureRecord = {
    slug: p.slug,
    url: p.website,
    fetchedAt: new Date().toISOString(),
    status: "none",
    statements: [],
  };
  try {
    const u = new URL(p.website);
    const robots = await get(`${u.origin}/robots.txt`).then((r) => (r.ok ? r.text() : ""), () => "");
    if (!robotsAllows(robots, u.pathname)) {
      rec.status = "blocked";
      rec.error = "robots.txt disallows this page";
    } else {
      const res = await get(p.website);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      rec.url = res.url || p.website;
      rec.statements = findStatements(htmlToText(await res.text()));
      rec.status = rec.statements.length ? "found" : "none";
    }
  } catch (e) {
    rec.status = "error";
    rec.error = e instanceof Error ? e.message : String(e);
  }
  writeFileSync(join(OUT, `${p.slug}.json`), JSON.stringify(rec, null, 2) + "\n");
  const nums = rec.statements.flatMap((s) => [...s.frns.map((f) => `FRN ${f}`), ...s.companyNumbers.map((c) => `Co ${c}`)]);
  summary.push(`${rec.status.padEnd(8)} ${p.slug.padEnd(22)} ${[...new Set(nums)].join(", ") || rec.error || ""}`);
  await new Promise((r) => setTimeout(r, 500));
}
console.log(summary.join("\n"));
