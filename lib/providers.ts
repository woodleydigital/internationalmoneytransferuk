/**
 * Provider entities — the directory's source of truth.
 *
 * The list, slugs and phases come from the "Topical map (QDP)" tab of
 * docs/IMT_UK_topical_map.xlsx. Names are the providers' trading names.
 *
 * Regulatory facts (FRN, status, permissions, company number, dates) are NOT
 * stored here and must never be typed in by hand: they arrive from the FCA
 * Register and Companies House ingestion jobs (CLAUDE.md, "Data pipeline
 * rules"). Until a provider has that data it is Tier 3 and `noindex`.
 */

export type Tier = 1 | 2 | 3;

export interface Provider {
  slug: string;
  name: string;
  /** Build phase from the topical map. */
  phase: 1 | 2;
  /**
   * The topical map's verdict: phase-1 profiles are intended to be indexed once
   * they reach Tier 2; phase-2 profiles also need confirmed brand demand.
   */
  indexWhenVerified: boolean;
  /** Our sister site's review, where CBUK owns the review (CLAUDE.md split table). */
  cbukReview?: string;
}

const CBUK = "https://www.currencybrokers.uk";

export const PROVIDERS: Provider[] = [
  { slug: "hsbc", name: "HSBC", phase: 1, indexWhenVerified: true },
  { slug: "post-office", name: "Post Office", phase: 1, indexWhenVerified: true },
  { slug: "virgin-money", name: "Virgin Money", phase: 1, indexWhenVerified: true },
  { slug: "paypal", name: "PayPal", phase: 1, indexWhenVerified: true },
  { slug: "barclays", name: "Barclays", phase: 1, indexWhenVerified: true },
  { slug: "afro-international", name: "Afro International", phase: 1, indexWhenVerified: true },
  { slug: "co-op-bank", name: "Co-operative Bank", phase: 1, indexWhenVerified: true },
  { slug: "western-union", name: "Western Union", phase: 1, indexWhenVerified: true },
  { slug: "lloyds-bank", name: "Lloyds Bank", phase: 1, indexWhenVerified: true },
  { slug: "tsb", name: "TSB", phase: 1, indexWhenVerified: true },
  { slug: "moneygram", name: "MoneyGram", phase: 1, indexWhenVerified: true },
  { slug: "ofx", name: "OFX", phase: 1, indexWhenVerified: true, cbukReview: `${CBUK}/reviews/ofx` },
  { slug: "santander", name: "Santander", phase: 1, indexWhenVerified: true },
  { slug: "wise", name: "Wise", phase: 1, indexWhenVerified: true },
  { slug: "natwest", name: "NatWest", phase: 2, indexWhenVerified: false },
  { slug: "skrill", name: "Skrill", phase: 2, indexWhenVerified: false },
  { slug: "monzo", name: "Monzo", phase: 2, indexWhenVerified: false },
  { slug: "ramsdens", name: "Ramsdens", phase: 2, indexWhenVerified: false },
  { slug: "revolut", name: "Revolut", phase: 2, indexWhenVerified: false },
  { slug: "bank-of-ireland-uk", name: "Bank of Ireland UK", phase: 2, indexWhenVerified: false },
  { slug: "halifax", name: "Halifax", phase: 2, indexWhenVerified: false },
  { slug: "john-lewis-finance", name: "John Lewis Finance", phase: 2, indexWhenVerified: false },
  { slug: "mukuru", name: "Mukuru", phase: 2, indexWhenVerified: false },
  { slug: "nationwide", name: "Nationwide", phase: 2, indexWhenVerified: false },
  { slug: "remitly", name: "Remitly", phase: 2, indexWhenVerified: false },
  { slug: "xoom-paypal", name: "Xoom", phase: 2, indexWhenVerified: false },
  { slug: "first-direct", name: "first direct", phase: 2, indexWhenVerified: false },
  { slug: "instarem", name: "Instarem", phase: 2, indexWhenVerified: false },
  { slug: "lemfi", name: "LemFi", phase: 2, indexWhenVerified: false },
  { slug: "metro-bank", name: "Metro Bank", phase: 2, indexWhenVerified: false },
  { slug: "ria", name: "Ria", phase: 2, indexWhenVerified: false },
  { slug: "sendwave", name: "Sendwave", phase: 2, indexWhenVerified: false },
  { slug: "small-world", name: "Small World", phase: 2, indexWhenVerified: false },
  { slug: "tesco-bank", name: "Tesco Bank", phase: 2, indexWhenVerified: false },
  { slug: "worldremit", name: "WorldRemit", phase: 2, indexWhenVerified: false },
  { slug: "xe", name: "XE", phase: 2, indexWhenVerified: false, cbukReview: `${CBUK}/reviews/xe` },
];

/**
 * A profile's tier follows from the data it holds (Profile schema, "Meta").
 * No verified data has been ingested yet, so every profile is Tier 3.
 */
export function tierOf(_p: Provider): Tier {
  return 3;
}

/** Only Tier 1–2 profiles the topical map marks for indexing are indexable. */
export function isIndexable(p: Provider): boolean {
  return tierOf(p) <= 2 && p.indexWhenVerified;
}

export function getProvider(slug: string): Provider | undefined {
  return PROVIDERS.find((p) => p.slug === slug);
}

export const providerUrl = (p: Provider) => `/providers/${p.slug}/`;

/** First character used for the A–Z index; digits are grouped under "#". */
export function initialOf(name: string): string {
  const c = name.trim().charAt(0).toUpperCase();
  return c >= "A" && c <= "Z" ? c : "#";
}

/** Case- and punctuation-insensitive match on name or slug. */
export function searchProviders(query: string, list: Provider[] = PROVIDERS): Provider[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const q = norm(query);
  const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name, "en-GB", { sensitivity: "base" }));
  if (!q) return sorted;
  return sorted.filter((p) => norm(p.name).includes(q) || norm(p.slug).includes(q));
}

/** Group an already-sorted list by initial, preserving order. */
export function groupByInitial(list: Provider[]): [string, Provider[]][] {
  const groups = new Map<string, Provider[]>();
  for (const p of list) {
    const k = initialOf(p.name);
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  return [...groups.entries()];
}

/**
 * The profile blocks, from the "Profile schema" tab. Rendered on every profile
 * so readers can see what will be published, where it comes from, and what is
 * not yet verified.
 */
export interface ProfileField {
  block: string;
  field: string;
  source: string;
  humanReview: string;
}

export const PROFILE_SCHEMA: ProfileField[] = [
  { block: "Identity", field: "Legal name, trading names", source: "FCA Register", humanReview: "No" },
  { block: "Identity", field: "FCA firm reference number (FRN)", source: "FCA Register", humanReview: "No" },
  { block: "Identity", field: "Company number, incorporation date, registered office", source: "Companies House", humanReview: "No" },
  { block: "Identity", field: "Parent company / ultimate owner", source: "Companies House PSC and filings", humanReview: "Yes" },
  { block: "Regulation", field: "Permission type (API / EMI / small PI / bank)", source: "FCA Register", humanReview: "No" },
  { block: "Regulation", field: "Status changes, restrictions, requirements", source: "FCA Register", humanReview: "Yes, before publishing" },
  { block: "Regulation", field: "Safeguarding method (as stated by provider)", source: "Provider terms and conditions", humanReview: "Yes" },
  { block: "Regulation", field: "Registered agents (count)", source: "FCA Register", humanReview: "No" },
  { block: "Financial health", field: "Latest accounts date, overdue accounts flag", source: "Companies House", humanReview: "No" },
  { block: "Financial health", field: "Revenue / profit (where filed)", source: "Companies House filings", humanReview: "Yes" },
  { block: "Complaints", field: "FOS complaint volumes and uphold rate (where published)", source: "Financial Ombudsman Service data", humanReview: "No" },
  { block: "Product", field: "Corridors / currencies served", source: "Provider website", humanReview: "Spot check" },
  { block: "Product", field: "Payout methods (bank, cash pickup, mobile wallet)", source: "Provider website", humanReview: "Spot check" },
  { block: "Product", field: "Fees, limits, minimums", source: "Provider website", humanReview: "Yes, on change" },
  { block: "Product", field: "ID documents required, verification time", source: "Own testing / provider FAQ", humanReview: "Yes" },
  { block: "Testing", field: "Test transfer: total cost vs mid-market, promised vs actual time", source: "Own test transfers", humanReview: "Yes" },
  { block: "Testing", field: "Support response times", source: "Mystery shopping", humanReview: "Yes" },
];
