import test from "node:test";
import assert from "node:assert/strict";
import { extractProviderNotices } from "./provider-notices.ts";
test("a notice requires the named brand and an explicit change statement", () => {
  const text = "We acquired and rebranded Example Brand as New Brand in 2023.\nWe send money to 200 countries.\nWe acquired and rebranded Another Brand in 2024.";
  assert.deepEqual(extractProviderNotices(text, "Example Brand"), ["We acquired and rebranded Example Brand as New Brand in 2023."]);
});
test("closure notices and dated brand history retain their exact scope", () => {
  const closure = "Thank you for your interest in and past use of the Ramsdens International Money Transfer service but this service is no longer available directly from Ramsdens.";
  assert.deepEqual(extractProviderNotices(closure, "Ramsdens"), [closure]);
  assert.deepEqual(extractProviderNotices("2018 – Pollen Street Capital acquires Foreign Currency Direct and Pure FX", "Pure FX"), ["2018 – Pollen Street Capital acquires Foreign Currency Direct and Pure FX"]);
  assert.deepEqual(extractProviderNotices("2018 – Pollen Street Capital acquires Another Brand", "Pure FX"), []);
});
