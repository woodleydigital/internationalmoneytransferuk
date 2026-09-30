/**
 * Weekly read of each provider's own website for its regulatory statement.
 *
 *   node --experimental-strip-types scripts/import-disclosures.ts
 *
 * Fetches the provider's homepage (respecting robots.txt, identifying ourselves)
 * and keeps any paragraph that states an FRN or, beside a mention of the FCA or
 * PRA, a company number. If the homepage gives no company number, it follows up
 * to four of the homepage's own links to legal, regulatory or "about us" pages
 * on the same site. Writes data/disclosures/{slug}.json. Nothing is paraphrased.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDERS } from "../lib/providers.ts";
import {
  findLegalLinks,
  findStatements,
  htmlToText,
  robotsAllows,
  type DisclosureRecord,
  type Statement,
} from "../lib/disclosures.ts";

const UA = "IMTUKDirectoryBot/1.0 (+https://internationalmoneytransfer.uk/methodology/)";
const OUT = join(process.cwd(), "data", "disclosures");
mkdirSync(OUT, { recursive: true });

const pause = () => new Promise((r) => setTimeout(r, 500));

async function get(url: string): Promise<Response> {
  return fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,*/*;q=0.8", "Accept-Language": "en-GB" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
}

const robotsCache = new Map<string, string>();
async function allowed(url: string): Promise<boolean> {
  const u = new URL(url);
  if (!robotsCache.has(u.origin)) {
    robotsCache.set(
      u.origin,
      await get(`${u.origin}/robots.txt`).then((r) => (r.ok ? r.text() : ""), () => ""),
    );
  }
  return robotsAllows(robotsCache.get(u.origin)!, u.pathname);
}

/** Add statements not already held (same wording), noting the page they came from. */
function merge(into: Statement[], found: Statement[], url?: string) {
  const have = new Set(into.map((s) => s.text.toLowerCase()));
  for (const s of found) {
    if (have.has(s.text.toLowerCase())) continue;
    into.push(url ? { ...s, url } : s);
    have.add(s.text.toLowerCase());
  }
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
    if (!(await allowed(p.website))) {
      rec.status = "blocked";
      rec.error = "robots.txt disallows this page";
    } else {
      const res = await get(p.website);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      rec.url = res.url || p.website;
      const html = await res.text();
      merge(rec.statements, findStatements(htmlToText(html)));

      // No company number on the homepage: try its own legal/regulatory links.
      if (!rec.statements.some((s) => s.companyNumbers.length)) {
        for (const link of findLegalLinks(html, rec.url)) {
          await pause();
          if (!(await allowed(link))) continue;
          try {
            const sub = await get(link);
            if (!sub.ok) continue;
            merge(rec.statements, findStatements(htmlToText(await sub.text())), sub.url || link);
          } catch {
            // One unreachable legal page does not invalidate the homepage result.
          }
          if (rec.statements.some((s) => s.companyNumbers.length)) break;
        }
      }
      // Legal pages often cover sister companies too (e.g. an investment arm).
      // If the homepage names the firm's FRN, drop sub-page statements that
      // carry only other FRNs: they describe a different regulated firm.
      const homeFrns = new Set(rec.statements.filter((s) => !s.url).flatMap((s) => s.frns));
      if (homeFrns.size) {
        rec.statements = rec.statements.filter(
          (s) => !s.url || !s.frns.length || s.frns.some((f) => homeFrns.has(f)),
        );
      }
      rec.status = rec.statements.length ? "found" : "none";
    }
  } catch (e) {
    rec.status = "error";
    rec.error = e instanceof Error ? e.message : String(e);
  }
  writeFileSync(join(OUT, `${p.slug}.json`), JSON.stringify(rec, null, 2) + "\n");
  const nums = rec.statements.flatMap((s) => [...s.frns.map((f) => `FRN ${f}`), ...s.companyNumbers.map((c) => `Co ${c}`)]);
  summary.push(`${rec.status.padEnd(8)} ${p.slug.padEnd(22)} ${[...new Set(nums)].join(", ") || rec.error || ""}`);
  await pause();
}
console.log(summary.join("\n"));
