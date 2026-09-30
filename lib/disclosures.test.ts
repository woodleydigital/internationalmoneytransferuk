import { test } from "node:test";
import assert from "node:assert/strict";
import {
  findStatements,
  htmlToText,
  normaliseCompanyNumber,
  robotsAllows,
  statedCompanyNumbers,
  type DisclosureRecord,
} from "./disclosures.ts";

test("html becomes visible text, including markup escaped inside data", () => {
  const t = htmlToText(
    '<script>var x="FCA 123456"</script><footer><p>Acme &amp; Co is regulated.&lt;br /&gt;Next</p></footer>',
  );
  assert.ok(!t.includes("123456"));
  assert.ok(t.includes("Acme & Co is regulated."));
  assert.ok(!t.includes("<br"));
});

test("quotes the regulatory paragraph with its FRN and company number", () => {
  const [s] = findStatements(
    "Monzo Bank Limited is a company registered in England and Wales (No.09446231). Monzo Bank Limited is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority. Our financial Services Register number is 730427.",
  );
  assert.deepEqual(s.frns, ["730427"]);
  assert.deepEqual(s.companyNumbers, ["09446231"]);
});

test("recognises common FRN wordings", () => {
  const frn = (t: string) => findStatements(t)[0]?.frns;
  assert.deepEqual(frn("Wise is authorised by the Financial Conduct Authority, Firm Reference 900507 , for e-money."), ["900507"]);
  assert.deepEqual(frn("We are authorised by the Financial Conduct Authority as an EMI (Firm Ref. No. 902028)."), ["902028"]);
  assert.deepEqual(frn("Remitly U.K., Ltd is authorised by the Financial Conduct Authority, FCA Register No. 1047222."), ["1047222"]);
});

test("an FRN is not taken from text that does not mention the regulator", () => {
  assert.equal(findStatements("Call us on reference number 123456 for your order status.").length, 0);
});

test("a company number line counts only beside a regulator paragraph", () => {
  const alone = findStatements("167 Great Portland Street, London. Company registration number: 07110878");
  assert.equal(alone.length, 0);
  const beside = findStatements(
    "167 Great Portland Street, London. Company registration number: 07110878\nWorldRemit Ltd is Authorised and Regulated by the Financial Conduct Authority (FCA). Registration number: 900891.",
  );
  assert.deepEqual(beside.map((s) => s.companyNumbers.length || s.frns.length), [1, 1]);
});

test("company numbers are normalised to Companies House form", () => {
  assert.equal(normaliseCompanyNumber("990937"), "00990937");
  assert.equal(normaliseCompanyNumber("SC95237"), "SC095237");
  assert.equal(normaliseCompanyNumber("sc095237"), "SC095237");
});

const rec = (numbers: string[][]): DisclosureRecord => ({
  slug: "x",
  url: "https://example.com/",
  fetchedAt: "2026-09-30T00:00:00Z",
  status: "found",
  statements: numbers.map((companyNumbers) => ({ text: "t", frns: [], companyNumbers })),
});

test("stated company numbers are de-duplicated", () => {
  assert.deepEqual(statedCompanyNumbers(rec([["00000001"], ["00000001"], ["00000002"]])), ["00000001", "00000002"]);
  assert.deepEqual(statedCompanyNumbers(rec([[]])), []);
});

test("robots.txt wildcards and anchors are honoured", () => {
  const r = "User-agent: *\nDisallow: /*?\nDisallow: /admin/\nDisallow: /search$\n";
  assert.ok(robotsAllows(r, "/gb/"));
  assert.ok(!robotsAllows(r, "/a?x"));
  assert.ok(!robotsAllows(r, "/admin/x"));
  assert.ok(!robotsAllows(r, "/search"));
  assert.ok(robotsAllows(r, "/search/x"));
  assert.ok(!robotsAllows("User-agent: *\nDisallow: /\n", "/"));
  assert.ok(robotsAllows("User-agent: Googlebot\nDisallow: /\n", "/"));
});

test("follows only same-site links that look legal or regulatory", async () => {
  const { findLegalLinks } = await import("./disclosures.ts");
  const html = `
    <a href="/legal/">Legal</a>
    <a href="/about-us">About us</a>
    <a href="https://other.example/legal">Partner legal</a>
    <a href="/mortgages">Mortgages</a>
    <a href="/docs/terms.pdf">Terms (PDF)</a>
    <a href="/regulatory-information">Important information</a>`;
  const links = findLegalLinks(html, "https://bank.example/");
  assert.deepEqual(links, [
    "https://bank.example/legal/",
    "https://bank.example/regulatory-information",
    "https://bank.example/about-us",
  ]);
});
