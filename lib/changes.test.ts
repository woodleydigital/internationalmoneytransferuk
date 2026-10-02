import { test } from "node:test";
import assert from "node:assert/strict";
import { diffRecords } from "./changes.ts";

const ch = (company: object) => ({ status: "matched", company: { number: "1", name: "X LTD", status: "active", registeredOffice: "A", ...company } });

test("Companies House changes are copied field by field for the same company", () => {
  const c = diffRecords("companies-house", ch({}), ch({ registeredOffice: "B", status: "liquidation" }), "2026-10-05");
  assert.deepEqual(c.map((x) => [x.field, x.from, x.to]), [["Company status", "active", "liquidation"], ["Registered office", "A", "B"]]);
});

test("a different company is our re-match, not a change", () => {
  assert.deepEqual(diffRecords("companies-house", ch({}), ch({ number: "2" }), "d"), []);
});

test("first imports and unchanged records record nothing", () => {
  assert.deepEqual(diffRecords("disclosures", null, { status: "found", statements: [] }, "d"), []);
  const s = { status: "found", quotes: [{ topic: "fees", text: "a" }] };
  assert.deepEqual(diffRecords("services", s, s, "d"), []);
});

test("wording and new Ombudsman periods are noted", () => {
  assert.equal(diffRecords("services", { status: "found", quotes: [{ topic: "fees", text: "a" }] }, { status: "found", quotes: [{ topic: "fees", text: "b" }] }, "d")[0].field, "Fees: wording");
  const f = (label: string) => ({ periods: [{ period: { label }, figures: {} }] });
  assert.equal(diffRecords("fos", f("H2 2025"), f("H1 2026"), "d")[0].field, "Complaints data published for H1 2026");
});
