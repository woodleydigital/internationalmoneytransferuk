/** Robots-respecting collection of verbatim provider statements, not generated facts.
 * node --experimental-strip-types scripts/import-service-facts.ts [slug ...]
 * IMT_SOURCE_CACHE_DIR optionally retains source snapshots for extraction QA.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { PROVIDERS, type Provider } from "../lib/providers.ts";
import { robotsAllows } from "../lib/disclosures.ts";
import { servicePageText } from "../lib/service-page.ts";
import { servicePdfText } from "../lib/service-pdf.ts";
import { findServiceLinks, findPageServiceQuotes, mergeQuotes, TOPICS, type ServiceRecord } from "../lib/service-facts.ts";
import { SERVICE_PAGES, isProviderSource } from "../lib/provider-sources.ts";

const UA = "IMTUKDirectoryBot/1.0 (+https://internationalmoneytransfer.uk/methodology/)";
const OUT = join(process.cwd(), "data", "services");
const SNAPSHOTS = process.env.IMT_SOURCE_CACHE_DIR;
mkdirSync(OUT, { recursive: true });
if (SNAPSHOTS) mkdirSync(SNAPSHOTS, { recursive: true });
const pause = () => new Promise((r) => setTimeout(r, 1_000));
async function get(url: string): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html,*/*;q=0.8", "Accept-Language": "en-GB" }, redirect: "follow", signal: AbortSignal.timeout(15_000) });
      if (attempt < 2 && [408, 429, 502, 503, 504].includes(res.status)) {
        await res.body?.cancel();
        await new Promise((resolve) => setTimeout(resolve, 1_000 * (attempt + 1)));
        continue;
      }
      return res;
    } catch (error) {
      if (attempt >= 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1_000 * (attempt + 1)));
    }
  }
}
const robotsCache = new Map<string, Promise<string>>();
async function allowed(url: string): Promise<boolean> {
  const u = new URL(url);
  if (!robotsCache.has(u.origin)) {
    robotsCache.set(u.origin, get(`${u.origin}/robots.txt`).then(async (r) => {
      // RFC 9309: an unavailable robots file (4xx) is not a Disallow rule.
      // Rate limits, server failures and network failures remain fail-closed.
      if (!r.ok && (r.status < 400 || r.status >= 500 || r.status === 429)) throw new Error(`robots.txt HTTP ${r.status}`);
      return r.ok ? r.text() : "";
    }));
  }
  return robotsAllows(await robotsCache.get(u.origin)!, u.pathname + u.search);
}
type Page = { html: string; text: string; url: string; fetchedAt: string };
async function plain(url: string): Promise<Page> {
  const res = await get(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if ((res.headers.get("content-type") ?? "").includes("application/pdf")) {
    return { html: "", text: servicePdfText(new Uint8Array(await res.arrayBuffer())), url: res.url || url, fetchedAt: new Date().toISOString() };
  }
  if (!(res.headers.get("content-type") ?? "").includes("html")) throw new Error("Not an HTML page");
  const html = await res.text();
  if (/just a moment|verify you are human|access denied|enable javascript and cookies to continue/i.test(html.slice(0, 8_000))) throw new Error("Source returned an access challenge");
  return { html, text: servicePageText(html), url: res.url || url, fetchedAt: new Date().toISOString() };
}
type Browser = import("playwright").Browser;
let browser: Browser | null = null;
let browserAttempted = false;
async function rendered(url: string): Promise<Page | null> {
  try {
    if (!browser && !browserAttempted) {
      browserAttempted = true;
      const { chromium } = await import("playwright");
      browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
    }
    if (!browser) return null;
    const page = await browser.newPage({ userAgent: UA, locale: "en-GB" });
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25_000 });
      if (!res || !res.ok()) return null;
      await page.waitForTimeout(1_500);
      const html = await page.content();
      if (/just a moment|verify you are human|access denied|enable javascript and cookies to continue/i.test(html.slice(0, 8_000))) return null;
      return { html, text: servicePageText(html), url: page.url(), fetchedAt: new Date().toISOString() };
    } finally { await page.close(); }
  } catch { return null; }
}
async function collect(p: Provider) {
  const rec: ServiceRecord = { slug: p.slug, fetchedAt: new Date().toISOString(), status: "none", pages: [], quotes: [], attempts: [] };
  if (!p.website) rec.error = "A current official money-transfer website has not been confirmed.";
  else {
    const queue = [...new Set([...(SERVICE_PAGES[p.slug] ?? []), p.website])];
    const seen = new Set<string>();
    let fetched = 0;
    while (queue.length && seen.size < 16 && fetched < 12) {
      const url = queue.shift()!;
      if (seen.has(url) || !isProviderSource(url, p.website, p.slug)) continue;
      seen.add(url);
      try {
        if (!(await allowed(url))) { rec.attempts!.push({ url, status: "blocked", reason: "robots.txt disallows collection" }); continue; }
        await pause();
        let page: Page;
        try { page = await plain(url); }
        catch (error) {
          // A normal browser can read an ordinary JavaScript page where the
          // HTML request failed. Never bypass robots or accept access challenges.
          const dynamic = await rendered(url);
          if (!dynamic) throw error;
          page = dynamic;
        }
        if (!isProviderSource(page.url, p.website, p.slug)) { rec.attempts!.push({ url, status: "redirected", reason: `Redirected to ${new URL(page.url).hostname}` }); continue; }
        if (!(await allowed(page.url))) { rec.attempts!.push({ url: page.url, status: "blocked", reason: "robots.txt disallows the redirected page" }); continue; }
        let found = findPageServiceQuotes(page.text, page.url);
        if (!found.length && (page.text.length < 1_000 || /__next_data__|__nuxt|id=["'](?:root|app)["']/i.test(page.html))) {
          const dynamic = await rendered(page.url);
          if (dynamic && isProviderSource(dynamic.url, p.website, p.slug)) { page = dynamic; found = findPageServiceQuotes(page.text, page.url); }
        }
        fetched++;
        rec.pages.push(page.url);
        rec.quotes = mergeQuotes(rec.quotes, found);
        if (SNAPSHOTS) {
          const key = createHash("sha256").update(page.url).digest("hex").slice(0, 20);
          writeFileSync(join(SNAPSHOTS, `${p.slug}-${key}.json`), JSON.stringify(page));
        }
        if (new Set(rec.quotes.map((q) => q.topic)).size < TOPICS.length) {
          for (const link of findServiceLinks(page.html, page.url, 12)) {
            if (isProviderSource(link, p.website, p.slug) && !seen.has(link) && !queue.includes(link)) queue.push(link);
          }
        }
      } catch (e) { rec.attempts!.push({ url, status: "error", reason: e instanceof Error ? e.message : String(e) }); }
    }
    rec.pages = [...new Set(rec.pages)];
    rec.status = rec.quotes.length ? "found" : rec.pages.length ? "none" : rec.attempts!.every((a) => a.status === "blocked") ? "blocked" : "error";
    if (!rec.quotes.length && rec.attempts!.length) rec.error = rec.attempts![0].reason;
  }
  writeFileSync(join(OUT, `${p.slug}.json`), JSON.stringify(rec, null, 2) + "\n");
  console.log(`${rec.status.padEnd(8)} ${p.slug.padEnd(24)} ${rec.quotes.length} quotes ${[...new Set(rec.quotes.map((q) => q.topic))].join(",")} (${rec.pages.length} pages) ${rec.error ?? ""}`);
}
const only = new Set(process.argv.slice(2));
const pending = PROVIDERS.filter((p) => !only.size || only.has(p.slug));
await Promise.all(Array.from({ length: 4 }, async () => {
  let provider: Provider | undefined;
  while ((provider = pending.shift())) await collect(provider);
}));
if (browser) await (browser as Browser).close();
