import test from "node:test";
import assert from "node:assert/strict";
import { extractProviderNotices } from "./provider-notices.ts";
test("a notice requires the named brand and an explicit change statement", () => {
  const text = "We acquired and rebranded Example Brand as New Brand in 2023.\nWe send money to 200 countries.\nWe acquired and rebranded Another Brand in 2024.";
  assert.deepEqual(extractProviderNotices(text, "Example Brand"), ["We acquired and rebranded Example Brand as New Brand in 2023."]);
});
