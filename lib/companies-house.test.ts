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
