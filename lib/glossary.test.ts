import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { GLOSSARY } from "./glossary.ts";
import { HOME_FAQ } from "./faq.ts";

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith(".tsx") ? [p] : [];
  });

test("every glossary link points at a defined term", () => {
  const slugs = new Set(GLOSSARY.map((t) => t.slug));
  const used = ["app", "components"].flatMap(files).flatMap((f) =>
    [...readFileSync(f, "utf8").matchAll(/<Term[^>]*slug="([^"]+)"/g)].map((m) => m[1]),
  );
  assert.ok(used.length > 5);
  for (const s of used) assert.ok(slugs.has(s), `unknown glossary term: ${s}`);
});

test("glossary slugs are unique and definitions are present", () => {
  assert.equal(new Set(GLOSSARY.map((t) => t.slug)).size, GLOSSARY.length);
  for (const t of GLOSSARY) assert.ok(t.definition.length > 40, t.slug);
});

test("FAQ answers are plain text, ready for markup", () => {
  for (const f of HOME_FAQ) assert.ok(!/[<>]/.test(f.a) && f.q.endsWith("?"), f.q);
});
