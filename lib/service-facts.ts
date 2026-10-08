/**
 * What a provider says about its own service — countries, payout methods,
 * speed, fees, limits and safeguarding — kept as whole sentences, word for
 * word, from its own website. Plain pattern matching, no AI: a sentence is
 * kept only if it plainly states something on one topic, and it is shown as
 * the provider's claim with its page and date, never as our finding.
 *
 * Marketing superlatives ("cheapest", "best rate", "guaranteed") are dropped:
 * we cannot check them and will not amplify them.
 */

export type Topic = "countries" | "payout" | "speed" | "fees" | "limits" | "safeguarding";

export const TOPIC_LABEL: Record<Topic, string> = {
  countries: "Where it sends money",
  payout: "How recipients are paid",
  speed: "How long transfers take",
  fees: "Fees",
  limits: "Limits",
  safeguarding: "How customer money is protected",
};

export const TOPICS: Topic[] = ["countries", "payout", "speed", "fees", "limits", "safeguarding"];

export interface ServiceQuote {
  topic: Topic;
  text: string;
  /** The page the sentence was read from. */
  url: string;
}

/** Context labels describe the quotation, not independently verified product facts. */
export function quoteContext(q: ServiceQuote): string[] {
  const notes: string[] = [];
  let path = "";
  try { path = new URL(q.url).pathname; } catch { /* malformed source is rejected by the loader */ }
  if (/\/business(?:\/|$)|\/teams(?:\/|$)/i.test(path) || /\b(?:business|teams|suppliers|payroll)\b/i.test(q.text)) {
    notes.push("Business service: confirm that this product applies to your transfer.");
  }
  if (/\/(?:send|transfer)-money-to-[a-z-]+/i.test(path)) {
    notes.push("Destination-specific page: this statement is not a limit or promise for every route.");
  }
  if (q.topic === "fees" && /\b(?:from|as low as|starting at)\s*[£$€]?\s*\d/i.test(q.text)) {
    notes.push("Starting price: request a quote for your amount, route and payment method.");
  }
  if (/\b(?:over|above|under|at least|once|verified|eligible|depending|subject to)\b/i.test(q.text)) {
    notes.push("Conditions apply in this sentence: check the linked page for the full terms.");
  }
  if (q.topic === "countries") {
    notes.push("Headline coverage: country and currency counts do not confirm a particular UK-origin route.");
  }
  return notes;
}

export interface ServiceRecord {
  slug: string;
  fetchedAt: string;
  status: "found" | "none" | "blocked" | "error";
  /** Every page read, for the audit trail. */
  pages: string[];
  quotes: ServiceQuote[];
  error?: string;
}

const MONEY = /(?:[£$€]\s?\d[\d,.]*(?:\s?(?:k|m|million|bn))?|\b\d[\d,.]*\s?(?:GBP|USD|EUR|pounds?)\b)/i;
const PERCENT = /\b\d+(?:\.\d+)?\s?%/;

const RULES: Record<Topic, (s: string) => boolean> = {
  countries: (s) => /\b\d{2,3}\s?\+?\s?(?:countries|currencies|territories|destinations)\b/i.test(s),
  payout: (s) =>
    /\b(?:cash (?:pick[- ]?up|collection)|mobile (?:wallet|money)|home delivery|airtime top[- ]?up|bank deposit)s?\b/i.test(s) ||
    (/\b(?:straight|directly) (?:in)?to (?:their|a|your recipient'?s?) (?:bank account|mobile wallet|card)\b/i.test(s)),
  speed: (s) =>
    /\b(?:arrive|arrives|delivered|deliver|reach|reaches|receive|received|land|lands|credited)\b/i.test(s) &&
    /\b(?:in|within|under|same|next)\s(?:\d+|a few|seconds?|minutes?|hours?|one|two|three|day|working|business)\b/i.test(s) &&
    /\b(?:seconds?|minutes?|hours?|days?)\b/i.test(s) &&
    !/\b(?:card|post|PIN|letter|statement|copy|returned|refund\w*|notice)\b/i.test(s),
  fees: (s) =>
    /\bfees?\b/i.test(s) &&
    (MONEY.test(s) || PERCENT.test(s) || /\b(?:no|zero|fixed|flat|free of|fee[- ]free|without)\b[^.]{0,20}\bfees?\b/i.test(s)),
  limits: (s) =>
    /\b(?:limit|limits|maximum|minimum|up to|as little as|at least|no more than)\b/i.test(s) && MONEY.test(s) &&
    /\b(?:send|transfer|payment|transaction|day|daily|month|year|per)\b/i.test(s),
  safeguarding: (s) =>
    /\bsafeguard(?:s|ed|ing)?\b/i.test(s) && /\b(?:money|funds)\b/i.test(s) && !/\b(?:fraud|crime|scams?|security tools|assets)\b/i.test(s),
};

/** The sentence must be about sending money, not another product. */
const TRANSFER = /\b(?:transfers?|send|sending|sent|international payments?|payments? abroad|overseas|abroad|recipients?|remit\w*|money transfer|foreign currency|currenc(?:y|ies)|exchange)\b/i;
const OTHER_PRODUCT = /\b(?:ISAs?|invest(?:ment|ing|ors?)?s?|mortgages?|loans?|credit cards?|APR|cashback|savings?|pensions?|FSCS|interest|overdrafts?|balance transfers?|crypto\w*|PIN|cash machines?|ATMs?|withdraw\w*|bonus(?:es)?|referr?als?|refer a friend|donations?|tax|insurance|equities|shares|trading|cash back)\b/i;
/** Fees and limits on cards, spending or balances are not transfer fees. */
const CARD_SPENDING = /\b(?:debit cards?|credit limit|card spending|spend\w*|purchases?|holiday|travel|currency cards?|prepaid|non-sterling|transactions? in a foreign currency|balances?)\b/i;
/** Fees paid for something else (school, property), or charged on card use, are not the provider's transfer fee. */
const OTHER_FEES = /\b(?:tuition|boarding|education|reservation|school|university|property|legal) fees\b|\b(?:a|your|the) card\b|\btransactions? you make\b/i;

/**
 * Sentences checked and rejected because, in context, they are not the
 * provider's statement about its own service (e.g. rows of a comparison table).
 */
export const REJECTED_QUOTES = [
  "Transfer fee £10–£30 per payment Variable",
  "Transfers typically run from £10,000 to £1 million",
];

/** US-only terms do not apply to someone sending from the UK. */
const US_ONLY = /\bU\.S\.|\bUS residents?\b|\bUnited States\b/;
const PROMO = /\b(?:first (?:online )?transfer|promo\w*|use code|code:|offers?|new users?|new customers?|special (?:rates?|offers?)|welcome)\b/i;
const ABOUT_OTHERS = /\b(?:high[- ]street banks?|banks typically|brokers typically|(?:most|other|typical) (?:UK )?banks|for most banks|other providers|competitors?|compared (?:to|with))\b/i;

const SUPERLATIVE = /\b(?:cheapest|best|lowest|fastest|number one|no\.?\s?1|#1|guarantee[ds]?|unbeatable|award[- ]winning|beat any)\b/i;
const JUNK = /^FX:|cookie|javascript|\{|\}|©|copyright|all rights reserved|click here|sign up|log ?in|download the app/i;

/** Split page text into candidate sentences. */
export function sentences(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z£$€0-9])/))
    .map((s) => s.replace(/\[@[^\]]*\]/g, "").replace(/^[\s•·\-–—*]+/, "").replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 40 && s.length <= 320 && /[a-z]/.test(s) && /\s/.test(s));
}

/** Sentences on each topic, word for word; a sentence counts once, under its first topic. */
export function findServiceQuotes(text: string, url: string): ServiceQuote[] {
  const out: ServiceQuote[] = [];
  const seen = new Set<string>();
  for (const s of sentences(text)) {
    if (SUPERLATIVE.test(s) || JUNK.test(s) || PROMO.test(s) || ABOUT_OTHERS.test(s)) continue;
    if (s.includes(" | ") || /[?:]$/.test(s)) continue; // page titles, FAQ questions, list lead-ins
    if (/^[a-z]/.test(s) || /(?:\b(?:and|or|of|the|to|in|with)|%)$/.test(s)) continue; // fragments
    if (/^(?:Of|And|Or|But)\s/.test(s)) continue;
    if ((s.match(/\(/g) ?? []).length !== (s.match(/\)/g) ?? []).length) continue;
    if (US_ONLY.test(s)) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    const topic = TOPICS.find((t) => RULES[t](s));
    if (!topic) continue;
    // Safeguarding sentences stand alone; every other topic must be about transfers.
    if (topic !== "safeguarding" && (!TRANSFER.test(s) || OTHER_PRODUCT.test(s))) continue;
    if ((topic === "fees" || topic === "limits") && CARD_SPENDING.test(s)) continue;
    if (topic === "countries" && (CARD_SPENDING.test(s) || /\b(?:compare|track|monitor)\b.*\bcurrenc/i.test(s))) continue;
    if (topic === "fees" && OTHER_FEES.test(s)) continue;
    if (REJECTED_QUOTES.some((r) => s.startsWith(r))) continue;
    seen.add(key);
    out.push({ topic, text: s, url });
  }
  return out;
}

/** Merge quotes, dropping repeats and near-repeats, keeping at most `perTopic` each. */
const words = (t: string) => new Set(t.toLowerCase().replace(/[^a-z ]+/g, " ").split(/\s+/).filter((w) => w.length > 2));

/** True when two sentences say nearly the same thing (one contains the other, or 75% shared words). */
export function nearDuplicate(a: string, b: string): boolean {
  // Different prices, limits and destinations are distinct claims, even when
  // the surrounding template has almost identical wording.
  const numbers = (s: string) => (s.match(/\d+(?:[,.]\d+)*(?:\s*%)?/g) ?? []).map((n) => n.replace(/[,\s]/g, ""));
  const routes = (s: string) => [...s.matchAll(/\b(?:to|from) ([A-Z][a-z]+(?: [A-Z][a-z]+){0,2})\b/g)].map((m) => m[0]);
  if (JSON.stringify(numbers(a)) !== JSON.stringify(numbers(b)) || JSON.stringify(routes(a)) !== JSON.stringify(routes(b))) return false;
  const x = a.toLowerCase().replace(/\s+/g, ""), y = b.toLowerCase().replace(/\s+/g, "");
  if (x.includes(y) || y.includes(x)) return true;
  const A = words(a), B = words(b);
  const shared = [...A].filter((w) => B.has(w)).length;
  return shared / Math.max(1, Math.min(A.size, B.size)) >= 0.75 && shared / Math.max(A.size, B.size) >= 0.6;
}

export function mergeQuotes(into: ServiceQuote[], found: ServiceQuote[], perTopic = 3): ServiceQuote[] {
  const out = [...into];
  for (const q of found) {
    if (out.some((o) => nearDuplicate(o.text, q.text))) continue;
    if (out.filter((o) => o.topic === q.topic).length >= perTopic) continue;
    out.push(q);
  }
  return out;
}

const LINK_HINT = /international|abroad|overseas|send[- ]?money|money[- ]?transfer|fee|pric|cost|limit|safeguard|how[- ]it[- ]works|countr|cash[- ]?pick|mobile[- ]?wallet|transfer[- ]time|help|faq/i;

/** The site's own pages most likely to describe its service, best first. */
export function findServiceLinks(html: string, base: string, max = 6): string[] {
  const origin = new URL(base);
  const host = origin.hostname.replace(/^www\./, "");
  const scored = new Map<string, number>();
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let u: URL;
    try {
      u = new URL(m[1].replace(/&amp;/g, "&"), base);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(u.protocol) || u.hostname.replace(/^www\./, "") !== host) continue;
    if (/\.(pdf|jpg|png|zip)$/i.test(u.pathname)) continue;
    const label = m[2].replace(/<[^>]+>/g, " ");
    const hay = `${u.pathname} ${label}`;
    if (!LINK_HINT.test(hay)) continue;
    // Pricing, limits and safeguarding pages first; general help last.
    const score = /international|abroad|overseas|send[- ]?money|money[- ]?transfer/i.test(hay)
      ? 4
      : /fee|pric|limit|safeguard/i.test(hay)
        ? 3
        : /help|faq/i.test(hay)
          ? 1
          : 2;
    const key = `${u.origin}${u.pathname}`;
    if (key === `${origin.origin}${origin.pathname}`) continue;
    scored.set(key, Math.max(scored.get(key) ?? 0, score));
  }
  return [...scored.entries()].sort((a, b) => b[1] - a[1]).slice(0, max).map(([u]) => u);
}
