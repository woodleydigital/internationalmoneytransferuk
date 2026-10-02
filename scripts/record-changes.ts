/**
 * Append this week's changes to each provider's change log.
 *
 *   node --experimental-strip-types scripts/record-changes.ts
 *
 * Runs in the import workflow after the imports and before the commit: each
 * record in the working tree is compared with its last committed version.
 * Writes data/changes/{slug}.json (newest first, at most 50 entries).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROVIDERS } from "../lib/providers.ts";
import { diffRecords, type Change } from "../lib/changes.ts";

const OUT = join(process.cwd(), "data", "changes");
mkdirSync(OUT, { recursive: true });
const KINDS = ["companies-house", "fos"] as const;
const today = new Date().toISOString().slice(0, 10);

const committed = (path: string) => {
  try {
    return JSON.parse(execFileSync("git", ["show", `HEAD:${path}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    return null;
  }
};
const current = (path: string) => (existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null);

let total = 0;
for (const p of PROVIDERS) {
  const found: Change[] = KINDS.flatMap((k) => {
    const path = `data/${k}/${p.slug}.json`;
    return diffRecords(k, committed(path), current(path), today);
  });
  if (!found.length) continue;
  const file = join(OUT, `${p.slug}.json`);
  const log: Change[] = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
  writeFileSync(file, JSON.stringify([...found, ...log].slice(0, 50), null, 2) + "\n");
  total += found.length;
  console.log(p.slug, found.map((c) => c.field).join("; "));
}
console.log(`${total} changes recorded.`);
