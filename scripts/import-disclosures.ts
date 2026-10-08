/**
 * Weekly read of each provider's own website for its regulatory statement.
 *
 *   node --experimental-strip-types scripts/import-disclosures.ts [slug ...]
 *
 * Fetches the provider's homepage (respecting robots.txt, identifying ourselves)
 * and keeps any paragraph that states an FRN or, beside a mention of the FCA or
 * PRA, a company number. If the homepage gives no company number, it follows up
 * to four of the homepage's own links to legal, regulatory or "about us" pages
 * on the same site. If the plain HTML yields nothing (footers drawn by
 * JavaScript), it renders the same pages in headless Chromium and reads the
 * visible text. Writes data/disclosures/{slug}.json. Nothing is paraphrased.
 *
 *   CHROMIUM_PATH — optional path to a Chromium binary for the renderer
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDERS } from "../lib/providers.ts";
import {
  findLegalLinks,
  findStatements,
  htmlToText,
  transferStatements,
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

// Headless browser, started only if a site needs it.
type Browser = import("playwright").Browser;
let browser: Browser | null = null;
async function rendered(url: string): Promise<{ html: string; text: string; url: string } | null> {
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

/** Read a page and its legal links through the renderer. */
async function renderedStatements(start: string): Promise<Statement[]> {
  const out: Statement[] = [];
  const home = await rendered(start);
  if (!home) return out;
  merge(out, findStatements(home.text));
  if (!out.some((s) => s.companyNumbers.length)) {
    for (const link of findLegalLinks(home.html, home.url)) {
      if (!(await allowed(link))) continue;
      const sub = await rendered(link);
      if (sub) merge(out, findStatements(sub.text), sub.url);
      if (out.some((s) => s.companyNumbers.length)) break;
    }
  }
  return out;
}

/** Paths where UK firms usually publish their regulatory and company details. */
const COMMON_LEGAL_PATHS = [
  "/legal/",
  "/legal",
  "/legal-information/",
  "/important-information/",
  "/regulatory-information/",
  "/about-us/",
  "/terms-and-conditions/",
  "/terms/",
];

const summary: string[] = [];
// Optional slugs on the command line limit the run to those providers.
const only = new Set(process.argv.slice(2));
for (const p of PROVIDERS) {
  if (!p.website || (only.size && !only.has(p.slug))) continue;
  const rec: DisclosureRecord = {
    slug: p.slug,
    url: p.website,
    fetchedAt: new Date().toISOString(),
    status: "none",
    statements: [],
  };
  const hasNumber = () => rec.statements.some((s) => s.companyNumbers.length);
  let homeHtml = "";
  try {
    if (!(await allowed(p.website))) {
      rec.status = "blocked";
      rec.error = "robots.txt disallows this page";
    } else {
      const res = await get(p.website);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      rec.url = res.url || p.website;
      homeHtml = await res.text();
      merge(rec.statements, findStatements(htmlToText(homeHtml)));
    }
  } catch (e) {
    rec.status = "error";
    rec.error = e instanceof Error ? e.message : String(e);
  }

  // No company number yet: try configured statement pages, the homepage's own
  // legal links, then the usual legal paths on the same site.
  if (!hasNumber() && rec.status !== "blocked") {
    const origin = new URL(rec.url).origin;
    const candidates = [
      ...(p.statementPages ?? []),
      ...(homeHtml ? findLegalLinks(homeHtml, rec.url) : []),
      ...COMMON_LEGAL_PATHS.map((path) => origin + path),
    ].filter((u, i, all) => all.indexOf(u) === i && new URL(u).hostname.endsWith(new URL(p.website!).hostname.replace(/^www\./, "")));
    for (const link of candidates.slice(0, 10)) {
      await pause();
      if (!(await allowed(link))) continue;
      try {
        const sub = await get(link);
        if (!sub.ok || !(sub.headers.get("content-type") ?? "").includes("html")) continue;
        merge(rec.statements, findStatements(htmlToText(await sub.text())), sub.url || link);
      } catch {
        // One unreachable page does not invalidate the others.
      }
      if (hasNumber()) break;
    }
    if (rec.statements.length) {
      rec.status = "found";
      delete rec.error;
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
  if (rec.status !== "blocked" && rec.status !== "error") {
    rec.status = rec.statements.length ? "found" : "none";
  }
  // Nothing in the plain HTML (or it could not be fetched): try the rendered page.
  if ((rec.status === "none" || rec.status === "error") && (await allowed(p.website).catch(() => false))) {
    const found = await renderedStatements(p.website);
    if (found.length) {
      rec.statements = found;
      rec.status = "found";
      delete rec.error;
    }
  }
  rec.statements = transferStatements(rec.statements);
  if (rec.status === "found" && !rec.statements.length) rec.status = "none";
  writeFileSync(join(OUT, `${p.slug}.json`), JSON.stringify(rec, null, 2) + "\n");
  const nums = rec.statements.flatMap((s) => [...s.frns.map((f) => `FRN ${f}`), ...s.companyNumbers.map((c) => `Co ${c}`)]);
  summary.push(`${rec.status.padEnd(8)} ${p.slug.padEnd(22)} ${[...new Set(nums)].join(", ") || rec.error || ""}`);
  await pause();
}
await (browser as Browser | null)?.close();
console.log(summary.join("\n"));
