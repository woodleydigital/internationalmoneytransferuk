import test from "node:test";
import assert from "node:assert/strict";
import { makeEntry } from "./directory.ts";
import { sharedCompanyEntries, transferQuestions } from "./transfer-checklist.ts";
import type { CompanyRecord } from "./companies-house.ts";
import { PROVIDERS } from "./providers.ts";

const company = (number: string): CompanyRecord => ({
  slug: "x", fetchedAt: "2026-10-05", status: "matched",
  match: { query: "", rule: "", candidates: [], outcome: "" },
  company: { name: "EXAMPLE LIMITED", number, sicCodes: [], registeredOffice: "", url: "https://example.com/" },
});

test("every provider has topic-specific questions without asserting collected evidence", () => {
  for (const provider of PROVIDERS) {
    const questions = transferQuestions(makeEntry(provider, null, null));
    assert.equal(new Set(questions.map((q) => q.topic)).size, 6);
    assert.ok(questions.every((q) => !q.hasQuotation));
  }
});

test("shared brands are joined by company number, not name or missing data", () => {
  const [a, b, c, d] = PROVIDERS.slice(0, 4);
  const first = makeEntry(a, company("1"), null);
  const shared = makeEntry(b, company("1"), null);
  const other = makeEntry(c, company("2"), null);
  const missing = makeEntry(d, null, null);
  assert.deepEqual(sharedCompanyEntries(first, [first, shared, other, missing]), [shared]);
  assert.deepEqual(sharedCompanyEntries(missing, [first, shared, other, missing]), []);
});
