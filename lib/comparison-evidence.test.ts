import test from "node:test";
import assert from "node:assert/strict";
import { comparisonEvidence, complaintCount } from "./comparison-evidence.ts";
import type { Entry } from "./directory.ts";

test("comparison does not turn receiving-account terms into sending fees", () => {
  const entry = { service: { quotes: [
    { topic: "fees", text: "Incoming payments cost £5.", context: "Receiving international payments", url: "https://example.com/" },
    { topic: "fees", text: "We charge £10 for an international transfer.", url: "https://example.com/" },
  ] } } as Entry;
  assert.deepEqual(comparisonEvidence(entry, "fees").quotes.map((q) => q.text), ["We charge £10 for an international transfer."]);
  entry.service!.quotes.pop();
  assert.equal(comparisonEvidence(entry, "fees").receivingOnly, true);
});

test("absence is not zero complaints; a published zero remains zero", () => {
  assert.equal(complaintCount(undefined), "Not stated in published data");
  assert.equal(complaintCount(0), "0");
  assert.equal(complaintCount(1200), "1,200");
});
