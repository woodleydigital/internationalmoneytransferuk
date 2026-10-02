/** Logo index written by scripts/import-logos.ts. */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { LogoRecord } from "./logos";

let cache: Record<string, LogoRecord> | null = null;

export function loadLogo(slug: string): LogoRecord | null {
  if (!cache) {
    const f = join(process.cwd(), "data", "logos.json");
    cache = existsSync(f) ? (JSON.parse(readFileSync(f, "utf8")) as Record<string, LogoRecord>) : {};
  }
  const rec = cache[slug];
  return rec && existsSync(join(process.cwd(), "public", rec.file)) ? rec : null;
}
