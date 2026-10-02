/**
 * Weekly read of what each provider says about its own service.
 *
 *   node --experimental-strip-types scripts/import-service-facts.ts [slug ...]
 *
 * Reads the provider's homepage and up to six of its own pages about fees,
 * limits, safeguarding, payout methods or help (robots.txt respected, our user
 * agent identified), and keeps whole sentences on each topic word for word,
 * with the page they came from. Pages drawn by JavaScript are read in headless
 * Chromium when the plain HTML yields nothing. Writes data/services/{slug}.json.
 * Plain pattern matching: nothing is paraphrased or generated.
 *
 *   CHROMIUM_PATH — optional path to a Chromium binary for the renderer
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDERS } from "../lib/providers.ts";
import { htmlToText, robotsAllows } from "../lib/disclosures.ts";
import { findServiceLinks, findServiceQuotes, mergeQuotes, type ServiceQuote, type ServiceRecord } from "../lib/service-facts.ts";

const UA = "IMTUKDirectoryBot/1.0 (+https://internationalmoneytransfer.uk/methodology/)";
const OUT = join(process.cwd(), "data", "services");
mkdirSync(OUT, { recursive: true });

const pause = () => new Promise((r) => setTimeout(r, 1_000));

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
    robotsCache.set(u.origin, await get(`${u.origin}/robots.txt`).then((r) => (r.ok ? r.text() : ""), () => ""));
  }
  return robotsAllows(robotsCache.get(u.origin)!, u.pathname);
}

type Page = { html: string; text: string; url: string };

async function plain(url: string): Promise<Page | null> {
  const res = await get(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return { html, text: htmlToText(html), url: res.url || url };
}

// Headless browser, started only if a site needs it.
type Browser = import("playwright").Browser;
let browser: Browser | null = null;
async function rendered(url: string): Promise<Page | null> {
  try {
    if (!browser) {
      const { chromium } = await import("playwright");
      browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
    }
    const page = await browser.newPage({ userAgent: `${UA} HeadlessChrome`, locale: "en-GB" });
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      if (!res || !res.ok()) return null;
      await page.waitForTimeout(3_000);
      return { html: await page.content(), text: await page.innerText("body"), url: page.url() };
    } finally {
      await page.close();
    }
  } catch {
    return null;
  }
}

/** Read the homepage and its service pages with one fetcher. */
async function crawl(start: string, fetchPage: (u: string) => Promise<Page | null>, rec: ServiceRecord) {
  let quotes: ServiceQuote[] = [];
  const home = await fetchPage(start);
  if (!home) return quotes;
  rec.pages.push(home.url);
  quotes = mergeQuotes(quotes, findServiceQuotes(home.text, home.url));
  for (const link of findServiceLinks(home.html, home.url)) {
    if (!(await allowed(link))) continue;
    await pause();
    const sub = await fetchPage(link).catch(() => null);
    if (!sub) continue;
    rec.pages.push(sub.url);
    quotes = mergeQuotes(quotes, findServiceQuotes(sub.text, sub.url));
  }
  return quotes;
}

const summary: string[] = [];
const only = new Set(process.argv.slice(2));
for (const p of PROVIDERS) {
  if (!p.website || (only.size && !only.has(p.slug))) continue;
  const rec: ServiceRecord = { slug: p.slug, fetchedAt: new Date().toISOString(), status: "none", pages: [], quotes: [] };
  try {
    if (!(await allowed(p.website))) {
      rec.status = "blocked";
    } else {
      rec.quotes = await crawl(p.website, plain, rec).catch((e) => {
        rec.error = e instanceof Error ? e.message : String(e);
        return [];
      });
      if (!rec.quotes.length) {
        // The page may be drawn by JavaScript: try the renderer once.
        const pagesBefore = rec.pages.length;
        rec.quotes = await crawl(p.website, rendered, rec);
        if (rec.quotes.length || rec.pages.length > pagesBefore) delete rec.error;
      }
      rec.status = rec.quotes.length ? "found" : rec.error ? "error" : "none";
    }
  } catch (e) {
    rec.status = "error";
    rec.error = e instanceof Error ? e.message : String(e);
  }
  writeFileSync(join(OUT, `${p.slug}.json`), JSON.stringify(rec, null, 2) + "\n");
  const topics = [...new Set(rec.quotes.map((q) => q.topic))].join(",");
  summary.push(`${rec.status.padEnd(8)} ${p.slug.padEnd(22)} ${rec.quotes.length} quotes ${topics} ${rec.error ?? ""}`);
}
if (browser) await (browser as Browser).close();
console.log(summary.join("\n"));
