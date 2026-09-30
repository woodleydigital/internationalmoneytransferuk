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

export interface Provider {
  slug: string;
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
}

export const PROVIDERS: Provider[] = [
  { slug: "hsbc", name: "HSBC", phase: 1, indexWhenVerified: true, website: "https://www.hsbc.co.uk/" },
  { slug: "post-office", name: "Post Office", phase: 1, indexWhenVerified: true, website: "https://www.postoffice.co.uk/" },
  { slug: "virgin-money", name: "Virgin Money", phase: 1, indexWhenVerified: true, website: "https://uk.virginmoney.com/" },
  { slug: "paypal", name: "PayPal", phase: 1, indexWhenVerified: true, website: "https://www.paypal.com/uk/home" },
  { slug: "barclays", name: "Barclays", phase: 1, indexWhenVerified: true, website: "https://www.barclays.co.uk/" },
  { slug: "afro-international", name: "Afro International", phase: 1, indexWhenVerified: true },
  { slug: "co-op-bank", name: "Co-operative Bank", phase: 1, indexWhenVerified: true, website: "https://www.co-operativebank.co.uk/" },
  { slug: "western-union", name: "Western Union", phase: 1, indexWhenVerified: true, website: "https://www.westernunion.com/gb/en/home.html" },
  { slug: "lloyds-bank", name: "Lloyds Bank", phase: 1, indexWhenVerified: true, website: "https://www.lloydsbank.com/" },
  { slug: "tsb", name: "TSB", phase: 1, indexWhenVerified: true, website: "https://www.tsb.co.uk/" },
  { slug: "moneygram", name: "MoneyGram", phase: 1, indexWhenVerified: true, website: "https://www.moneygram.com/gb/en" },
  { slug: "ofx", name: "OFX", phase: 1, indexWhenVerified: true, website: "https://www.ofx.com/en-gb/" },
  { slug: "santander", name: "Santander", phase: 1, indexWhenVerified: true, website: "https://www.santander.co.uk/" },
  { slug: "wise", name: "Wise", phase: 1, indexWhenVerified: true, website: "https://wise.com/gb/" },
  { slug: "natwest", name: "NatWest", phase: 2, indexWhenVerified: false, website: "https://www.natwest.com/" },
  { slug: "skrill", name: "Skrill", phase: 2, indexWhenVerified: false, website: "https://www.skrill.com/en/" },
  { slug: "monzo", name: "Monzo", phase: 2, indexWhenVerified: false, website: "https://monzo.com/" },
  { slug: "ramsdens", name: "Ramsdens", phase: 2, indexWhenVerified: false, website: "https://www.ramsdensforcash.co.uk/" },
  { slug: "revolut", name: "Revolut", phase: 2, indexWhenVerified: false, website: "https://www.revolut.com/en-GB/" },
  { slug: "bank-of-ireland-uk", name: "Bank of Ireland UK", phase: 2, indexWhenVerified: false, website: "https://www.bankofirelanduk.com/" },
  { slug: "halifax", name: "Halifax", phase: 2, indexWhenVerified: false, website: "https://www.halifax.co.uk/" },
  { slug: "john-lewis-finance", name: "John Lewis Finance", phase: 2, indexWhenVerified: false, website: "https://www.johnlewisfinance.com/" },
  { slug: "mukuru", name: "Mukuru", phase: 2, indexWhenVerified: false, website: "https://www.mukuru.com/uk/" },
  { slug: "nationwide", name: "Nationwide", phase: 2, indexWhenVerified: false, website: "https://www.nationwide.co.uk/" },
  { slug: "remitly", name: "Remitly", phase: 2, indexWhenVerified: false, website: "https://www.remitly.com/gb/en" },
  { slug: "xoom-paypal", name: "Xoom", phase: 2, indexWhenVerified: false, website: "https://www.xoom.com/" },
  { slug: "first-direct", name: "first direct", phase: 2, indexWhenVerified: false, website: "https://www.firstdirect.com/" },
  { slug: "instarem", name: "Instarem", phase: 2, indexWhenVerified: false, website: "https://www.instarem.com/en-gb/" },
  { slug: "lemfi", name: "LemFi", phase: 2, indexWhenVerified: false, website: "https://lemfi.com/" },
  { slug: "metro-bank", name: "Metro Bank", phase: 2, indexWhenVerified: false, website: "https://www.metrobankonline.co.uk/" },
  { slug: "ria", name: "Ria", phase: 2, indexWhenVerified: false, website: "https://www.riamoneytransfer.com/en-gb/" },
  { slug: "sendwave", name: "Sendwave", phase: 2, indexWhenVerified: false, website: "https://www.sendwave.com/en-gb" },
  { slug: "small-world", name: "Small World", phase: 2, indexWhenVerified: false, website: "https://www.smallworldfs.com/en/" },
  { slug: "tesco-bank", name: "Tesco Bank", phase: 2, indexWhenVerified: false, website: "https://www.tescobank.com/" },
  { slug: "worldremit", name: "WorldRemit", phase: 2, indexWhenVerified: false, website: "https://www.worldremit.com/en-gb/" },
  { slug: "xe", name: "XE", phase: 2, indexWhenVerified: false, website: "https://www.xe.com/" },
  // Added beyond the topical map: established UK banks, apps and currency brokers
  // that send money abroad. No search demand measured yet, so never indexed until
  // the topical map is revisited.
  { slug: "torfx", name: "TorFX", phase: 2, indexWhenVerified: false, website: "https://www.torfx.com/" },
  { slug: "currencies-direct", name: "Currencies Direct", phase: 2, indexWhenVerified: false, website: "https://www.currenciesdirect.com/" },
  { slug: "moneycorp", name: "Moneycorp", phase: 2, indexWhenVerified: false, website: "https://www.moneycorp.com/en-gb/" },
  { slug: "key-currency", name: "Key Currency", phase: 2, indexWhenVerified: false, website: "https://www.keycurrency.co.uk/" },
  { slug: "clear-currency", name: "Clear Currency", phase: 2, indexWhenVerified: false, website: "https://www.clearcurrency.co.uk/" },
  { slug: "cambridge-currencies", name: "Cambridge Currencies", phase: 2, indexWhenVerified: false, website: "https://www.cambridgecurrencies.com/" },
  { slug: "global-reach", name: "Global Reach", phase: 2, indexWhenVerified: false, website: "https://www.globalreachpartners.com/" },
  { slug: "smart-currency-exchange", name: "Smart Currency Exchange", phase: 2, indexWhenVerified: false, website: "https://www.smartcurrencyexchange.com/" },
  { slug: "halo-financial", name: "Halo Financial", phase: 2, indexWhenVerified: false, website: "https://www.halofinancial.com/" },
  { slug: "equals-money", name: "Equals Money", phase: 2, indexWhenVerified: false, website: "https://equalsmoney.com/" },
  { slug: "currency-solutions", name: "Currency Solutions", phase: 2, indexWhenVerified: false, website: "https://www.currencysolutions.co.uk/" },
  { slug: "transfergo", name: "TransferGo", phase: 2, indexWhenVerified: false, website: "https://www.transfergo.com/" },
  { slug: "paysend", name: "Paysend", phase: 2, indexWhenVerified: false, website: "https://paysend.com/en-gb" },
  { slug: "taptap-send", name: "Taptap Send", phase: 2, indexWhenVerified: false, website: "https://www.taptapsend.com/" },
  { slug: "starling-bank", name: "Starling Bank", phase: 2, indexWhenVerified: false, website: "https://www.starlingbank.com/" },
  { slug: "chase-uk", name: "Chase UK", phase: 2, indexWhenVerified: false, website: "https://www.chase.co.uk/" },
  { slug: "royal-bank-of-scotland", name: "Royal Bank of Scotland", phase: 2, indexWhenVerified: false, website: "https://www.rbs.co.uk/" },
  { slug: "bank-of-scotland", name: "Bank of Scotland", phase: 2, indexWhenVerified: false, website: "https://www.bankofscotland.co.uk/" },
  { slug: "ulster-bank", name: "Ulster Bank", phase: 2, indexWhenVerified: false, website: "https://www.ulsterbank.co.uk/" },
  { slug: "ms-bank", name: "M&S Bank", phase: 2, indexWhenVerified: false, website: "https://bank.marksandspencer.com/" },
  { slug: "caxton", name: "Caxton", phase: 2, indexWhenVerified: false, website: "https://www.caxton.co.uk/" },
  { slug: "hamilton-court-fx", name: "Hamilton Court FX", phase: 2, indexWhenVerified: false, website: "https://www.hamiltoncourtfx.com/" },
  { slug: "fc-exchange", name: "FC Exchange", phase: 2, indexWhenVerified: false, website: "https://www.fcexchange.co.uk/" },
  { slug: "pure-fx", name: "Pure FX", phase: 2, indexWhenVerified: false, website: "https://www.purefx.co.uk/" },
  { slug: "danske-bank", name: "Danske Bank", phase: 2, indexWhenVerified: false, website: "https://danskebank.co.uk/" },
  { slug: "aib-ni", name: "AIB (NI)", phase: 2, indexWhenVerified: false, website: "https://aibni.co.uk/" },
  { slug: "handelsbanken", name: "Handelsbanken", phase: 2, indexWhenVerified: false, website: "https://www.handelsbanken.co.uk/" },
  { slug: "coutts", name: "Coutts", phase: 2, indexWhenVerified: false, website: "https://www.coutts.com/" },
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
