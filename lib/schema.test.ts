import { test } from "node:test";
import assert from "node:assert/strict";
import { pageGraph, providerList, providerNode, siteGraph, latest } from "./schema.ts";
import { makeEntry } from "./directory.ts";
import type { Provider } from "./providers.ts";
import type { CompanyRecord } from "./companies-house.ts";
import type { DisclosureRecord } from "./disclosures.ts";

const wise: Provider = { slug: "wise", name: "Wise", kind: "transfer", phase: 1, indexWhenVerified: true, website: "https://wise.com/gb/" };
const company: CompanyRecord = {
  slug: "wise", fetchedAt: "2026-10-01T00:00:00Z", status: "matched",
  match: { query: "", rule: "", candidates: [], outcome: "" },
  company: {
    name: "WISE PAYMENTS LIMITED", number: "07209813", incorporated: "2010-04-08", sicCodes: [],
    registeredOffice: "Worship Square, 65 Clifton Street, London, EC2A 4JE",
    url: "https://find-and-update.company-information.service.gov.uk/company/07209813",
  },
};
const statement: DisclosureRecord = {
  slug: "wise", url: "https://wise.com/gb/", fetchedAt: "2026-10-02T00:00:00Z", status: "found",
  statements: [{ text: "Wise Payments Limited is authorised by the FCA (FRN 900507).", frns: ["900507"], companyNumbers: [] }],
} as unknown as DisclosureRecord;

/** Every {"@id": …} reference must point at a node defined in the page or site graph. */
function danglingRefs(graph: { "@graph": object[] }, extra: object[] = []): string[] {
  const nodes = [...graph["@graph"], ...extra];
  const defined = new Set<string>();
  const refs: string[] = [];
  const walk = (v: unknown, top: boolean) => {
    if (Array.isArray(v)) return v.forEach((x) => walk(x, false));
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      const keys = Object.keys(o);
      const id = o["@id"];
      if (typeof id === "string") {
        // A bare {"@id"} is a reference; anything with more keys defines a node.
        if (keys.length === 1 && !top) refs.push(id);
        else defined.add(id);
      }
      for (const k of keys) if (k !== "@id") walk(o[k], false);
    }
  };
  nodes.forEach((n) => walk(n, true));
  return refs.filter((r) => !defined.has(r));
}

test("a page graph links WebPage, breadcrumb and site entities by @id", () => {
  const g = pageGraph({ path: "/about/", name: "About", description: "d", type: "AboutPage" }, [{ name: "About" }]);
  const [page, crumbs] = g["@graph"] as Record<string, any>[];
  assert.equal(page["@type"], "AboutPage");
  assert.equal(page.url, "https://internationalmoneytransfer.uk/about/");
  assert.equal(page.inLanguage, "en-GB");
  assert.equal(page.breadcrumb["@id"], crumbs["@id"]);
  assert.deepEqual(crumbs.itemListElement.map((i: any) => i.item), [
    "https://internationalmoneytransfer.uk/",
    "https://internationalmoneytransfer.uk/about/",
  ]);
  assert.deepEqual(danglingRefs(g, siteGraph()["@graph"]), []);
});

test("a provider asserts Companies House facts but never its own FCA claims", () => {
  const node = providerNode(makeEntry(wise, company, statement), "/logos/wise.png") as Record<string, any>;
  assert.equal(node.legalName, "WISE PAYMENTS LIMITED");
  assert.equal(node.identifier.value, "07209813");
  assert.equal(node.foundingDate, "2010-04-08");
  assert.ok(node.sameAs.includes(company.company!.url));
  assert.equal(node.logo, "https://internationalmoneytransfer.uk/logos/wise.png");
  assert.ok(!JSON.stringify(node).includes("900507"));
});

test("without a matched company, no company facts appear", () => {
  const node = providerNode(makeEntry(wise, null, null)) as Record<string, any>;
  for (const k of ["legalName", "identifier", "foundingDate", "address", "logo"]) assert.equal(node[k], undefined);
});

test("the directory list points at canonical profile URLs in the order shown", () => {
  const list = providerList([makeEntry(wise, null, null)], "x", "Providers", "Ascending") as Record<string, any>;
  assert.equal(list.itemListOrder, "https://schema.org/ItemListOrderAscending");
  assert.equal(list.itemListElement[0].url, "https://internationalmoneytransfer.uk/providers/wise/");
  assert.equal(latest([undefined, "2026-10-01", "2026-10-02T09:00:00Z"]), "2026-10-02T09:00:00Z");
});
