import { test } from "node:test";
import assert from "node:assert/strict";
import { KeyedWindows, SlidingWindow } from "./rate-limit.ts";

test("a window allows its limit, then refuses until calls age out", () => {
  const w = new SlidingWindow(2, 1_000);
  assert.ok(w.take(0));
  assert.ok(w.take(10));
  assert.ok(!w.take(20));
  assert.ok(w.take(1_001));
});

test("keyed windows count each visitor separately", () => {
  const k = new KeyedWindows(1, 60_000);
  assert.ok(k.take("a", 0));
  assert.ok(!k.take("a", 1));
  assert.ok(k.take("b", 1));
});
