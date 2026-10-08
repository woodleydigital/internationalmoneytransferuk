import test from "node:test";
import assert from "node:assert/strict";
import { isProviderSource, SERVICE_PAGES } from "./provider-sources.ts";
import { PROVIDERS } from "./providers.ts";

test("configured help pages are on the exact provider domain or its subdomains", () => {
  for (const [slug, pages] of Object.entries(SERVICE_PAGES)) {
    const provider = PROVIDERS.find((p) => p.slug === slug)!;
    assert.ok(provider?.website, slug);
    for (const url of pages) assert.ok(isProviderSource(url, provider.website!, slug), url);
  }
  assert.equal(isProviderSource("https://help.example.com/fees", "https://www.example.com/"), true);
  assert.equal(isProviderSource("https://fakeexample.com/fees", "https://example.com/"), false);
  assert.equal(isProviderSource("https://example.com.fake.test/fees", "https://example.com/"), false);
});
