import { test } from "node:test";
import assert from "node:assert/strict";
import {
  minimisePsc,
  nameCandidates,
  nameMatches,
  normaliseName,
  pickCompany,
  type CompanyProfile,
} from "./companies-house.ts";
import { isFresh } from "./company-records.ts";

test("normalises punctuation, case and ampersands", () => {
  assert.equal(normaliseName("Co-operative Bank P.L.C."), "co operative bank p l c");
  assert.equal(normaliseName("Marks & Spencer"), "marks and spencer");
});

test("name must be the trading name plus a legal-form suffix", () => {
  assert.ok(nameMatches("OFX", "OFX UK LIMITED"));
  assert.ok(nameMatches("Wise", "WISE PAYMENTS LIMITED"));
  assert.ok(!nameMatches("Wise", "WISE OWL CONSULTING LIMITED"));
  assert.ok(!nameMatches("TSB", "TSBX LIMITED"));
});

test("only active companies are candidates", () => {
  const hits = nameCandidates("OFX", [
    { title: "OFX UK LIMITED", company_number: "1", company_status: "active" },
    { title: "OFX LIMITED", company_number: "2", company_status: "dissolved" },
  ]);
  assert.deepEqual(hits.map((h) => h.company_number), ["1"]);
});

const prof = (n: string, sic: string[]): CompanyProfile => ({
  company_name: n,
  company_number: n,
  sic_codes: sic,
});

test("accepts exactly one payments-sector company, otherwise nothing", () => {
  assert.equal(pickCompany([prof("1", ["64999"])]).kind, "matched");
  assert.equal(pickCompany([prof("1", ["47110"])]).kind, "none");
  assert.equal(pickCompany([prof("1", ["64999"]), prof("2", ["66190"])]).kind, "ambiguous");
  assert.equal(pickCompany([]).kind, "none");
});

test("PSC records keep no date of birth, address or nationality", () => {
  const [p] = minimisePsc([
    {
      name: "A Person",
      kind: "individual-person-with-significant-control",
      natures_of_control: ["ownership-of-shares-75-to-100-percent"],
      notified_on: "2020-01-01",
      // Fields the API returns that must be dropped:
      ...({ date_of_birth: { month: 1, year: 1970 }, nationality: "British", address: {} } as object),
    },
  ]);
  assert.deepEqual(Object.keys(p).sort(), ["kind", "name", "natures_of_control", "notified_on"]);
});

test("records older than 14 days are not shown", () => {
  const now = new Date("2026-10-15T00:00:00Z");
  assert.ok(isFresh("2026-10-10T00:00:00Z", now));
  assert.ok(!isFresh("2026-09-01T00:00:00Z", now));
  assert.ok(!isFresh("2026-10-20T00:00:00Z", now));
});

const P = (n: string, name: string): CompanyProfile => ({ company_name: name, company_number: n });

test("stated company: the trading name plus a suffix wins over a sister company", async () => {
  const { chooseStatedCompany } = await import("./companies-house.ts");
  const statements = [
    { text: "Barclays Investment Solutions Limited ... company 02752982", frns: [], companyNumbers: ["02752982"], url: "u" },
    { text: "Barclays Bank UK PLC ... FRN 759676 ... 09740322", frns: ["759676"], companyNumbers: ["09740322"], url: "u" },
  ];
  const profiles = new Map([
    ["02752982", P("02752982", "BARCLAYS INVESTMENT SOLUTIONS LIMITED")],
    ["09740322", P("09740322", "BARCLAYS BANK UK PLC")],
  ]);
  assert.equal(chooseStatedCompany("Barclays", statements, profiles)?.profile.company_number, "09740322");
});

test("stated company: a sister firm is rejected when the homepage FRN differs", async () => {
  const { chooseStatedCompany } = await import("./companies-house.ts");
  const statements = [
    { text: "Wise is authorised by the FCA, Firm Reference 900507", frns: ["900507"], companyNumbers: [] },
    { text: "Wise Assets UK LTD ... company number 11905382", frns: [], companyNumbers: ["11905382"], url: "u" },
  ];
  const profiles = new Map([["11905382", P("11905382", "WISE ASSETS UK LTD")]]);
  assert.equal(chooseStatedCompany("Wise", statements, profiles), null);
});

test("stated company: the homepage FRN links a differently named company", async () => {
  const { chooseStatedCompany } = await import("./companies-house.ts");
  const statements = [
    { text: "UKForex Limited (trading as OFX) ... Company No. 04631395 ... Firm Ref. No. 902028", frns: ["902028"], companyNumbers: ["04631395"] },
  ];
  const profiles = new Map([["04631395", P("04631395", "UKFOREX LIMITED")]]);
  assert.equal(chooseStatedCompany("OFX", statements, profiles)?.profile.company_number, "04631395");
});

test("stated company: a named company is accepted only when the homepage gives no FRN", async () => {
  const { chooseStatedCompany } = await import("./companies-house.ts");
  const statements = [
    { text: "National Westminster Bank Plc. Registered in England and Wales No. 929027.", frns: [], companyNumbers: ["00929027"], url: "u" },
  ];
  const profiles = new Map([["00929027", P("00929027", "NATIONAL WESTMINSTER BANK PLC")]]);
  assert.equal(chooseStatedCompany("NatWest", statements, profiles)?.profile.company_number, "00929027");
});
