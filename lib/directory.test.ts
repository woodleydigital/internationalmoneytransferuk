import { test } from "node:test";
import assert from "node:assert/strict";
import { applyFilters, facetCounts, makeEntry, monogram, parseFilters, type Entry } from "./directory.ts";
import type { Provider } from "./providers.ts";
import type { CompanyRecord } from "./companies-house.ts";

const prov = (slug: string, name: string, kind: Provider["kind"]): Provider => ({ slug, name, kind, phase: 2, indexWhenVerified: false });
const co = (incorporated: string): CompanyRecord => ({
  slug: "x", fetchedAt: "", status: "matched",
  match: { query: "", rule: "", candidates: [], outcome: "" },
  company: { name: "X LIMITED", number: "1", incorporated, sicCodes: [], registeredOffice: "", url: "" },
});
const entries: Entry[] = [
  makeEntry(prov("wise", "Wise", "transfer"), co("2010-04-08"), null),
  makeEntry(prov("hsbc", "HSBC", "bank"), co("2015-12-23"), null),
  makeEntry(prov("ofx", "OFX", "broker"), null, null),
  makeEntry(prov("barclays", "Barclays", "bank"), co("1971-01-01"), null),
];

test("filters parse safely from the query string", () => {
  const f = parseFilters({ q: " wise ", kind: ["bank", "bogus"], company: "1", sort: "nope" });
  assert.deepEqual(f, { q: "wise", kinds: ["bank"], hasCompany: true, hasStatement: false, sort: "az" });
});

test("category and record filters combine", () => {
  const f = parseFilters({ kind: "bank", company: "1" });
  assert.deepEqual(applyFilters(entries, f).map((e) => e.provider.slug), ["barclays", "hsbc"]);
});

test("date sorts put providers without a recorded date last", () => {
  assert.deepEqual(applyFilters(entries, parseFilters({ sort: "oldest" })).map((e) => e.provider.slug), ["barclays", "wise", "hsbc", "ofx"]);
  assert.deepEqual(applyFilters(entries, parseFilters({ sort: "newest" })).map((e) => e.provider.slug), ["hsbc", "wise", "barclays", "ofx"]);
});

test("facet counts ignore their own filter", () => {
  const c = facetCounts(entries, parseFilters({ kind: "bank" }));
  assert.deepEqual(c.kinds, { bank: 2, transfer: 1, broker: 1 });
  assert.equal(c.hasCompany, 2);
});

test("monograms", () => {
  assert.equal(monogram("Western Union"), "WU");
  assert.equal(monogram("Bank of Scotland"), "BS");
  assert.equal(monogram("HSBC"), "HS");
  assert.equal(monogram("M&S Bank"), "MB");
});
