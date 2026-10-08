import { test } from "node:test";
import assert from "node:assert/strict";
import { findServiceLinks, findServiceQuotes, findPageServiceQuotes, mergeQuotes, sentences, quoteContext } from "./service-facts.ts";
import { servicePageText } from "./service-page.ts";

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

test("short FAQ answers retain the source question", () => {
  const q = findPageServiceQuotes("Do you charge international transfer fees?\nWe don't charge a transfer fee.\n[IMT-H]Credit cards[/IMT-H]\nThere is a £5 charge for using your card overseas.", "https://example.com/faqs/");
  assert.equal(q.length, 1);
  assert.equal(q[0].topic, "fees");
  assert.equal(q[0].text, "We don't charge a transfer fee.");
});

test("domestic payments, hypothetical examples and complaints are not delivery evidence", () => {
  const text = "CHAPS payments let you send and receive sterling payments on the same day.\nYou want to send £100 to a bank account abroad, in dollars.\nWe will reply to your complaint within 15 business days of receiving the transfer request.\nStore 18 currencies in your Global Money Account.\nUp to £10,000 – 3% mark-up";
  assert.deepEqual(findPageServiceQuotes(text, "https://example.com/international-payments/"), []);
  assert.deepEqual(findPageServiceQuotes("You can send up to £25,000 per day.\nPayments usually arrive the next working day.", "https://example.com/payments/"), []);
});

test("availability, verification and non-numeric limits are captured verbatim", () => {
  assert.equal(findServiceQuotes("Sorry, Chase accounts can’t be used to send or receive money internationally yet.", "https://example.com/international-payments/")[0].topic, "availability");
  assert.equal(findServiceQuotes("We don't have a maximum transfer limit for international payments.", "https://example.com/faqs/")[0].topic, "limits");
  assert.equal(findServiceQuotes("To send money you need to provide proof of identity and proof of address.", "https://example.com/faqs/")[0].topic, "identity");
});

test("fee-table brackets retain the cost question and are not transfer limits", () => {
  const q = findPageServiceQuotes("[IMT-H]How much will it cost to send an international payment from my account?[/IMT-H]\nAll other payments up to £5,000: £10\n[IMT-H]How much money can I send?[/IMT-H]\nYou can send up to £75,000.", "https://example.com/international-payments/");
  assert.equal(q[0].topic, "fees");
  assert.equal(q[0].text, "All other payments up to £5,000: £10");
  assert.equal(q[1].topic, "limits");
});

test("domestic payment variants, promotions and incomplete examples are excluded", () => {
  const text = "You can use the Faster Payment Service (FPS) to send money quickly from your account to other UK bank accounts.\nTake advantage of a great introductory rate across these 7 currencies on your first personal transfer when booked online.\nRecipient would receive around €1,131.39, minus any fees charged by the recipient’s bank or intermediary banks\nAny Online International Payments requested after this time will be processed the next working day.\nHow to Transfer Money from One Bank Account to Another";
  assert.deepEqual(findPageServiceQuotes(text, "https://example.com/international-payments/"), []);
});

test("receiving-account context does not label recipient payouts as incoming transfers", () => {
  assert.match(quoteContext({topic: "fees",text: "All other payments where the payment is up to £100: £2",context: "How much will it cost to receive an international payment into my account?",url: "https://example.com/"}).join(" "), /Receiving payments/);
  assert.equal(quoteContext({topic: "speed",text: "Your recipient receives the money within one working day.",url: "https://example.com/"}).some((s) => s.includes("Receiving payments")), false);
});

test("HTML headings stop fee context leaking into an unrelated product section", () => {
  const text = servicePageText('<main><h2>International transfer fees</h2><p>We charge a £5 transfer fee.</p><h2>Credit cards</h2><p>All other payments up to £5,000: £10</p></main>');
  const q = findPageServiceQuotes(text, "https://example.com/international-payments/");
  assert.deepEqual(q.map((s) => s.text), ["We charge a £5 transfer fee."]);
});

test("a delivery table keeps its currency/route and time in the same quotation", () => {
  const text = servicePageText('<main><h1>International payments</h1><h2>When the money will reach the recipient</h2><table><tr><th>Currency and destination</th><th>Delivery times</th></tr><tr><td><p>Payments in euro to an EEA country.</p></td><td><p>No later than the next working day.</p></td></tr></table></main>');
  const q = findPageServiceQuotes(text, "https://example.com/international-payments/");
  assert.equal(q.length, 1);
  assert.equal(q[0].topic, "speed");
  assert.equal(q[0].text, "Payments in euro to an EEA country. No later than the next working day.");
  assert.equal(q[0].table, true);
});

test("a heading cannot turn privacy safeguards or document processing into transfer protection or delivery", () => {
  assert.deepEqual(findPageServiceQuotes("[IMT-H]Sending large transfers[/IMT-H]\nWe use organizational, technical, and administrative safeguards to secure your personal information.\nOnce we receive the required documents from you, they will be processed within 30 minutes.\n[IMT-H]Why was my transfer cancelled?[/IMT-H]\nYour receiver didn’t pick up the money within 42 days", "https://example.com/faqs/"), []);
});

test("payment-product parent headings stay with identity requirements and timing conditions", () => {
  const text = servicePageText('<main><h1>Making payments</h1><h2>International payments using SWIFT</h2><h3>Online</h3><p>You need to upload proof of identity and proof of address.</p><h2>International payments using SEPA</h2><p>SEPA credit transfers are next-day payments. This is subject to cut-off times and bank holidays.</p></main>');
  const q = findPageServiceQuotes(text, "https://example.com/making-payments/");
  assert.equal(q[0].topic, "identity");
  assert.match(q[0].context!, /SWIFT/);
  assert.equal(q[1].topic, "speed");
  assert.match(q[1].text, /subject to cut-off/);
  assert.ok(!q[1].context!.includes("SWIFT"));
});
test("a closure heading is availability; travel cash and card delivery are excluded", () => {
  const closed = "Thank you for your interest in and past use of the Ramsdens International Money Transfer service but this service is no longer available directly from Ramsdens.";
  const q = findPageServiceQuotes(servicePageText(`<main><h1>${closed}</h1><h2>Ramsdens Mastercard Multi Currency Card FAQs</h2><p>Home delivery of a Ramsdens Multi Currency Card is FREE</p><p>Orders for Ramsdens Multi Currency Cards are typically received within 3 – 5 working days.</p></main>`), "https://example.com/faqs");
  assert.deepEqual(q.map((s) => s.topic), ["availability"]);
  assert.equal(q[0].text, closed);
});
test("article previews and another bank's fees are not provider product evidence", () => {
  assert.deepEqual(findPageServiceQuotes("The US banks charge their customers a flat fee every time they do an international transfer.\nI’ll explain the steps involved, the costs, how long it takes and mistakes… Read article How to Transfer Euros to Pounds in 2026 (without high charges)", "https://example.com/international-transfers"), []);
  assert.match(quoteContext({ topic: "speed", text: "Transfers usually take one working day.", url: "https://example.com/transfer-money-from-us-to-uk/" }).join(" "), /Route-specific/);
});
