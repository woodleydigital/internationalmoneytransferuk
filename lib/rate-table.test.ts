import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRows, formatChange, formatRate, type ApiRecord } from "./rate-table.ts";

const banks = (n: number, excluded = false) => Array.from({ length: n }, (_, i) => ({ key: `B${i}`, date: "", rate: 1, excluded }));
const now = new Date("2026-10-02T12:00:00Z");

test("rows need a fresh date, a valid rate and at least three central banks", () => {
  const latest: ApiRecord[] = [
    { date: "2026-10-02", base: "GBP", quote: "EUR", rate: 1.1709, providers: banks(88) },
    { date: "2026-10-02", base: "GBP", quote: "USD", rate: 1.3251, providers: banks(2) },
    { date: "2026-09-20", base: "GBP", quote: "INR", rate: 127, providers: banks(50) },
    { date: "2026-10-02", base: "GBP", quote: "NGN", rate: 0, providers: banks(9) },
    { date: "2026-10-02", base: "GBP", quote: "PKR", rate: 368, providers: [...banks(1), ...banks(10, true)] },
  ];
  const t = buildRows(latest, [], now)!;
  assert.deepEqual(t.rows.map((r) => r.code), ["EUR"]);
  assert.equal(t.rows[0].sources, 88);
  assert.equal(t.date, "2026-10-02");
});

test("nothing at all when every row fails", () => {
  assert.equal(buildRows([], [], now), null);
});

test("7- and 30-day changes use the last publication on or before each date", () => {
  const latest: ApiRecord[] = [{ date: "2026-10-02", base: "GBP", quote: "EUR", rate: 1.2, providers: banks(5) }];
  const history: ApiRecord[] = [
    { date: "2026-09-01", base: "GBP", quote: "EUR", rate: 1.0 },
    { date: "2026-09-25", base: "GBP", quote: "EUR", rate: 1.25 },
    { date: "2026-09-26", base: "GBP", quote: "EUR", rate: 9 },
  ];
  const r = buildRows(latest, history, now)!.rows[0];
  assert.equal(r.change7!.toFixed(2), "-4.00");
  assert.equal(r.change30!.toFixed(2), "20.00");
});

test("formatting", () => {
  assert.equal(formatRate(1.17094), "1.1709");
  assert.equal(formatRate(1761.392), "1,761.39");
  assert.equal(formatChange(0.4212), "+0.42%");
  assert.equal(formatChange(-1.5), "−1.50%");
  assert.equal(formatChange(0.001), "0.00%");
  assert.equal(formatChange(undefined), "—");
});
