/**
 * Daily mid-market reference rates against the pound, from the Frankfurter
 * API (a blend of central bank publications). These are reference rates, not
 * live prices: no consumer is offered them, and nothing here may be presented
 * as a rate a provider will give.
 *
 * If the API fails, or its latest publication is older than MAX_AGE_DAYS, the
 * table is not shown at all rather than showing an old figure as current.
 */

const API = "https://api.frankfurter.dev/v2";
const REVALIDATE_SECONDS = 21_600; // 6 hours, as for the margin checker
export const MAX_AGE_DAYS = 5;
/** A currency is shown only when at least this many central banks feed its blend. */
export const MIN_SOURCES = 3;

/** Currencies people commonly send to from the UK. Order is the display order. */
export const TABLE_CURRENCIES: { code: string; name: string }[] = [
  { code: "EUR", name: "Euro" },
  { code: "USD", name: "US dollar" },
  { code: "INR", name: "Indian rupee" },
  { code: "NGN", name: "Nigerian naira" },
  { code: "PKR", name: "Pakistani rupee" },
  { code: "PHP", name: "Philippine peso" },
  { code: "PLN", name: "Polish zloty" },
  { code: "CNY", name: "Chinese yuan" },
  { code: "AUD", name: "Australian dollar" },
  { code: "CAD", name: "Canadian dollar" },
  { code: "ZAR", name: "South African rand" },
  { code: "KES", name: "Kenyan shilling" },
  { code: "GHS", name: "Ghanaian cedi" },
  { code: "BDT", name: "Bangladeshi taka" },
  { code: "TRY", name: "Turkish lira" },
  { code: "CHF", name: "Swiss franc" },
  { code: "JPY", name: "Japanese yen" },
  { code: "NZD", name: "New Zealand dollar" },
];

/** The currencies shown in the one-line homepage summary. */
export const STRIP_CURRENCIES = ["EUR", "USD", "INR", "NGN", "PKR", "PLN"];

export interface ApiRecord {
  date: string;
  base: string;
  quote: string;
  rate: number;
  providers?: { key: string; date: string; rate: number; excluded?: boolean }[];
}

export interface RateRow {
  code: string;
  name: string;
  /** Units of this currency per 1 GBP. */
  rate: number;
  /** The publication date the API returned for this currency. */
  date: string;
  /** Central bank publications in the blend. */
  sources: number;
  /** Percentage change in units per pound over 7 and 30 days, when history allows. */
  change7?: number;
  change30?: number;
}

export interface RateTable {
  base: "GBP";
  /** The most recent publication date across the rows. */
  date: string;
  rows: RateRow[];
}

const DAY = 86_400_000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** The rate on the latest date on or before `on`, from a date-ordered history. */
function rateOn(history: ApiRecord[], code: string, on: string): number | undefined {
  let found: number | undefined;
  for (const r of history) if (r.quote === code && r.date <= on) found = r.rate;
  return found;
}

const pct = (now: number, then?: number) => (then ? ((now - then) / then) * 100 : undefined);

/**
 * Pure: turn API responses into display rows. Rows are dropped when the rate
 * is invalid, too few central banks contribute, or the publication is stale.
 */
export function buildRows(latest: ApiRecord[], history: ApiRecord[], now = new Date()): RateTable | null {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const rows: RateRow[] = [];
  for (const c of TABLE_CURRENCIES) {
    const r = latest.find((x) => x.quote === c.code);
    if (!r || !Number.isFinite(r.rate) || r.rate <= 0) continue;
    if (now.getTime() - new Date(`${r.date}T00:00:00Z`).getTime() > MAX_AGE_DAYS * DAY) continue;
    const sources = (r.providers ?? []).filter((p) => !p.excluded).length;
    if (sources < MIN_SOURCES) continue;
    const at = new Date(`${r.date}T00:00:00Z`).getTime();
    rows.push({
      code: c.code,
      name: c.name,
      rate: r.rate,
      date: r.date,
      sources,
      change7: pct(r.rate, rateOn(sorted, c.code, isoDay(new Date(at - 7 * DAY)))),
      change30: pct(r.rate, rateOn(sorted, c.code, isoDay(new Date(at - 30 * DAY)))),
    });
  }
  if (!rows.length) return null;
  return { base: "GBP", date: rows.map((r) => r.date).sort().pop()!, rows };
}

async function get(url: string): Promise<ApiRecord[] | null> {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    return Array.isArray(body) ? (body as ApiRecord[]) : null;
  } catch {
    return null;
  }
}

export async function getRateTable(now = new Date()): Promise<RateTable | null> {
  const quotes = TABLE_CURRENCIES.map((c) => c.code).join(",");
  const from = isoDay(new Date(now.getTime() - 40 * DAY));
  const [latest, history] = await Promise.all([
    get(`${API}/rates?base=GBP&quotes=${quotes}&expand=providers`),
    get(`${API}/rates?base=GBP&quotes=${quotes}&from=${from}`),
  ]);
  if (!latest) return null;
  return buildRows(latest, history ?? [], now);
}

/** "1.1709", "127.28", "1,761.39": four decimals below 10, two above. */
export function formatRate(rate: number): string {
  const dp = rate < 10 ? 4 : 2;
  return new Intl.NumberFormat("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(rate);
}

export function formatChange(p?: number): string {
  if (p === undefined) return "—";
  const v = Math.abs(p) < 0.005 ? 0 : p;
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(2)}%`;
}
