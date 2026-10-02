import { test } from "node:test";
import assert from "node:assert/strict";
import { formatFigure, latestAccounts, parseIxbrl, summariseFilings, ukCompanyNumber } from "./company-extras.ts";

const ixbrl = `
<xbrli:context id="cy"><xbrli:entity><xbrli:identifier>1</xbrli:identifier></xbrli:entity><xbrli:period><xbrli:startDate>2024-01-01</xbrli:startDate><xbrli:endDate>2024-12-31</xbrli:endDate></xbrli:period></xbrli:context>
<xbrli:context id="py"><xbrli:entity><xbrli:identifier>1</xbrli:identifier></xbrli:entity><xbrli:period><xbrli:startDate>2023-01-01</xbrli:startDate><xbrli:endDate>2023-12-31</xbrli:endDate></xbrli:period></xbrli:context>
<xbrli:context id="cyi"><xbrli:entity><xbrli:identifier>1</xbrli:identifier></xbrli:entity><xbrli:period><xbrli:instant>2024-12-31</xbrli:instant></xbrli:period></xbrli:context>
<xbrli:context id="seg"><xbrli:entity><xbrli:identifier>1</xbrli:identifier><xbrli:segment><xbrldi:explicitMember dimension="x">y</xbrldi:explicitMember></xbrli:segment></xbrli:entity><xbrli:period><xbrli:endDate>2024-12-31</xbrli:endDate></xbrli:period></xbrli:context>
<ix:nonFraction name="core:TurnoverRevenue" contextRef="cy" unitRef="GBP" scale="3" decimals="-3" format="ixt:num-dot-decimal">12,345</ix:nonFraction>
<ix:nonFraction name="core:TurnoverRevenue" contextRef="py" unitRef="GBP" scale="3">9,000</ix:nonFraction>
<ix:nonFraction name="core:TurnoverRevenue" contextRef="seg" unitRef="GBP" scale="3">1</ix:nonFraction>
<ix:nonFraction name="core:ProfitLoss" contextRef="cy" unitRef="GBP" sign="-" format="ixt:num-dot-decimal">(1,500)</ix:nonFraction>
<ix:nonFraction name="core:NetAssetsLiabilities" contextRef="cyi" unitRef="GBP"><span>250,000</span></ix:nonFraction>
<ix:nonFraction name="core:AverageNumberEmployeesDuringPeriod" contextRef="cy" unitRef="pure" format="ixt:num-dot-decimal">42</ix:nonFraction>
<ix:nonFraction name="core:CashBankOnHand" contextRef="cyi" unitRef="GBP" format="ixt:fixed-zero">-</ix:nonFraction>`;

test("iXBRL headline figures: latest period, entity level, scale and sign honoured", () => {
  const f = Object.fromEntries(parseIxbrl(ixbrl).map((x) => [x.label, x]));
  assert.equal(f["Turnover"].value, 12_345_000);
  assert.equal(f["Turnover"].periodEnd, "2024-12-31");
  assert.equal(f["Profit or loss for the year"].value, -1_500);
  assert.equal(f["Net assets"].value, 250_000);
  assert.equal(f["Average number of employees"].unit, "pure");
  assert.equal(f["Cash at bank and in hand"].value, 0);
  assert.equal(formatFigure(f["Profit or loss for the year"]), "−£1,500");
  assert.equal(formatFigure(f["Average number of employees"]), "42");
});

test("documents without tagged figures give nothing", () => {
  assert.deepEqual(parseIxbrl("<html><body>Scanned accounts</body></html>"), []);
});

test("timeline keeps shown categories, newest first, without officer filings", () => {
  const t = summariseFilings("01234567", [
    { date: "2020-01-01", category: "officers" },
    { date: "2024-05-01", category: "accounts", description_values: { made_up_date: "2023-12-31" }, transaction_id: "abc" },
    { date: "2022-03-01", category: "address" },
  ]);
  assert.deepEqual(t.map((x) => x.label), ["Accounts filed, made up to 2023-12-31", "Registered office address changed"]);
  assert.match(t[0].url, /01234567\/filing-history\/abc/);
});

test("latest accounts filing with a document", () => {
  const f = latestAccounts([
    { date: "2023-01-01", category: "accounts", links: { document_metadata: "a" } },
    { date: "2024-01-01", category: "accounts", links: {} },
    { date: "2024-02-01", category: "accounts", links: { document_metadata: "b" } },
  ]);
  assert.equal(f?.links?.document_metadata, "b");
});

test("corporate owners are followed only when registered at Companies House", () => {
  assert.equal(ukCompanyNumber({ name: "Wise plc", identification: { registration_number: "13211214", country_registered: "England" } }), "13211214");
  assert.equal(ukCompanyNumber({ name: "X", identification: { registration_number: "SC123456", place_registered: "Companies House" } }), "SC123456");
  assert.equal(ukCompanyNumber({ name: "Y Inc", identification: { registration_number: "5551234", country_registered: "Delaware" } }), undefined);
});
