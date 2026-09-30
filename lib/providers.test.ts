import { test } from "node:test";
import assert from "node:assert/strict";
import { PROVIDERS, groupByInitial, isIndexable, searchProviders, tierOf } from "./providers.ts";

test("slugs are unique and URL-safe", () => {
  const slugs = PROVIDERS.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of slugs) assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test("14 phase-1 profiles, as in the topical map", () => {
  assert.equal(PROVIDERS.filter((p) => p.phase === 1).length, 14);
});

test("nothing is indexable before register data exists", () => {
  for (const p of PROVIDERS) {
    assert.equal(tierOf(p), 3);
    assert.equal(isIndexable(p), false);
  }
});

test("search ignores case and punctuation", () => {
  assert.deepEqual(searchProviders("western union").map((p) => p.slug), ["western-union"]);
  assert.deepEqual(searchProviders("CO-OP").map((p) => p.slug), ["co-op-bank"]);
  assert.equal(searchProviders("zzz").length, 0);
  assert.equal(searchProviders("").length, PROVIDERS.length);
});

test("A–Z groups are in order and cover every provider", () => {
  const groups = groupByInitial(searchProviders(""));
  const letters = groups.map(([k]) => k);
  assert.deepEqual(letters, [...letters].sort());
  assert.equal(groups.reduce((n, [, l]) => n + l.length, 0), PROVIDERS.length);
});
