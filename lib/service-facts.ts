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

export type Topic = "countries" | "payout" | "speed" | "fees" | "limits" | "safeguarding" | "identity" | "availability";

export const TOPIC_LABEL: Record<Topic, string> = {
  countries: "Where it sends money",
  payout: "How recipients are paid",
  speed: "How long transfers take",
  fees: "Fees",
  limits: "Limits",
  safeguarding: "How customer money is protected",
  identity: "Documents and verification",
  availability: "Service availability",
};

export const TOPICS: Topic[] = ["availability", "countries", "payout", "speed", "fees", "limits", "safeguarding", "identity"];

export interface ServiceQuote {
  topic: Topic;
  text: string;
  /** The page the sentence was read from. */
  url: string;
  /** Nearby source heading/question, copied exactly when an answer needs it. */
  context?: string;
  /** A complete table row: keep route and price/time cells together. */
  table?: true;
}

/** Incoming-account terms are different from a sender's transfer service. */
export function isReceivingQuote(q: ServiceQuote): boolean {
  let path = "";
  try { path = new URL(q.url).pathname; } catch { /* rejected by the loader */ }
  return /\/(?:transfer-money\/(?!uk-to-)[a-z-]+-to-uk|transfer-money-from-[a-z-]+)\/?$/i.test(path) ||
    /\b(?:receiving (?:a |an? )?(?:international )?payments?|cost to receive|incoming|inbound)\b/i.test(q.context ?? "") ||
    /\b(?:you (?:can|cannot|can['’]t) receive (?:international payments|currency)|receive international payments to your account|incoming payments?)\b/i.test(q.text);
}

/** Context labels describe the quotation, not independently verified product facts. */
export function quoteContext(q: ServiceQuote): string[] {
  const notes: string[] = [];
  let path = "";
  try { path = new URL(q.url).pathname; } catch { /* malformed source is rejected by the loader */ }
  if (/\/business(?:\/|$)|\/corporate(?:\/|$)|\/teams(?:\/|$)/i.test(path) || /\b(?:business|teams|suppliers|payroll)\b/i.test(`${q.context ?? ""} ${q.text}`)) {
    notes.push("Business service: confirm that this product applies to your transfer.");
  }
  if (/\/(?:send|transfer)-money-to-[a-z-]+/i.test(path)) {
    notes.push("Destination-specific page: this statement is not a limit or promise for every route.");
  }
  if (/\/transfer-money\/[a-z-]+-to-[a-z-]+|\/transfer-money-from-/i.test(path)) {
    notes.push("Route-specific page: confirm that the stated origin and destination apply to your transfer.");
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
  if (isReceivingQuote(q)) {
    notes.push("Receiving payments: this statement may not describe sending money from the UK.");
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
  /** Failed or excluded page reads, separate from successfully fetched pages. */
  attempts?: { url: string; status: "error" | "blocked" | "redirected"; reason: string }[];
}

const MONEY = /(?:[£$€]\s?\d[\d,.]*(?:\s?(?:k|m|million|bn))?|\b(?:GBP|USD|EUR)\s?\d[\d,.]*|\b\d[\d,.]*\s?(?:GBP|USD|EUR|pounds?)\b)/i;
const PERCENT = /\b\d+(?:\.\d+)?\s?%/;

const RULES: Record<Topic, (s: string) => boolean> = {
  countries: (s) => /\b\d{1,3}\s?\+?\s?(?:countries|currencies|territories|destinations)\b/i.test(s),
  payout: (s) =>
    /\b(?:cash (?:pick[- ]?up|collection)|mobile (?:wallet|money)|home delivery|airtime top[- ]?up|bank deposit)s?\b/i.test(s) ||
    (/\b(?:send|transfer|pay|sent|paid)\b[^.]{0,100}\b(?:to|into)\b[^.]{0,40}\bbank accounts?\b/i.test(s)) ||
    (/\b(?:straight|directly) (?:in)?to (?:their|a|your recipient'?s?) (?:bank account|mobile wallet|card)\b/i.test(s)),
  speed: (s) =>
    (/\b(?:arriv\w*|deliver\w*|reach\w*|receiv\w*|land\w*|credited|completed|processed|take|takes|timeline)\b/i.test(s) || /\btransfers? (?:are|is)\b/i.test(s)) &&
    /\b(?:in|within|under|same|next|up to|take|takes)[ -](?:\d+|a few|seconds?|minutes?|hours?|one|two|three|day|working|business)\b/i.test(s) &&
    /\b(?:seconds?|minutes?|hours?|days?)\b/i.test(s) &&
    !/\b(?:card|post|PIN|letter|statement|copy|returned|refund\w*|notice)\b/i.test(s),
  fees: (s) =>
    /\b(?:fees?|charges?|cost)\b/i.test(s) &&
    (MONEY.test(s) || PERCENT.test(s) || /\b(?:no|zero|fixed|flat|free of|fee[- ]free|without|don['’]t charge|do not charge)\b[^.]{0,30}\b(?:fees?|charges?)\b/i.test(s) ||
      /\b(?:fees?|charges?)\b[^.]{0,60}\b(?:depend|var(?:y|ies)|shown|displayed|listed|before|confirm)\b/i.test(s)),
  limits: (s) =>
    /\b(?:limit|limits|maximum|minimum|up to|as little as|at least|no more than)\b/i.test(s) &&
    (MONEY.test(s) || /\b(?:no|don['’]t have a|do not have a)\b[^.]{0,30}\b(?:maximum|minimum|limits?)\b/i.test(s)) &&
    /\b(?:send|transfer|payment|transaction|day|daily|month|year|per)\b/i.test(s),
  safeguarding: (s) =>
    /\bsafeguard(?:s|ed|ing)?\b/i.test(s) && /\b(?:money|funds)\b/i.test(s) && !/\b(?:fraud|crime|scams?|security tools|assets)\b/i.test(s),
  identity: (s) => /\b(?:passport|driving licen[cs]e|proof of (?:identity|address|funds)|source of funds|identity documents?|photo(?:graphic)? ID)\b/i.test(s) && /\b(?:require|need|ask|provide|upload|verify|verification|accept)\w*\b/i.test(s),
  availability: (s) => /\b(?:can['’]t|cannot)\b[^.]{0,70}\b(?:send|receive|used)\b[^.]{0,70}\binternational(?:ly)?\b/i.test(s) ||
    /\b(?:do not offer|don['’]t offer|not (?:currently )?(?:available|supported)|no longer (?:offer|support))\b[^.]{0,70}\binternational\b/i.test(s) ||
    /\binternational\b[^.]{0,140}\bno longer available\b/i.test(s) ||
    /\b(?:change its name to|brand will operate under|acquired and rebranded)\b/i.test(s) ||
    /\b(?:to (?:make|send) (?:an? )?(?:international )?payment|to send money)\b[^.]{0,90}\b(?:need|must hold|must have)\b[^.]{0,90}\baccount\b/i.test(s),
};

/** The sentence must be about sending money, not another product. */
const TRANSFER = /\b(?:transfers?|send|sending|sent|payments?|overseas|abroad|recipients?|remit\w*|money transfer|foreign currency|currenc(?:y|ies)|exchange)\b/i;
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
const PROMO = /\b(?:first (?:\w+ ){0,3}transfer|introductory|promo\w*|use code|code:|offers?|new users?|new customers?|special (?:rates?|offers?)|welcome)\b/i;
const ABOUT_OTHERS = /\b(?:high[- ]street banks?|banks typically|brokers typically|(?:most|other|typical) (?:UK )?banks|for most banks|other providers|competitors?|compared (?:to|with))\b/i;

const SUPERLATIVE = /\b(?:cheapest|best|lowest|fastest|number one|no\.?\s?1|#1|guarantee[ds]?|unbeatable|award[- ]winning|beat any)\b/i;
const JUNK = /^FX:|cookie|javascript|\{|\}|©|copyright|all rights reserved|click here|sign up|log ?in|download the app/i;

/** A heading can qualify an answer, but cannot supply the fact itself. */
function matchesTopic(topic: Topic, sentence: string, context?: string): boolean {
  const scoped = context ? `${context} ${sentence}` : sentence;
  if (topic === "countries") return RULES.countries(sentence) && !/\b(?:accounts?|clients?|customers?|residents?) (?:in|of|from|across)\b|\bat least \d+ countries\b/i.test(sentence);
  if (["payout", "safeguarding", "availability"].includes(topic)) return RULES[topic](sentence);
  if (topic === "identity") {
    return /\b(?:passport|driving licen[cs]e|proof of (?:identity|address|funds)|source of funds|identity documents?|photo(?:graphic)? ID)\b/i.test(sentence) && RULES.identity(scoped);
  }
  if (topic === "speed") {
    if (/\b(?:documents?|verification|identity checks|didn['’]t|did not|cancelled)\b/i.test(sentence) || /\bplease send\b[^.]{0,90}\byour (?:money|payment)\b/i.test(sentence)) return false;
    return RULES.speed(sentence) || (/\b(?:delivery times|timeline|how long|how fast)\b/i.test(context ?? "") &&
      /\b(?:same|next|\d+|one|two|three)[ -](?:(?:working|business) )?days?\b/i.test(sentence));
  }
  if (topic === "fees") {
    if (RULES.fees(sentence)) return true;
    if (RULES.limits(sentence) && (sentence.match(new RegExp(MONEY.source, "gi")) ?? []).length < 2) return false;
    return /\b(?:fees?|charges?|cost)\b/i.test(context ?? "") && (MONEY.test(sentence) || PERCENT.test(sentence));
  }
  return RULES.limits(sentence);
}

/** Split page text into candidate sentences. */
export function sentences(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z£$€0-9])/))
    .map((s) => s.replace(/\[@[^\]]*\]/g, "").replace(/^[\s•·\-–—*]+/, "").replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 25 && s.length <= 420 && /[a-z]/.test(s) && /\s/.test(s));
}

/** Sentences on each topic, word for word; a sentence counts once, under its first topic. */
export function findServiceQuotes(text: string, url: string, context?: string, table = false): ServiceQuote[] {
  const out: ServiceQuote[] = [];
  const path = new URL(url).pathname;
  // /hc/en-us is a help-centre language label, not a US product locale.
  if (/^\/(?:en-(?:us|nz|au|ca|de|be|pl)|us|nz|au|ca|terms_usa)(?:\/|$)/i.test(path)) return out;
  const seen = new Set<string>();
  const candidates = text.split(/\n+/).flatMap((line) => {
    const paragraph = line.replace(/\s+/g, " ").trim();
    return (table || /\b(?:subject to|depending on|provided that|cut-off times|this is subject)\b/i.test(paragraph)) && paragraph.length >= 25 && paragraph.length <= 420
      ? [paragraph] : sentences(line);
  });
  for (const s of candidates) {
    if (SUPERLATIVE.test(s) || JUNK.test(s) || PROMO.test(s) || ABOUT_OTHERS.test(s) || /\[\/?IMT-|Footnote link/i.test(s)) continue;
    if (/^(?:They|These|This (?:fee|charge|amount))\b|[–—-]$/i.test(s)) continue;
    if (/\bRead (?:article|more)\b|…|\b(?:US|U\.S\.|American) banks?\b|\b(?:firms|companies) are required to\b/i.test(s)) continue;
    if (/^(?:How|What|Where|When|Why)\b/i.test(s)) continue;
    if (s.includes(" | ") || /[?:]$/.test(s)) continue; // page titles, FAQ questions, list lead-ins
    if (/^[a-z]/.test(s) || /(?:\b(?:and|or|of|the|to|in|with)|%)$/.test(s)) continue; // fragments
    if (/^(?:Of|And|Or|But)\s/.test(s)) continue;
    if ((s.match(/\(/g) ?? []).length !== (s.match(/\)/g) ?? []).length) continue;
    if (US_ONLY.test(s)) continue;
    if (/\bto (?:bank )?accounts? in (?:the )?UK\b/i.test(s) && !/\b(?:abroad|overseas|outside (?:of )?(?:the )?UK|international)\b/i.test(s)) continue;
    if (/\b(?:complaints?|holding reply|cancelled|debit(?:ed)?|CHAPS|Faster Payments?|Faster Payment Service|domestic payments?|within the UK|(?:another|other|a) UK bank accounts?|other UK bank accounts?|UK bank transfers?|current account switch|open an? (?:overseas )?bank account|store \d+ currencies|hold (?:and exchange money in |up to )?\d+ currencies|Confirmation of Payee|right place)\b/i.test(s)) continue;
    if (/\b(?:you want to|for example|this is because|handing over cash|cheques?)\b/i.test(s)) continue;
    if (/\b(?:save up to|could save|illustration only|lightning fast|super fast)\b/i.test(s) || /^\(/.test(s)) continue;
    if (/^(?:Wise|Remitly|Revolut|PayPal|Western Union|MoneyGram|OFX|Xe)\s*[: ]+\s*[£$€\d]/i.test(s)) continue;
    if (/\b(?:mark[- ]?up|conversion charge)\b/i.test(s) && /\bup to\b/i.test(s)) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    const scoped = context ? `${context} ${s}` : s;
    if (/\b(?:worked examples?|example transfer costs|illustration|hypothetical)\b/i.test(scoped) || /\b(?:would receive|after this time|before this time|this amount|as shown above|in that case|this means|this way)\b/i.test(s) || /^No later than/i.test(s)) continue;
    if (PROMO.test(context ?? "")) continue;
    const topic = (["availability", "countries", "speed", "fees", "limits", "payout", "safeguarding", "identity"] as Topic[])
      .find((t) => matchesTopic(t, s, context));
    if (!topic) continue;
    // Safeguarding sentences stand alone; every other topic must be about transfers.
    if (topic !== "safeguarding" && (!TRANSFER.test(scoped) || (topic !== "availability" && OTHER_PRODUCT.test(scoped)))) continue;
    if (topic !== "availability" && /\b(?:travel money|multi[- ]currency cards?|currency cards?|prepaid cards?|card FAQs|currency equivalent|per reload)\b/i.test(scoped)) continue;
    if ((topic === "fees" || topic === "limits") && CARD_SPENDING.test(s)) continue;
    if ((topic === "fees" || topic === "countries") && /\bcards?\b/i.test(scoped)) continue;
    if (topic === "countries" && (CARD_SPENDING.test(s) || /\b(?:compare|track|monitor|manage|receipt capture)\b.*\bcurrenc|\b(?:manage your money|receipt capture)\b/i.test(s))) continue;
    if (topic === "fees" && OTHER_FEES.test(s)) continue;
    if (topic === "countries" && !/\b(?:send|sending|transfers?|payments?|pay)\b/i.test(scoped)) continue;
    if (topic === "identity" && !/\b(?:transfers?|payments?|send money|sending money|transaction order form|receive money form|recipient|sender)\b/i.test(scoped) && !/international|money-transfer|send-money|\/sending-money\//i.test(path)) continue;
    if (REJECTED_QUOTES.some((r) => s.startsWith(r))) continue;
    seen.add(key);
    out.push({ topic, text: s, url, ...(context ? { context } : {}), ...(table ? { table: true as const } : {}) });
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
    if (out.some((o) => o.topic === q.topic && o.context === q.context && nearDuplicate(o.text, q.text))) continue;
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
    if (!/^https?:$/.test(u.protocol) || !(u.hostname.replace(/^www\./, "") === host || u.hostname.endsWith(`.${host}`))) continue;
    if (/\.(pdf|jpg|png|zip)$/i.test(u.pathname)) continue;
    const label = m[2].replace(/<[^>]+>/g, " ");
    const hay = `${u.pathname} ${label}`;
    if (!LINK_HINT.test(hay)) continue;
    if (/\/en-(?:us|nz|au|ca|de|be|pl)\b|\/business\/|\/corporate\/|travel|using-your-card|credit-card|overseas-account|account-opening|\/news\/|\/blog\/|\bcurrency (?:converter|calculator)\b/i.test(hay)) continue;
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

/** Keep the local heading with short answers; never borrow context across sections. */
export function findPageServiceQuotes(text: string, url: string): ServiceQuote[] {
  const headings: { level: number; text: string }[] = [];
  let table: string | undefined;
  const out: ServiceQuote[] = [];
  for (const line of text.split(/\n+/).map((s) => s.trim()).filter(Boolean)) {
    if (line === "[IMT-T-END]") { table = undefined; continue; }
    if (line.startsWith("[IMT-T]")) { table = line.replace(/^\[IMT-T\]|\[\/IMT-T\]$/g, "").trim(); continue; }
    const question = /\?$/.test(line) && line.length <= 180;
    const marker = line.match(/^\[IMT-H(?::([1-6]))?\]/);
    const heading = Boolean(marker);
    const content = line.replace(/^\[IMT-H(?::[1-6])?\]|\[\/IMT-H\]$/g, "").trim();
    if (question || heading) {
      const level = marker?.[1] ? Number(marker[1]) : 6;
      if (!marker?.[1]) headings.length = 0;
      while (headings.length && headings[headings.length - 1].level >= level) headings.pop();
      headings.push({ level, text: content });
      // A heading can also be a complete factual sentence without a final stop.
    }
    const meaningful = headings.filter((h) => h.text.length <= 180 && (TRANSFER.test(h.text) || /\bfees?|limits?|safeguard|protected|currencies|countries|verification|identity\b/i.test(h.text)));
    // Parent headings retain the payment product when a child says only
    // "Online" or "By post". Never carry the stack into a sibling section.
    const context = [...meaningful.map((h) => h.text), ...(table ? [table] : [])].slice(-3).join(" — ") || undefined;
    if (headings.some((h) => /\b(?:credit cards?|savings|mortgages?|investments?|Faster Payments?|CHAPS|domestic payments?|worked examples?|example transaction|illustration|spending|refunds?|cancelled|unsuccessful)\b/i.test(h.text))) continue;
    // Price brackets inherit the cost question before classification. Otherwise
    // "payments up to £5,000: £10" looks like a transfer limit in isolation.
    const found = question ? [] : findServiceQuotes(content, url, heading ? undefined : context, Boolean(table))
      .filter((q) => !heading || ["countries", "availability"].includes(q.topic));
    // General bank payments hubs mix UK payments and card spending with the
    // international section. Require explicit international context there.
    const source = new URL(url);
    const transferPage = /international|overseas|abroad|money-transfer|send-money|\/sending-money\/|\/receiving-money\/|foreign-payments|swift|sepa|sending-int-payments|\/faqs?\b|\/faq\b|\/help\/articles\//i.test(source.pathname) || /internationalpayments|moneytransfer/i.test(source.hostname);
    out.push(...found.filter((q) => transferPage || /\b(?:international(?:ly)?|overseas|abroad|remittance|foreign currency|outside (?:the )?UK)\b/i.test(`${q.context ?? ""} ${q.text}`) || ["safeguarding", "countries", "identity", "availability"].includes(q.topic)));
  }
  return mergeQuotes([], out);
}
