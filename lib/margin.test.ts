import test from "node:test";
import assert from "node:assert/strict";
import { computeMargin, derivePayout, IMPLAUSIBLE_TOTAL_PCT } from "./margin.ts";

const close = (a: number, b: number, tol = 1e-6) =>
  assert.ok(Math.abs(a - b) < tol, `expected ${a} ≈ ${b}`);

test("worked example from build-spec §1.6 (£50,000 @ 1.1200 vs 1.1500)", () => {
  const r = computeMargin({ sendAmount: 50_000, midRate: 1.15, quotedRate: 1.12 });
  assert.equal(r.status, "ok");
  close(r.receiveAmount, 56_000);
  close(r.midMarketReceive, 57_500);
  close(r.shortfall, 1_500);
  close(r.totalCost, 1_304.347826, 1e-5);
  close(r.totalPct, 2.608695, 1e-5);
});

test("the three percentage identities agree when there is no stated fee", () => {
  const r = computeMargin({ sendAmount: 50_000, midRate: 1.15, quotedRate: 1.12 });
  close(r.totalPct, (r.totalCost / r.sendAmount) * 100, 1e-9);
  close(r.totalPct, r.rateSpreadPct, 1e-9);
  close(r.totalCost, r.fxMargin, 1e-9); // zero fee ⇒ total cost is entirely margin
});

test("payout mode and rate mode agree for the same transfer", () => {
  const byRate = computeMargin({ sendAmount: 50_000, midRate: 1.15, quotedRate: 1.12 });
  const byPayout = computeMargin({ sendAmount: 50_000, midRate: 1.15, receiveAmount: 56_000 });
  close(byRate.totalCost, byPayout.totalCost);
  close(byRate.fxMargin, byPayout.fxMargin);
});

test("a stated fee is separated from the undisclosed margin", () => {
  const r = computeMargin({
    sendAmount: 50_000,
    midRate: 1.15,
    receiveAmount: 56_000,
    fee: 300,
  });
  close(r.statedFee, 300);
  close(r.totalCost, 1_304.347826, 1e-5);
  close(r.fxMargin, 1_004.347826, 1e-5);
  assert.ok(r.fxMargin < r.totalCost);
});

test("fee treatment changes the payout, so it is never assumed", () => {
  const deducted = derivePayout(50_000, 1.12, 300, "deducted");
  const added = derivePayout(50_000, 1.12, 300, "added");
  close(deducted, 49_700 * 1.12);
  close(added, 56_000);
  assert.notEqual(deducted, added);
});

test("a quote better than the reference is reported, never called a profit", () => {
  const r = computeMargin({ sendAmount: 50_000, midRate: 1.15, receiveAmount: 58_000 });
  assert.equal(r.status, "beats-reference");
  assert.ok(r.shortfall < 0);
  assert.match(r.note!, /better than the reference rate/i);
  assert.doesNotMatch(r.note!, /profit/i);
});

test("implausible inputs are flagged rather than rendered", () => {
  const r = computeMargin({ sendAmount: 50_000, midRate: 1.15, receiveAmount: 20_000 });
  assert.equal(r.status, "implausible");
  assert.ok(Math.abs(r.totalPct) > IMPLAUSIBLE_TOTAL_PCT);
});

test("same currency is stated plainly instead of computed", () => {
  const r = computeMargin({
    sendAmount: 50_000,
    midRate: 1,
    receiveAmount: 50_000,
    sameCurrency: true,
  });
  assert.equal(r.status, "identity");
});

test("invalid input is rejected without throwing", () => {
  assert.equal(computeMargin({ sendAmount: 0, midRate: 1.15, receiveAmount: 1 }).status, "invalid");
  assert.equal(computeMargin({ sendAmount: 50_000, midRate: 0, receiveAmount: 1 }).status, "invalid");
  assert.equal(computeMargin({ sendAmount: 50_000, midRate: 1.15 }).status, "invalid");
  assert.equal(
    computeMargin({ sendAmount: 100, midRate: 1.15, receiveAmount: 100, fee: 200 }).status,
    "invalid",
  );
  assert.equal(
    computeMargin({ sendAmount: NaN, midRate: 1.15, receiveAmount: 1 }).status,
    "invalid",
  );
});

test("a zero-fee broker's cost is entirely margin (standard §4.2.1)", () => {
  const r = computeMargin({
    sendAmount: 250_000,
    midRate: 1.15,
    receiveAmount: 250_000 * 1.1345,
    fee: 0,
  });
  assert.equal(r.status, "ok");
  close(r.statedFee, 0);
  close(r.fxMargin, r.totalCost);
  assert.ok(r.totalCost > 3_000, "a spread on a large transfer is a large absolute cost");
});
