import { mkdirSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { NOTICE_SOURCES, extractProviderNotices } from "../lib/provider-notices.ts";
import { htmlToText, robotsAllows } from "../lib/disclosures.ts";

const OUT = join(process.cwd(), "data", "notices");
const UA = "IMTUKDirectoryBot/1.0 (+https://internationalmoneytransfer.uk/methodology/)";
mkdirSync(OUT, { recursive: true });
const get = (url: string) => fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20_000) });
for (const source of NOTICE_SOURCES) {
  const file = join(OUT, `${source.slug}.json`);
  try {
    const url = new URL(source.url);
    const robots = await get(`${url.origin}/robots.txt`);
    if (!robots.ok && (robots.status < 400 || robots.status >= 500 || robots.status === 429)) throw new Error(`robots.txt HTTP ${robots.status}`);
    if (!robotsAllows(robots.ok ? await robots.text() : "", url.pathname)) throw new Error("robots.txt disallows collection");
    const res = await get(source.url);
    if (!res.ok || new URL(res.url).hostname !== url.hostname) throw new Error(`Source unavailable: HTTP ${res.status}`);
    const quotations = extractProviderNotices(htmlToText(await res.text()), source.name);
    if (!quotations.length) throw new Error("No matching notice collected");
    const { name: _name, ...metadata } = source;
    writeFileSync(file, JSON.stringify({ ...metadata, fetchedAt: new Date().toISOString(), quotations }, null, 2) + "\n");
    console.log(`${source.slug}: ${quotations.length} notice quotations`);
  } catch (e) {
    if (existsSync(file)) unlinkSync(file);
    console.log(`${source.slug}: ${e instanceof Error ? e.message : String(e)}`);
  }
}
