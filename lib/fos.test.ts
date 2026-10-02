import { test } from "node:test";
import assert from "node:assert/strict";
import { normaliseBusiness, parseFosWorkbook, periodPages, periodSpan, percent } from "./fos.ts";

test("names compare as Companies House and the Ombudsman write them", () => {
  assert.equal(normaliseBusiness("HSBC UK Bank Plc"), normaliseBusiness("HSBC UK BANK PLC"));
  assert.equal(normaliseBusiness("THE CO-OPERATIVE BANK P.L.C."), normaliseBusiness("The Co-operative Bank plc"));
  assert.equal(normaliseBusiness("Wise Payments Limited"), normaliseBusiness("WISE PAYMENTS LTD"));
  assert.notEqual(normaliseBusiness("Barclays Bank Plc"), normaliseBusiness("Barclays Bank UK PLC"));
});

test("parses both sheets under the published headings", () => {
  const sheets = {
    "New cases": [
      ["Business Name", "Business Group", "Total New Cases", "New Cases"],
      [null, null, null, "Banking & Credit", "Mortgages & Home Finance", "General Insurance", "Investments", "Decumulation", "Funeral"],
      ["Wise Payments Limited", "No Group", 120, 120, null, null, null, null, null],
      ["Total", null, 999],
    ],
    "Resolved cases": [
      ["Business Name", "Business Group", "Total Proactive Settled Resolved ", "Total % of cases upheld"],
      [null, null, null, null, "Banking & Credit", "Mortgages & Home Finance", "General Insurance", "Investments", "Decumulation", "Funeral"],
      [null, null, null, "Average % of cases upheld = 29%"],
      ["Wise Payments Limited", "No Group", "-", 0.4166, 0.4166, null, null, null, null, null],
    ],
  };
  const { figures, averageUpheld } = parseFosWorkbook(sheets);
  const f = figures.get(normaliseBusiness("WISE PAYMENTS LIMITED"))!;
  assert.equal(f.newCases, 120);
  assert.deepEqual(f.newByProduct, [["Banking & Credit", 120]]);
  assert.equal(f.proactiveSettled, undefined);
  assert.equal(percent(f.upheld), "42%");
  assert.deepEqual(f.upheldByProduct, [["Banking & Credit", 0.4166]]);
  assert.equal(averageUpheld, "Average % of cases upheld = 29%");
  assert.equal(figures.size, 1);
});

test("changed columns are refused rather than misread", () => {
  assert.throws(() => parseFosWorkbook({ "New cases": [["Firm"]], "Resolved cases": [["Firm"]] }));
});

test("period pages sort newest first and spans are spelled out", () => {
  const xml = ["h1-2024", "h2-2025", "h1-2025"].map((p) => `<loc>https://x.org/a/half-yearly-complaints-data-${p}</loc>`).join("");
  assert.deepEqual(periodPages(xml).map((p) => p.label), ["H2 2025", "H1 2025", "H1 2024"]);
  assert.equal(periodSpan("H2 2025"), "1 July to 31 December 2025");
});
