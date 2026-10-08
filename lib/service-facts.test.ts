import { test } from "node:test";
import assert from "node:assert/strict";
import { findServiceLinks, findServiceQuotes, mergeQuotes, sentences, quoteContext } from "./service-facts.ts";

const page = `
Send money to over 80 countries with a low, upfront fee.
You can invest up to £20,000 per tax year and withdraw your money at any time.
Get £0 transfer fee on your first transfer with code: HELLO.
UK high-street banks typically apply margins of 2–4% plus per-transfer fees of £10–£40.
HSBC Safeguard is a series of initiatives that safeguard your money from fraud.
Your recipient can collect cash at one of 4,000 cash pickup locations, or get it in their mobile wallet.
Most transfers arrive within minutes, and almost all within 24 hours.
Our fee is £0.99 for transfers to Europe.
You can send up to £50,000 per transfer once your account is verified.
We safeguard your money in a separate account at a UK bank, as the FCA requires.
We have the cheapest fees and the best rates, guaranteed.
We use cookies to make the site work.
Short line.`;

test("one sentence per topic, word for word, superlatives and junk dropped", () => {
  const q = findServiceQuotes(page, "https://example.com/");
  const by = (t: string) => q.filter((x) => x.topic === t).map((x) => x.text);
  assert.deepEqual(by("countries"), ["Send money to over 80 countries with a low, upfront fee."]);
  assert.match(by("payout")[0], /cash pickup locations/);
  assert.match(by("speed")[0], /arrive within minutes/);
  assert.deepEqual(by("fees"), ["Our fee is £0.99 for transfers to Europe."]);
  assert.deepEqual(by("limits"), ["You can send up to £50,000 per transfer once your account is verified."]);
  assert.match(by("safeguarding")[0], /safeguard your money/);
  assert.ok(!q.some((x) => /cheapest|cookies|invest|HELLO|high-street|HSBC/.test(x.text)));
});

test("sentences split on full stops and drop fragments", () => {
  assert.deepEqual(sentences("Fees start at £1 for most transfers to Europe. Daily limits apply to all transfers you make.\nOK"), [
    "Fees start at £1 for most transfers to Europe.",
    "Daily limits apply to all transfers you make.",
  ]);
});

test("merge caps each topic and drops near-repeats", () => {
  const a = [{ topic: "fees" as const, text: "Our fee is £1.", url: "u" }];
  const b = [
    { topic: "fees" as const, text: "Our fee is £1. Always.", url: "u" },
    { topic: "fees" as const, text: "B", url: "u" },
    { topic: "fees" as const, text: "C", url: "u" },
  ];
  assert.deepEqual(mergeQuotes(a, b).map((q) => q.text), ["Our fee is £1.", "B", "C"]);
});

test("service links stay on the provider's own site, pricing first", () => {
  const html = `<a href="/help">Help</a><a href="/pricing">Fees</a><a href="https://other.com/fees">x</a><a href="/careers">Jobs</a><a href="/cash-pickup">Cash pickup</a><a href="/international-payments">Send money abroad</a>`;
  assert.deepEqual(findServiceLinks(html, "https://www.example.com/"), [
    "https://www.example.com/international-payments",
    "https://www.example.com/pricing",
    "https://www.example.com/cash-pickup",
    "https://www.example.com/help",
  ]);
});

test("near-duplicates are recognised", async () => {
  const { nearDuplicate } = await import("./service-facts.ts");
  assert.ok(!nearDuplicate("You can send up to $535,000 USD to Albania online.", "You can send up to $535,000 USD to Algeria online."));
  assert.ok(nearDuplicate("It typically finalizes within the same day.", "I t typically finalizes within the same day."));
  assert.ok(!nearDuplicate("Our fee is £1 for transfers to Europe.", "Money usually arrives within minutes to most countries."));
});

test("different prices and limits survive merging", () => {
  const quotes = findServiceQuotes("Our fee is £10 for international money transfers.\nOur fee is £20 for international money transfers.", "https://example.com/");
  assert.equal(mergeQuotes([], quotes).length, 2);
});

test("currency comparison and spending headlines are not transfer coverage", () => {
  assert.deepEqual(findServiceQuotes("Compare 100+ currencies in real time and find the right moment to transfer funds.\nSend, spend and manage your money across 150+ countries.", "https://example.com/"), []);
});

test("business, starting-price and destination context stays attached to the quote", () => {
  assert.match(quoteContext({ topic: "countries", text: "Pay teams in 160 countries.", url: "https://example.com/business/payments/" }).join(" "), /Business service/);
  assert.match(quoteContext({ topic: "limits", text: "You can send up to $535,000 USD to Albania online.", url: "https://example.com/send-money/send-money-to-albania/" }).join(" "), /Destination-specific/);
  assert.match(quoteContext({ topic: "fees", text: "Transfer fees from 0.1% apply.", url: "https://example.com/pricing/" }).join(" "), /Starting price/);
});
