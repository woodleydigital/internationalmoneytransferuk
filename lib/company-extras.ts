/**
 * More of the public Companies House record for a matched company: previous
 * names, a filing timeline, registered charges, the chain of corporate owners,
 * and headline figures from the latest accounts filed in machine-readable form
 * (iXBRL). Everything is copied from Companies House by plain code; nothing is
 * estimated, and individuals are never named.
 */

export interface TimelineItem {
  date: string;
  /** Companies House filing category, e.g. "accounts", "address", "change-of-name". */
  category: string;
  /** Plain label for the category, plus any date Companies House gives with it. */
  label: string;
  /** Link to the filing on Companies House. */
  url: string;
}

export interface OwnerLink {
  name: string;
  /** Company number when registered at Companies House. */
  number?: string;
  /** Where it is registered, as Companies House records it. */
  registeredIn?: string;
  /** The nature of control, in Companies House's own words. */
  control: string[];
  url?: string;
}

export interface AccountsFigure {
  /** Concept local name in the accounts taxonomy, e.g. "TurnoverRevenue". */
  concept: string;
  label: string;
  value: number;
  /** "GBP", "pure" (a count) or another unit as tagged. */
  unit: string;
  periodEnd: string;
}

export interface CompanyExtras {
  slug: string;
  number: string;
  fetchedAt: string;
  previousNames: { name: string; from?: string; to?: string }[];
  timeline: TimelineItem[];
  charges?: { total: number; satisfied: number; outstanding: number; url: string };
  owners: OwnerLink[];
  accounts?: { madeUpTo?: string; filedOn: string; url: string; figures: AccountsFigure[] };
}

/** Filing categories we show, with plain labels. Officer changes are left out: they name people. */
export const TIMELINE_LABEL: Record<string, string> = {
  incorporation: "Company incorporated",
  "change-of-name": "Company name changed",
  address: "Registered office address changed",
  accounts: "Accounts filed",
  "confirmation-statement": "Confirmation statement filed",
  mortgage: "Charge registered or updated",
  insolvency: "Insolvency filing",
  liquidation: "Liquidation filing",
  resolution: "Resolution filed",
  capital: "Share capital filing",
};

export interface FilingItem {
  date: string;
  category: string;
  type?: string;
  description?: string;
  description_values?: Record<string, string>;
  transaction_id?: string;
  links?: { self?: string; document_metadata?: string };
}

const CH_PUBLIC = "https://find-and-update.company-information.service.gov.uk";

/** Keep the filings we show, newest first, with a plain label and a Companies House link. */
export function summariseFilings(number: string, items: FilingItem[], max = 30): TimelineItem[] {
  return items
    .filter((i) => i.date && TIMELINE_LABEL[i.category])
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, max)
    .map((i) => {
      const madeUp = i.description_values?.made_up_date;
      return {
        date: i.date,
        category: i.category,
        label: i.category === "accounts" && madeUp ? `Accounts filed, made up to ${madeUp}` : TIMELINE_LABEL[i.category],
        url: `${CH_PUBLIC}/company/${number}/filing-history${i.transaction_id ? `/${i.transaction_id}/document?format=pdf&download=0` : ""}`,
      };
    });
}

/** The latest accounts filing that has a document. */
export function latestAccounts(items: FilingItem[]): FilingItem | undefined {
  return items
    .filter((i) => i.category === "accounts" && i.links?.document_metadata)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

/** Headline concepts, by local name, in order of preference within each label. */
export const CONCEPTS: { label: string; names: string[] }[] = [
  { label: "Turnover", names: ["TurnoverRevenue", "Revenue", "TurnoverGrossOperatingRevenue", "RevenueFromContractsWithCustomers"] },
  { label: "Profit or loss for the year", names: ["ProfitLoss", "ProfitLossForPeriod", "ProfitLossOnOrdinaryActivitiesAfterTax"] },
  { label: "Profit or loss before tax", names: ["ProfitLossOnOrdinaryActivitiesBeforeTax", "ProfitLossBeforeTax"] },
  { label: "Net assets", names: ["NetAssetsLiabilities", "NetAssetsLiabilitiesIncludingPensionAssetLiability", "Equity"] },
  { label: "Cash at bank and in hand", names: ["CashBankOnHand", "CashAndCashEquivalents", "CashBankInHand"] },
  { label: "Average number of employees", names: ["AverageNumberEmployeesDuringPeriod", "AverageNumberOfEmployees"] },
];

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1];

/**
 * Read headline figures from an iXBRL accounts document. Only entity-level
 * contexts (no dimensions) are used, and only the latest period end. Values
 * honour the tagged scale and sign. Anything unreadable is skipped.
 */
export function parseIxbrl(html: string): AccountsFigure[] {
  // Contexts: id → period end, entity-level only.
  const ends = new Map<string, string>();
  for (const m of html.matchAll(/<(?:\w+:)?context\b[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/(?:\w+:)?context>/gi)) {
    if (/<(?:\w+:)?(?:segment|scenario)\b/i.test(m[2])) continue;
    const end = m[2].match(/<(?:\w+:)?(?:endDate|instant)>\s*([\d-]{10})\s*</i)?.[1];
    if (end) ends.set(m[1], end);
  }
  const facts: AccountsFigure[] = [];
  for (const m of html.matchAll(/<ix:nonFraction\b([^>]*)>([\s\S]*?)<\/ix:nonFraction>/gi)) {
    const tag = m[1];
    const name = attr(tag, "name")?.split(":").pop();
    const ctx = attr(tag, "contextRef");
    if (!name || !ctx || !ends.has(ctx)) continue;
    const text = m[2].replace(/<[^>]+>/g, "").trim();
    const format = attr(tag, "format") ?? "";
    let value: number;
    if (/zerodash|fixed-zero/i.test(format) || /^[-–—]$/.test(text)) value = 0;
    else {
      const digits = /comma-decimal|numcommadecimal/i.test(format) ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,/g, "");
      value = Number(digits.replace(/[^\d.]/g, ""));
      if (!Number.isFinite(value) || digits.replace(/[^\d]/g, "") === "") continue;
    }
    value *= 10 ** Number(attr(tag, "scale") ?? 0);
    if (attr(tag, "sign") === "-") value = -value;
    const unitRef = (attr(tag, "unitRef") ?? "").toUpperCase();
    facts.push({ concept: name, label: "", value, unit: /GBP/.test(unitRef) ? "GBP" : /PURE|EMPLOYEE|NUMBER/.test(unitRef) ? "pure" : unitRef, periodEnd: ends.get(ctx)! });
  }
  if (!facts.length) return [];
  const latest = facts.map((f) => f.periodEnd).sort().pop()!;
  const out: AccountsFigure[] = [];
  for (const c of CONCEPTS) {
    for (const n of c.names) {
      const f = facts.find((x) => x.concept === n && x.periodEnd === latest);
      if (f) {
        out.push({ ...f, label: c.label });
        break;
      }
    }
  }
  return out;
}

export interface CorporatePsc {
  name: string;
  kind?: string;
  ceased_on?: string;
  natures_of_control?: string[];
  identification?: { registration_number?: string; country_registered?: string; place_registered?: string; legal_form?: string };
}

/** Is this corporate owner registered at Companies House, so we can follow it up the chain? */
export function ukCompanyNumber(p: CorporatePsc): string | undefined {
  const id = p.identification;
  const where = `${id?.country_registered ?? ""} ${id?.place_registered ?? ""}`.toLowerCase();
  const n = id?.registration_number?.replace(/\s+/g, "").toUpperCase();
  if (!n || !/^(?:[A-Z]{2}\d{6}|\d{8}|\d{6,7})$/.test(n)) return undefined;
  if (!/england|wales|scotland|northern ireland|united kingdom|\buk\b|companies house|great britain/.test(where)) return undefined;
  return n.padStart(8, "0");
}

export const controlText = (natures: string[] = []) => natures.map((n) => n.replace(/-/g, " "));

export function formatFigure(f: AccountsFigure): string {
  if (f.unit === "GBP") {
    const abs = Math.abs(f.value);
    const s = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(abs);
    return f.value < 0 ? `−${s}` : s;
  }
  return new Intl.NumberFormat("en-GB").format(f.value);
}
