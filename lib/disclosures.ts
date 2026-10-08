/**
 * Regulatory statements published by providers on their own websites.
 *
 * UK payment firms and banks state on their websites that they are authorised,
 * usually with their FCA firm reference number (FRN) and company number. We keep
 * those sentences word for word, with the page and date, and label them as the
 * provider's own statement — they are not FCA Register data and are never shown
 * as verified. Extraction is plain pattern matching; no AI is involved.
 */

export interface Statement {
  /** The sentence exactly as it appears on the page (whitespace collapsed). */
  text: string;
  frns: string[];
  companyNumbers: string[];
  /** The page the sentence was quoted from, when it is not the homepage. */
  url?: string;
}

/** Link text or paths that usually lead to a firm's legal or regulatory details. */
const LEGAL_LINK =
  /\b(legal|regulat\w*|about[- ]us|who we are|company information|important information|terms|disclaimer|our company|corporate)\b/i;

/**
 * Same-site links from a page whose text or path suggests legal or regulatory
 * information, most specific first. Only the provider's own site is followed.
 */
export function findLegalLinks(html: string, base: string, max = 4): string[] {
  const origin = new URL(base);
  const scored: { url: string; score: number }[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let url: URL;
    try {
      url = new URL(m[1].replace(/&amp;/g, "&"), base);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(url.protocol) || url.hostname !== origin.hostname) continue;
    url.hash = "";
    const key = url.toString();
    if (seen.has(key) || key === origin.toString()) continue;
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const hay = `${text} ${decodeURIComponent(url.pathname).replace(/[-_/]/g, " ")}`;
    if (!LEGAL_LINK.test(hay) || /\.(pdf|jpg|png|zip)$/i.test(url.pathname)) continue;
    seen.add(key);
    const score = /regulat|legal|important information|company information/i.test(hay) ? 2 : 1;
    scored.push({ url: key, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, max).map((s) => s.url);
}

export interface DisclosureRecord {
  slug: string;
  url: string;
  fetchedAt: string;
  status: "found" | "none" | "error" | "blocked";
  statements: Statement[];
  error?: string;
}

/** Exclude statements specifically about other products, preserving exact text. */
export function transferStatements(statements: Statement[]): Statement[] {
  const relevant = statements.filter((s) =>
    !/\b(?:insurance|investment services|stocks|prepaid|credit cards?|cash ISAs?)\b/i.test(s.text) ||
    /\b(?:money transfers?|remittance|international payments?|payment services|electronic money institution)\b/i.test(s.text),
  );
  const homeFrns = new Set(relevant.filter((s) => !s.url).flatMap((s) => s.frns));
  return relevant.filter((s) => !s.url || !s.frns.length || !homeFrns.size || s.frns.some((f) => homeFrns.has(f)));
}

const ENTITIES: Record<string, string> = {
  amp: "&", nbsp: " ", quot: '"', apos: "'", lt: "<", gt: ">", copy: "©", reg: "®",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", pound: "£",
};

/** Visible text of an HTML page: scripts, styles and tags removed, entities decoded. */
export function htmlToText(html: string): string {
  return html
    .replace(/[\r\n\t]+/g, " ")
    .replace(/<(script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|p|div|li|tr|h[1-6]|footer|section|address)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    // Markup that was escaped inside embedded data is now literal: strip it too.
    .replace(/<\/?(?:br|p|div|span|a|strong|b|em|i|li|ul)\b[^>]*>/gi, "\n")
    .replace(/\\[rnt]/g, " ")
    .replace(/[ \t\r\f\v ]+/g, " ")
    .replace(/ *\n[\n ]*/g, "\n")
    .trim();
}

// FRNs are quoted only from paragraphs that mention the FCA or PRA.
const FRN_PATTERNS = [
  /\bFirm Reference(?: Number)?(?: \(FRN\))?\s*(?:is|:|no\.?|number)?\s*(\d{6,7})\b/gi,
  /\bFirm Ref\.?(?: No\.?| Number)?\s*:?\s*(\d{6,7})\b/gi,
  /\bFRN\s*(?:no\.?|number|is|:)?\s*(\d{6,7})\b/gi,
  /\bFinancial Services Register (?:under )?(?:number|no\.?|reference)(?: is)?\s*:?\s*(\d{6,7})\b/gi,
  /(?<!company )(?<!company )\b(?:FCA )?(?:registration|register|reference) (?:number|no\.?)(?: is)?\s*:?\s*(\d{6,7})\b/gi,
];

// Companies House numbers: 8 digits, or 2 letters + 6 digits (SC, NI, OC, ...).
const CO = "([A-Z]{2}\\d{5,6}|\\d{6,8})";
const COMPANY_PATTERNS = [
  // Northern Ireland: "Registered in Northern Ireland R568" or "NI012345".
  /\bregistered in Northern Ireland[^.\n]{0,30}?\b(R\d{1,7}|NI\d{6})\b/gi,
  new RegExp(`\\bcompany (?:registration )?(?:number|no\\.?)\\s*:?\\s*${CO}\\b`, "gi"),
  new RegExp(`\\bcompany reg(?:istration|\\.)?\\s*(?:number|no\\.?)\\s*:?\\s*${CO}\\b`, "gi"),
  new RegExp(`\\bregistered (?:company )?(?:number|no\\.?)\\s*:?\\s*${CO}\\b`, "gi"),
  new RegExp(`\\bregistered in (?:England(?: and|&) Wales|England|Scotland|Northern Ireland)[^.\\n]{0,40}?(?:number|no\\.?)\\s*:?\\s*${CO}\\b`, "gi"),
];

const REGULATOR = /Financial Conduct Authority|\bFCA\b|Prudential Regulation Authority|\bPRA\b/;

/** Normalise a company number to Companies House's 8-character form. */
export function normaliseCompanyNumber(n: string): string {
  const s = n.toUpperCase();
  if (/^\d+$/.test(s)) return s.padStart(8, "0");
  if (/^R\d+$/.test(s)) return "R" + s.slice(1).padStart(7, "0");
  return s.slice(0, 2) + s.slice(2).padStart(6, "0");
}

function matchesOf(patterns: RegExp[], text: string): string[] {
  const out = new Set<string>();
  for (const re of patterns) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) out.add(m[1]);
  }
  return [...out];
}

/**
 * Paragraphs of the page's text that state an FRN (next to a mention of the FCA
 * or PRA) or a company number (in, or right beside, such a paragraph). Each is
 * kept whole, word for word, so it can be quoted; marketing copy never matches.
 */
export function findStatements(text: string): Statement[] {
  const lines = text.split("\n").map((l) => l.trim());
  const regulatorAt = lines.map((l) => REGULATOR.test(l));
  const seen = new Set<string>();
  const out: Statement[] = [];
  lines.forEach((line, i) => {
    const key = line.replace(/[.\s]+$/, "").toLowerCase();
    if (line.length < 20 || line.length > 800 || seen.has(key)) return;
    const companyNumbers = matchesOf(COMPANY_PATTERNS, line).map(normaliseCompanyNumber);
    // "Registration number" can precede either; a number that is the company
    // number (leading zeros aside) is not an FRN.
    const asCompany = new Set(companyNumbers.map((c) => c.replace(/^0+/, "")));
    const frns = (regulatorAt[i] ? matchesOf(FRN_PATTERNS, line) : []).filter(
      (f) => !asCompany.has(f.replace(/^0+/, "")),
    );
    const nearRegulator = regulatorAt.slice(Math.max(0, i - 2), i + 3).some(Boolean);
    if (frns.length || (companyNumbers.length && nearRegulator)) {
      seen.add(key);
      out.push({ text: line, frns, companyNumbers });
    }
  });
  return out;
}

// A registered company name: capitalised words ending in a legal form.
const ENTITY = String.raw`((?:The )?[A-Z0-9][\w&'.()\-]*(?: (?:[A-Z0-9(&][\w&'.()\-]*|of|and|for)){0,7}? (?:Limited|Ltd\.?|plc|PLC|p\.l\.c\.|P\.L\.C\.|Public Limited Company|LLP))`;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Legal entities a provider's own statements say are behind its brand:
 * "{brand} is a trading name / business name / division of {E}", "{E} (trading
 * as {brand})", "the Service is provided by {E}", and — in a statement giving
 * the homepage's only FRN — "{E} is authorised/regulated".
 */
export function linkedEntities(statements: Statement[], brand: string): string[] {
  const b = esc(brand).replace(/\\ /g, "\\s+");
  const homeFrns = new Set(statements.filter((s) => !s.url).flatMap((s) => s.frns));
  // One firm on the homepage: a single FRN, or several FRNs all in one sentence
  // (one firm holding more than one permission).
  const oneFirmOnHomepage =
    homeFrns.size === 1 ||
    (homeFrns.size > 1 && statements.some((s) => !s.url && [...homeFrns].every((f) => s.frns.includes(f))));
  const out = new Set<string>();
  const add = (re: RegExp, text: string) => {
    for (const m of text.matchAll(re)) {
      // Keep only the name itself: drop a preceding sentence or "© 2026".
      const name = m[1]
        .split(/\.\s+/)
        .pop()!
        .replace(/^(?:©\s*)?\d{4}\s+/, "")
        .replace(/[.,]$/, "")
        .trim();
      if (name) out.add(name);
    }
  };
  for (const s of statements) {
    add(new RegExp(`${b}(?:\\s+Bank)?,?\\s+(?:is\\s+)?an?\\s+(?:trading|business|brand)\\s+name\\s+of\\s+${ENTITY}`, "gi"), s.text);
    add(new RegExp(`${b}(?:\\s+Bank)?\\s+is\\s+a\\s+division\\s+of\\s+${ENTITY}`, "gi"), s.text);
    add(new RegExp(`${ENTITY}\\s*\\(\\s*(?:trading|t\\/a)\\s+as\\s+[“"]?${b}`, "gi"), s.text);
    add(new RegExp(`(?:service|services)\\s+(?:is|are)\\s+provided\\s+by\\s+${ENTITY}`, "gi"), s.text);
    if (oneFirmOnHomepage && s.frns.some((f) => homeFrns.has(f))) {
      add(new RegExp(`${ENTITY}\\s+(?:is|are)\\s+(?:authorised|regulated)`, "g"), s.text);
    }
  }
  return [...out];
}

/** The distinct company numbers a provider's statements give. */
export function statedCompanyNumbers(rec: DisclosureRecord | null): string[] {
  if (!rec || rec.status !== "found") return [];
  return [...new Set(rec.statements.flatMap((s) => s.companyNumbers))];
}

/** Minimal robots.txt check for our user agent against a path. */
export function robotsAllows(robotsTxt: string, path: string, agent = "IMTUKDirectoryBot"): boolean {
  type Rule = { allow: boolean; path: string };
  const groups: { agents: string[]; rules: Rule[] }[] = [];
  let current = { agents: [] as string[], rules: [] as Rule[] };
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^(user-agent|allow|disallow)\s*:\s*(.*)$/i);
    if (!m) continue;
    const [, key, value] = m;
    if (key.toLowerCase() === "user-agent") {
      if (current.rules.length) { groups.push(current); current = { agents: [], rules: [] }; }
      current.agents.push(value.toLowerCase());
      continue;
    }
    if (!current.agents.length) continue;
    // Even an empty Disallow ends the user-agent list for this group.
    current.rules.push({ allow: key.toLowerCase() === "allow", path: value });
  }
  groups.push(current);
  const matched = groups.map((g) => ({ ...g, score: Math.max(-1, ...g.agents.map((a) => a === "*" ? 0 : a && agent.toLowerCase().includes(a) ? a.length : -1)) }));
  const specificity = Math.max(-1, ...matched.map((g) => g.score));
  const set = matched.filter((g) => specificity >= 0 && g.score === specificity).flatMap((g) => g.rules).filter((r) => r.path);
  // Robots paths are prefixes with "*" wildcards and an optional "$" end anchor.
  const toRe = (p: string) =>
    new RegExp(
      "^" +
        p
          .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
          .replace(/\*/g, ".*")
          .replace(/\\\$$|\$$/, "$"),
    );
  const hits = set.filter((r) => toRe(r.path).test(path));
  if (!hits.length) return true;
  const length = (r: Rule) => r.path.replace(/[*$]/g, "").length;
  const longest = hits.reduce((a, b) => length(b) > length(a) || (length(b) === length(a) && b.allow) ? b : a);
  return longest.allow;
}
