import { test } from "node:test";
import assert from "node:assert/strict";
import { pdfParagraphs, servicePdfText } from "./service-pdf.ts";

test("PDF text joins physical line wraps without rewriting terms or prices", () => {
  assert.equal(pdfParagraphs("Fees and charges\n\nWe charge £5 for international\npayments. Conditions apply.\fSending payments\n\nYour funds are sent by bank transfer."), "[IMT-H]Fees and charges[/IMT-H]\nWe charge £5 for international payments. Conditions apply.\n[IMT-H]Sending payments[/IMT-H]\nYour funds are sent by bank transfer.");
});

test("non-PDF content cannot be accepted as an official PDF source", () => {
  assert.throws(() => servicePdfText(Buffer.from("<html>Access denied</html>")), /Invalid/);
});
