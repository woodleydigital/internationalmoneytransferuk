/**
 * Mid-market reference rates from the Frankfurter API.
 *
 * See docs/seo-build-standard.md §6. These are central bank reference, spot and
 * mid rates. No consumer receives them. Nothing here may be presented as a rate
 * anyone will be given.
 *
 * We use the blended rate rather than a single provider: verified 2026-09-02,
 * Bank of England lagged the blend by five days and covers only 27 currencies,
 * excluding AED. See docs/build-spec.md §1.5.
 */

const API = "https://api.frankfurter.dev/v2";

/** Frankfurter's own cache TTL is ~19h; revalidate more often so a new publication lands promptly. */
const REVALIDATE_SECONDS = 21_600; // 6 hours

export interface MidRate {
  base: string;
  quote: string;
  /** Target units per 1 base unit. */
  rate: number;
  /** The date the API actually returned — never assume it is today. */
  date: string;
  /** How many central bank sources contributed to the blend, when known. */
  providerCount?: number;
}

interface RateResponse {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

interface ExpandedRecord extends RateResponse {
  providers?: { key: string; date: string; rate: number }[];
}

/**
 * Fetch the blended mid-market rate. Returns null on any failure so the caller
 * can degrade honestly rather than render a fabricated or stale-as-current
 * figure (build-spec §1.4).
 */
export async function getMidRate(base: string, quote: string): Promise<MidRate | null> {
  if (base === quote) {
    return { base, quote, rate: 1, date: new Date().toISOString().slice(0, 10) };
  }

  const url = `${API}/rates?base=${encodeURIComponent(base)}&quotes=${encodeURIComponent(quote)}&expand=providers`;

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;

    const body: unknown = await res.json();
    const records = Array.isArray(body) ? (body as ExpandedRecord[]) : [body as ExpandedRecord];
    const record = records.find((r) => r?.quote === quote && typeof r?.rate === "number");
    if (!record || !Number.isFinite(record.rate) || record.rate <= 0) return null;

    return {
      base: record.base,
      quote: record.quote,
      rate: record.rate,
      date: record.date,
      providerCount: record.providers?.length,
    };
  } catch {
    return null;
  }
}

/**
 * Corridors for large-value transfers (standard §4.2). Deliberately not the full
 * 165-currency list: these follow our use cases, and a short list is a better
 * control for the audience than an exhaustive one.
 */
export const CORRIDOR_CURRENCIES: { code: string; name: string }[] = [
  { code: "GBP", name: "British pound" },
  { code: "EUR", name: "Euro" },
  { code: "USD", name: "US dollar" },
  { code: "AUD", name: "Australian dollar" },
  { code: "NZD", name: "New Zealand dollar" },
  { code: "CAD", name: "Canadian dollar" },
  { code: "AED", name: "UAE dirham" },
  { code: "CHF", name: "Swiss franc" },
  { code: "ZAR", name: "South African rand" },
  { code: "SGD", name: "Singapore dollar" },
  { code: "HKD", name: "Hong Kong dollar" },
];

export const isSupportedCurrency = (code: string): boolean =>
  CORRIDOR_CURRENCIES.some((c) => c.code === code);
