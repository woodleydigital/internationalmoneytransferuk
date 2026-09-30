/**
 * Companies House Public Data API: client, strict company matching, and the
 * record format the import job writes to data/companies-house/{slug}.json.
 *
 * Plain code only: values are copied from the API as returned (CLAUDE.md, "Data
 * pipeline rules"). Companies House data is reusable under the Open Government
 * Licence v3.0 and must be attributed wherever it is shown.
 *
 * Personal data is minimised at the point of import: for persons with
 * significant control we keep only the name, kind, nature of control and dates.
 * Dates of birth, addresses and nationality are never stored.
 *
 *   COMPANIES_HOUSE_API_KEY — REST key from the Companies House Developer Hub
 */

export const CH_API = "https://api.company-information.service.gov.uk";
export const CH_PUBLIC = "https://find-and-update.company-information.service.gov.uk";

/** SIC codes of firms that can plausibly be a bank or payment provider. */
export const PAYMENT_SIC_CODES = new Set([
  "64191", // banks
  "64192", // building societies
  "64999", // financial intermediation not elsewhere classified
  "66190", // activities auxiliary to financial intermediation n.e.c.
  "66120", // security and commodity contracts dealing
]);

/** Legal-form words a registered name may add after the trading name. */
const SUFFIXES = [
  "",
  "limited",
  "ltd",
  "plc",
  "uk limited",
  "uk ltd",
  "uk plc",
  "bank plc",
  "bank limited",
  "uk bank limited",
  "uk bank plc",
  "payments limited",
  "payments uk limited",
  "international limited",
  "financial services limited",
  "money transfer limited",
  "europe limited",
];

export interface SearchItem {
  title: string;
  company_number: string;
  company_status?: string;
}

export interface CompanyProfile {
  company_name: string;
  company_number: string;
  company_status?: string;
  type?: string;
  date_of_creation?: string;
  sic_codes?: string[];
  registered_office_address?: Record<string, string | undefined>;
  accounts?: {
    last_accounts?: { made_up_to?: string; type?: string };
    next_due?: string;
    overdue?: boolean;
  };
  confirmation_statement?: { last_made_up_to?: string; next_due?: string; overdue?: boolean };
  has_insolvency_history?: boolean;
}

export interface PscItem {
  name?: string;
  kind?: string;
  natures_of_control?: string[];
  notified_on?: string;
  ceased_on?: string;
}

/** Normalise a company name for comparison: lower case, "&" as "and", no punctuation. */
export function normaliseName(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the registered name is exactly the trading name plus an allowed suffix. */
export function nameMatches(tradingName: string, registeredName: string): boolean {
  const base = normaliseName(tradingName);
  const reg = normaliseName(registeredName);
  return SUFFIXES.some((sfx) => reg === (sfx ? `${base} ${sfx}` : base));
}

/** Search hits that pass the name rule and are still active. */
export function nameCandidates(tradingName: string, items: SearchItem[]): SearchItem[] {
  return items.filter(
    (i) => i.company_status === "active" && nameMatches(tradingName, i.title),
  );
}

export type MatchResult =
  | { kind: "matched"; profile: CompanyProfile }
  | { kind: "none" }
  | { kind: "ambiguous"; numbers: string[] };

/**
 * Accept a company only when exactly one active candidate has a matching name
 * and a payment-sector SIC code. Anything else is left unmatched: a wrong match
 * would publish another company's record against a provider's name.
 */
export function pickCompany(profiles: CompanyProfile[]): MatchResult {
  const ok = profiles.filter((p) => (p.sic_codes ?? []).some((c) => PAYMENT_SIC_CODES.has(c)));
  if (ok.length === 1) return { kind: "matched", profile: ok[0] };
  if (ok.length === 0) return { kind: "none" };
  return { kind: "ambiguous", numbers: ok.map((p) => p.company_number) };
}

/** Keep only the PSC fields we publish. */
export function minimisePsc(items: PscItem[]): PscItem[] {
  return items.map(({ name, kind, natures_of_control, notified_on, ceased_on }) => ({
    name,
    kind,
    natures_of_control,
    notified_on,
    ...(ceased_on ? { ceased_on } : {}),
  }));
}

export interface CompanyRecord {
  slug: string;
  fetchedAt: string;
  status: "matched" | "unmatched" | "error";
  /** How the company number was found, so the match can be audited. */
  match: {
    query: string;
    rule: string;
    candidates: { company_number: string; title: string }[];
    outcome: string;
  };
  company?: {
    name: string;
    number: string;
    status?: string;
    type?: string;
    incorporated?: string;
    sicCodes: string[];
    registeredOffice: string;
    lastAccountsMadeUpTo?: string;
    accountsNextDue?: string;
    accountsOverdue?: boolean;
    confirmationStatementOverdue?: boolean;
    hasInsolvencyHistory?: boolean;
    url: string;
  };
  psc?: PscItem[];
  error?: string;
}

export const MATCH_RULE =
  "Searched for the trading name and its UK variant; accepted only because exactly one active company has the trading name plus a legal-form suffix and a banking or payments SIC code.";

export const STATED_RULE =
  "Company number taken from the regulatory statement on the provider's own website, and confirmed against the company's registered name.";

export function formatAddress(a: Record<string, string | undefined> = {}): string {
  return [a.address_line_1, a.address_line_2, a.locality, a.region, a.postal_code, a.country]
    .filter(Boolean)
    .join(", ");
}

export function companySummary(p: CompanyProfile): NonNullable<CompanyRecord["company"]> {
  return {
    name: p.company_name,
    number: p.company_number,
    status: p.company_status,
    type: p.type,
    incorporated: p.date_of_creation,
    sicCodes: p.sic_codes ?? [],
    registeredOffice: formatAddress(p.registered_office_address),
    lastAccountsMadeUpTo: p.accounts?.last_accounts?.made_up_to,
    accountsNextDue: p.accounts?.next_due,
    accountsOverdue: p.accounts?.overdue,
    confirmationStatementOverdue: p.confirmation_statement?.overdue,
    hasInsolvencyHistory: p.has_insolvency_history,
    url: `${CH_PUBLIC}/company/${p.company_number}`,
  };
}

/** Raised when Companies House rejects the key: the whole run is invalid. */
export class AuthError extends Error {}

/** Minimal client. Throws on HTTP errors so the caller can record them. */
export function client(apiKey: string, fetchImpl: typeof fetch = fetch) {
  const auth = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
  async function get<T>(path: string): Promise<T | null> {
    const res = await fetchImpl(`${CH_API}${path}`, { headers: { Authorization: auth } });
    if (res.status === 404) return null;
    if (res.status === 401 || res.status === 403)
      throw new AuthError(`Companies House rejected the API key (${res.status}).`);
    if (!res.ok) throw new Error(`Companies House returned ${res.status} for ${path}`);
    return (await res.json()) as T;
  }
  return {
    search: async (q: string) =>
      (await get<{ items?: SearchItem[] }>(
        `/search/companies?q=${encodeURIComponent(q)}&items_per_page=50`,
      ))?.items ?? [],
    profile: (n: string) => get<CompanyProfile>(`/company/${encodeURIComponent(n)}`),
    psc: async (n: string) =>
      (await get<{ items?: PscItem[] }>(
        `/company/${encodeURIComponent(n)}/persons-with-significant-control?items_per_page=100`,
      ))?.items ?? [],
  };
}
