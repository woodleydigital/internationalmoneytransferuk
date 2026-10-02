/**
 * Fetch each provider's logo from the icons its own website publishes.
 *
 *   node --experimental-strip-types scripts/import-logos.ts [slug ...]
 *
 * Writes public/logos/{slug}.{ext} and data/logos.json. File names are fixed per
 * provider (media URLs are permanent); a new logo overwrites the old one. A
 * provider whose icon cannot be fetched keeps any logo it already has.
 */
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDERS } from "../lib/providers.ts";
import { robotsAllows } from "../lib/disclosures.ts";
import { findIconLinks, icoWidth, imageType, pngWidth, rankIcons, type LogoRecord } from "../lib/logos.ts";

const UA = "IMTUKDirectoryBot/1.0 (+https://internationalmoneytransfer.uk/methodology/)";
const DIR = join(process.cwd(), "public", "logos");
const INDEX = join(process.cwd(), "data", "logos.json");
const MAX_BYTES = 400_000;
mkdirSync(DIR, { recursive: true });

const index: Record<string, LogoRecord> = existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, "utf8")) : {};
const get = (url: string) =>
  fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en-GB" }, redirect: "follow", signal: AbortSignal.timeout(20_000) });
const pause = () => new Promise((r) => setTimeout(r, 400));

async function allowed(url: string): Promise<boolean> {
  const u = new URL(url);
  const robots = await get(`${u.origin}/robots.txt`).then((r) => (r.ok ? r.text() : ""), () => "");
  return robotsAllows(robots, u.pathname);
}

async function manifestIcons(html: string, base: string) {
  const m = html.match(/<link\b[^>]*rel=["']manifest["'][^>]*>/i)?.[0];
  const href = m?.match(/href=["']([^"']+)["']/i)?.[1];
  if (!href) return [];
  try {
    const url = new URL(href, base).toString();
    const json = await (await get(url)).json();
    return ((json.icons ?? []) as { src: string; sizes?: string }[]).map((i) => ({
      url: new URL(i.src, url).toString(),
      size: Math.max(0, ...[...(i.sizes ?? "").matchAll(/(\d+)x(\d+)/g)].map((s) => Number(s[1]))),
      rank: 2.5,
    }));
  } catch {
    return [];
  }
}

// Icons checked and rejected as not the provider's recognisable logo.
const REJECTED = new Set(["danske-bank", "hamilton-court-fx"]);

const only = new Set(process.argv.slice(2));
const summary: string[] = [];
for (const p of PROVIDERS) {
  if (!p.website || REJECTED.has(p.slug) || (only.size && !only.has(p.slug))) continue;
  let result = "no icon";
  try {
    if (!(await allowed(p.website))) throw new Error("robots.txt disallows");
    const res = await get(p.website);
    const html = res.ok ? await res.text() : "";
    const base = res.url || p.website;
    const candidates = rankIcons([
      ...findIconLinks(html, base),
      ...(await manifestIcons(html, base)),
      { url: new URL("/apple-touch-icon.png", base).toString(), size: 180, rank: 0.5 },
      { url: new URL("/favicon.ico", base).toString(), size: 0, rank: 0 },
    ]);
    for (const c of candidates) {
      await pause();
      const r = await get(c.url).catch(() => null);
      if (!r || !r.ok) continue;
      const bytes = new Uint8Array(await r.arrayBuffer());
      if (bytes.length < 100 || bytes.length > MAX_BYTES) continue;
      const ext = imageType(bytes, r.headers.get("content-type") ?? "");
      if (!ext) continue;
      // Tiny bitmaps look blurry at directory size; prefer the monogram.
      if (ext === "png" && pngWidth(bytes) < 48) continue;
      if (ext === "ico" && icoWidth(bytes) < 48) continue;
      // Replace any earlier file for this provider with a different extension.
      for (const old of ["png", "jpg", "svg", "ico", "webp"]) {
        const f = join(DIR, `${p.slug}.${old}`);
        if (old !== ext && existsSync(f)) unlinkSync(f);
      }
      writeFileSync(join(DIR, `${p.slug}.${ext}`), bytes);
      const source = c.url.startsWith("data:") ? `inline image on ${base}` : c.url;
      index[p.slug] = { file: `/logos/${p.slug}.${ext}`, source, fetchedAt: new Date().toISOString() };
      result = `${ext} ${c.size || "?"}px from ${new URL(c.url).pathname}`;
      break;
    }
  } catch (e) {
    result = e instanceof Error ? e.message : String(e);
  }
  summary.push(`${p.slug.padEnd(24)} ${result}`);
}
writeFileSync(INDEX, JSON.stringify(index, null, 2) + "\n");
console.log(summary.join("\n"));
