/**
 * Provider entities — the directory's source of truth.
 *
 * The list, slugs and phases come from the "Topical map (QDP)" tab of
 * docs/IMT_UK_topical_map.xlsx. Names are the providers' trading names.
 *
 * Regulatory facts (FRN, status, permissions, company number, dates) are NOT
 * stored here and must never be typed in by hand: they arrive from the FCA
 * Register and Companies House ingestion jobs (CLAUDE.md, "Data pipeline
 * rules"). Until a provider has that data it is "register data pending" and
 * `noindex`.
 */

/**
 * How a provider describes its own service. Assigned by us from each
 * provider's website; a browsing aid, not a regulatory status.
 */
export type ProviderKind = "bank" | "transfer" | "broker";

export const KIND_LABEL: Record<ProviderKind, string> = {
  bank: "Bank or building society",
  transfer: "Money transfer service",
  broker: "Currency broker",
};

export const KIND_PLURAL: Record<ProviderKind, string> = {
  bank: "Banks and building societies",
  transfer: "Money transfer services",
  broker: "Currency brokers",
};

export interface Provider {
  slug: string;
  kind: ProviderKind;
  name: string;
  /** Build phase from the topical map. */
  phase: 1 | 2;
  /**
   * The topical map's verdict: phase-1 profiles are intended to be indexed once
   * verified; phase-2 profiles also need confirmed brand demand.
   */
  indexWhenVerified: boolean;
  /**
   * The provider's own UK website, read weekly for its regulatory statement.
   * Configuration, not a fact we publish; omitted where we are not sure of it.
   */
  website?: string;
  /**
   * Extra pages on the provider's own site that carry its regulatory statement,
   * for sites whose homepage does not. Configuration only: the scanner still
   * quotes whatever the page says, word for word.
   */
  statementPages?: string[];
}

// Removed: small-world (2026-10-01) — reported to have stopped processing
// transfers; not listed while that cannot be confirmed from a source we publish.
export const PROVIDERS: Provider[] = [
  { slug: "hsbc", kind: "bank", name: "HSBC", phase: 1, indexWhenVerified: true, website: "https://www.hsbc.co.uk/" },
  { slug: "post-office", kind: "transfer", name: "Post Office", phase: 1, indexWhenVerified: true, website: "https://www.postoffice.co.uk/" },
  { slug: "virgin-money", kind: "bank", name: "Virgin Money", phase: 1, indexWhenVerified: true, website: "https://uk.virginmoney.com/" },
  { slug: "paypal", kind: "transfer", name: "PayPal", phase: 1, indexWhenVerified: true, website: "https://www.paypal.com/uk/home" },
  { slug: "barclays", kind: "bank", name: "Barclays", phase: 1, indexWhenVerified: true, website: "https://www.barclays.co.uk/" },
  { slug: "afro-international", kind: "transfer", name: "Afro International", phase: 1, indexWhenVerified: true },
  { slug: "co-op-bank", kind: "bank", name: "Co-operative Bank", phase: 1, indexWhenVerified: true, website: "https://www.co-operativebank.co.uk/" },
  { slug: "western-union", kind: "transfer", name: "Western Union", phase: 1, indexWhenVerified: true, website: "https://www.westernunion.com/gb/en/home.html" },
  { slug: "lloyds-bank", kind: "bank", name: "Lloyds Bank", phase: 1, indexWhenVerified: true, website: "https://www.lloydsbank.com/" },
  { slug: "tsb", kind: "bank", name: "TSB", phase: 1, indexWhenVerified: true, website: "https://www.tsb.co.uk/" },
  { slug: "moneygram", kind: "transfer", name: "MoneyGram", phase: 1, indexWhenVerified: true, website: "https://www.moneygram.com/gb/en" },
  { slug: "ofx", kind: "broker", name: "OFX", phase: 1, indexWhenVerified: true, website: "https://www.ofx.com/en-gb/" },
  { slug: "santander", kind: "bank", name: "Santander", phase: 1, indexWhenVerified: true, website: "https://www.santander.co.uk/" },
  { slug: "wise", kind: "transfer", name: "Wise", phase: 1, indexWhenVerified: true, website: "https://wise.com/gb/", statementPages: ["https://wise.com/help/articles/2932693/how-is-wise-regulated-in-each-country-and-region"] },
  { slug: "natwest", kind: "bank", name: "NatWest", phase: 2, indexWhenVerified: false, website: "https://www.natwest.com/" },
  { slug: "skrill", kind: "transfer", name: "Skrill", phase: 2, indexWhenVerified: false, website: "https://www.skrill.com/en/" },
  { slug: "monzo", kind: "bank", name: "Monzo", phase: 2, indexWhenVerified: false, website: "https://monzo.com/" },
  { slug: "ramsdens", kind: "transfer", name: "Ramsdens", phase: 2, indexWhenVerified: false, website: "https://www.ramsdensforcash.co.uk/" },
  { slug: "revolut", kind: "transfer", name: "Revolut", phase: 2, indexWhenVerified: false, website: "https://www.revolut.com/en-GB/" },
  { slug: "bank-of-ireland-uk", kind: "bank", name: "Bank of Ireland UK", phase: 2, indexWhenVerified: false, website: "https://www.bankofirelanduk.com/" },
  { slug: "halifax", kind: "bank", name: "Halifax", phase: 2, indexWhenVerified: false, website: "https://www.halifax.co.uk/", statementPages: ["https://www.halifax.co.uk/helpcentre/legal-information/legal-entities.html"] },
  { slug: "john-lewis-finance", kind: "transfer", name: "John Lewis Finance", phase: 2, indexWhenVerified: false, website: "https://www.johnlewisfinance.com/" },
  { slug: "mukuru", kind: "transfer", name: "Mukuru", phase: 2, indexWhenVerified: false, website: "https://www.mukuru.com/uk/" },
  { slug: "nationwide", kind: "bank", name: "Nationwide", phase: 2, indexWhenVerified: false, website: "https://www.nationwide.co.uk/" },
  { slug: "remitly", kind: "transfer", name: "Remitly", phase: 2, indexWhenVerified: false, website: "https://www.remitly.com/gb/en" },
  { slug: "xoom-paypal", kind: "transfer", name: "Xoom", phase: 2, indexWhenVerified: false, website: "https://www.xoom.com/" },
  { slug: "first-direct", kind: "bank", name: "first direct", phase: 2, indexWhenVerified: false, website: "https://www.firstdirect.com/", statementPages: ["https://www.firstdirect.com/legals/"] },
  { slug: "instarem", kind: "transfer", name: "Instarem", phase: 2, indexWhenVerified: false, website: "https://www.instarem.com/en-gb/" },
  { slug: "lemfi", kind: "transfer", name: "LemFi", phase: 2, indexWhenVerified: false, website: "https://lemfi.com/", statementPages: ["https://support.lemfi.com/hc/en-us/articles/4420272430481-Who-We-Are"] },
  { slug: "metro-bank", kind: "bank", name: "Metro Bank", phase: 2, indexWhenVerified: false, website: "https://www.metrobankonline.co.uk/" },
  { slug: "ria", kind: "transfer", name: "Ria", phase: 2, indexWhenVerified: false, website: "https://www.riamoneytransfer.com/en-gb/" },
  { slug: "sendwave", kind: "transfer", name: "Sendwave", phase: 2, indexWhenVerified: false, website: "https://www.sendwave.com/en-gb" },
  { slug: "tesco-bank", kind: "bank", name: "Tesco Bank", phase: 2, indexWhenVerified: false, website: "https://www.tescobank.com/" },
  { slug: "worldremit", kind: "transfer", name: "WorldRemit", phase: 2, indexWhenVerified: false, website: "https://www.worldremit.com/en-gb/" },
  { slug: "xe", kind: "broker", name: "XE", phase: 2, indexWhenVerified: false, website: "https://www.xe.com/", statementPages: ["https://help.xe.com/hc/en-gb/articles/360020447038-United-Kingdom-UK-Corporate-Terms"] },
  // Added beyond the topical map: established UK banks, apps and currency brokers
  // that send money abroad. No search demand measured yet, so never indexed until
  // the topical map is revisited.
  { slug: "torfx", kind: "broker", name: "TorFX", phase: 2, indexWhenVerified: false, website: "https://www.torfx.com/" },
  { slug: "currencies-direct", kind: "broker", name: "Currencies Direct", phase: 2, indexWhenVerified: false, website: "https://www.currenciesdirect.com/" },
  { slug: "moneycorp", kind: "broker", name: "Moneycorp", phase: 2, indexWhenVerified: false, website: "https://www.moneycorp.com/en-gb/" },
  { slug: "key-currency", kind: "broker", name: "Key Currency", phase: 2, indexWhenVerified: false, website: "https://www.keycurrency.co.uk/" },
  { slug: "clear-currency", kind: "broker", name: "Clear Currency", phase: 2, indexWhenVerified: false, website: "https://www.clearcurrency.co.uk/" },
  { slug: "cambridge-currencies", kind: "broker", name: "Cambridge Currencies", phase: 2, indexWhenVerified: false, website: "https://www.cambridgecurrencies.com/" },
  { slug: "global-reach", kind: "broker", name: "Global Reach", phase: 2, indexWhenVerified: false, website: "https://www.globalreachpartners.com/" },
  { slug: "smart-currency-exchange", kind: "broker", name: "Smart Currency Exchange", phase: 2, indexWhenVerified: false, website: "https://www.smartcurrencyexchange.com/" },
  { slug: "halo-financial", kind: "broker", name: "Halo Financial", phase: 2, indexWhenVerified: false, website: "https://www.halofinancial.com/" },
  { slug: "equals-money", kind: "broker", name: "Equals Money", phase: 2, indexWhenVerified: false, website: "https://equalsmoney.com/" },
  { slug: "currency-solutions", kind: "broker", name: "Currency Solutions", phase: 2, indexWhenVerified: false, website: "https://www.currencysolutions.co.uk/" },
  { slug: "transfergo", kind: "transfer", name: "TransferGo", phase: 2, indexWhenVerified: false, website: "https://www.transfergo.com/" },
  { slug: "paysend", kind: "transfer", name: "Paysend", phase: 2, indexWhenVerified: false, website: "https://paysend.com/en-gb" },
  { slug: "taptap-send", kind: "transfer", name: "Taptap Send", phase: 2, indexWhenVerified: false, website: "https://www.taptapsend.com/" },
  { slug: "starling-bank", kind: "bank", name: "Starling Bank", phase: 2, indexWhenVerified: false, website: "https://www.starlingbank.com/" },
  { slug: "chase-uk", kind: "bank", name: "Chase UK", phase: 2, indexWhenVerified: false, website: "https://www.chase.co.uk/" },
  { slug: "royal-bank-of-scotland", kind: "bank", name: "Royal Bank of Scotland", phase: 2, indexWhenVerified: false, website: "https://www.rbs.co.uk/" },
  { slug: "bank-of-scotland", kind: "bank", name: "Bank of Scotland", phase: 2, indexWhenVerified: false, website: "https://www.bankofscotland.co.uk/" },
  { slug: "ulster-bank", kind: "bank", name: "Ulster Bank", phase: 2, indexWhenVerified: false, website: "https://www.ulsterbank.co.uk/" },
  { slug: "ms-bank", kind: "bank", name: "M&S Bank", phase: 2, indexWhenVerified: false, website: "https://bank.marksandspencer.com/" },
  { slug: "caxton", kind: "broker", name: "Caxton", phase: 2, indexWhenVerified: false, website: "https://caxton.io/", statementPages: ["https://caxton.io/legal-hub/terms-and-conditions/caxton-international-payments"] },
  { slug: "hamilton-court-fx", kind: "broker", name: "Hamilton Court FX", phase: 2, indexWhenVerified: false, website: "https://www.hamiltoncourtfx.com/" },
  { slug: "fc-exchange", kind: "broker", name: "FC Exchange", phase: 2, indexWhenVerified: false, website: "https://www.fcexchange.co.uk/" },
  { slug: "pure-fx", kind: "broker", name: "Pure FX", phase: 2, indexWhenVerified: false, website: "https://www.purefx.co.uk/" },
  { slug: "danske-bank", kind: "bank", name: "Danske Bank", phase: 2, indexWhenVerified: false, website: "https://danskebank.co.uk/" },
  { slug: "aib-ni", kind: "bank", name: "AIB (NI)", phase: 2, indexWhenVerified: false, website: "https://aibni.co.uk/" },
  { slug: "handelsbanken", kind: "bank", name: "Handelsbanken", phase: 2, indexWhenVerified: false, website: "https://www.handelsbanken.co.uk/" },
  { slug: "coutts", kind: "bank", name: "Coutts", phase: 2, indexWhenVerified: false, website: "https://www.coutts.com/" },
];

/**
 * Verified means the FCA Register, Companies House and Ombudsman data are all
 * present (Profile schema, "Meta"). Nothing has been ingested yet.
 */
export function isVerified(_p: Provider): boolean {
  return false;
}

/** Only verified profiles the topical map marks for indexing are indexable. */
export function isIndexable(p: Provider): boolean {
  return isVerified(p) && p.indexWhenVerified;
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
 * The profile blocks, from the "Profile schema" tab, adapted for a fully
 * automated site: nothing is tested by hand, and nothing is characterised.
 * Register and company data are copied by code; anything read from a provider's
 * own website is shown with the exact wording and link it came from.
 */
export interface ProfileField {
  block: string;
  field: string;
  source: string;
  /** How the value reaches the page. */
  method: string;
}

const COPIED = "Copied from the source by software";
const QUOTED = "Quoted word for word, with a link to the source";
const EXTRACTED = "Extracted by software, shown with the exact wording it came from";

export const PROFILE_SCHEMA: ProfileField[] = [
  { block: "Identity", field: "Legal name, trading names", source: "FCA Register", method: COPIED },
  { block: "Identity", field: "FCA firm reference number (FRN)", source: "FCA Register", method: COPIED },
  { block: "Identity", field: "Company number, incorporation date, registered office", source: "Companies House", method: COPIED },
  { block: "Identity", field: "Persons with significant control", source: "Companies House", method: COPIED },
  { block: "Regulation", field: "Permission type (API / EMI / small PI / bank)", source: "FCA Register", method: COPIED },
  { block: "Regulation", field: "Status, restrictions and requirements", source: "FCA Register", method: QUOTED },
  { block: "Regulation", field: "Registered agents (count)", source: "FCA Register", method: COPIED },
  { block: "Regulation", field: "How customer money is safeguarded", source: "Provider terms and conditions", method: QUOTED },
  { block: "Financial health", field: "Latest accounts date, overdue accounts flag", source: "Companies House", method: COPIED },
  { block: "Financial health", field: "Revenue and profit (where filed)", source: "Filed accounts at Companies House", method: COPIED },
  { block: "Complaints", field: "Complaint volumes and uphold rate (where published)", source: "Financial Ombudsman Service", method: COPIED },
  { block: "Product", field: "Countries and currencies served", source: "Provider website", method: EXTRACTED },
  { block: "Product", field: "Payout methods (bank, cash pickup, mobile wallet)", source: "Provider website", method: EXTRACTED },
  { block: "Product", field: "Fees, limits, minimums", source: "Provider website", method: EXTRACTED },
  { block: "Product", field: "ID documents required", source: "Provider website", method: EXTRACTED },
];
