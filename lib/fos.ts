/**
 * Financial Ombudsman Service half-yearly business complaints data.
 *
 * The Ombudsman publishes, every six months, the complaints it received and
 * resolved about each business with at least 30 new and 30 resolved cases in
 * the period. We copy the figures as published, under the Ombudsman's own
 * column headings, and never describe or grade them. A business is linked to a
 * provider only when its published name is exactly the registered company name
 * we already hold from Companies House.
 */
import type { Cell } from "./xlsx";

export interface FosFigures {
  /** The business name exactly as the Ombudsman publishes it. */
  business: string;
  group?: string;
  newCases?: number;
  /** New cases by product group, under the Ombudsman's headings. */
  newByProduct: [string, number][];
  /** "Total Proactive Settled Resolved" as published. */
  proactiveSettled?: number;
  /** Share of cases upheld in the consumer's favour, 0–1. */
  upheld?: number;
  upheldByProduct: [string, number][];
}

export interface FosPeriod {
  /** e.g. "H2 2025" */
  label: string;
  /** e.g. "1 July to 31 December 2025" */
  span: string;
  pageUrl: string;
  fileUrl: string;
  /** Average share upheld across all businesses, as the Ombudsman states it. */
  averageUpheld?: string;
}

export interface FosRecord {
  slug: string;
  fetchedAt: string;
  status: "listed" | "not-listed" | "no-company";
  /** The registered company name we matched on. */
  company?: string;
  periods: { period: FosPeriod; figures: FosFigures | null }[];
}

export const PUBLICATION_RULE =
  "The Ombudsman publishes figures only for businesses with at least 30 new and 30 resolved complaints in the six months.";

/** Compare names as Companies House and the Ombudsman write them. */
export function normaliseBusiness(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\bp\.?\s?l\.?\s?c\.?(?=\s|$)/g, "plc")
    .replace(/\bpublic limited company\b/g, "plc")
    .replace(/\blimited\b/g, "ltd")
    .replace(/\bthe\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const num = (c: Cell) => (typeof c === "number" && Number.isFinite(c) ? c : undefined);
const str = (c: Cell) => (typeof c === "string" ? c.trim() : c == null ? "" : String(c));

/** Header text of each product column, from the second header row. */
function headings(rows: Cell[][], from: number, to: number): string[] {
  return Array.from({ length: to - from }, (_, i) => str(rows[1]?.[from + i]));
}

/**
 * Parse the two published sheets. "New cases": name, group, total, then six
 * product columns. "Resolved cases": name, group, proactively settled, total
 * upheld, then six product columns, with averages on the third row.
 */
export function parseFosWorkbook(sheets: Record<string, Cell[][]>): { figures: Map<string, FosFigures>; averageUpheld?: string } {
  const newRows = sheets["New cases"] ?? [];
  const resRows = sheets["Resolved cases"] ?? [];
  if (!newRows.length || !resRows.length) throw new Error("The Ombudsman workbook does not have the expected sheets.");
  if (!/business name/i.test(str(newRows[0]?.[0])) || !/business name/i.test(str(resRows[0]?.[0]))) {
    throw new Error("The Ombudsman workbook columns have changed.");
  }
  const newHeads = headings(newRows, 3, 9);
  const resHeads = headings(resRows, 4, 10);
  const figures = new Map<string, FosFigures>();
  const get = (name: string) => {
    const key = normaliseBusiness(name);
    if (!figures.has(key)) figures.set(key, { business: name, newByProduct: [], upheldByProduct: [] });
    return figures.get(key)!;
  };
  for (const row of newRows.slice(2)) {
    const name = str(row[0]);
    if (!name || /^total/i.test(name)) continue;
    const f = get(name);
    f.group = str(row[1]) && str(row[1]) !== "No Group" ? str(row[1]) : undefined;
    f.newCases = num(row[2]);
    f.newByProduct = newHeads.map((h, i) => [h, num(row[3 + i])] as [string, number | undefined]).filter((x): x is [string, number] => x[1] !== undefined && x[1] > 0);
  }
  for (const row of resRows.slice(3)) {
    const name = str(row[0]);
    if (!name || /^total/i.test(name)) continue;
    const f = get(name);
    f.proactiveSettled = num(row[2]);
    f.upheld = num(row[3]);
    f.upheldByProduct = resHeads.map((h, i) => [h, num(row[4 + i])] as [string, number | undefined]).filter((x): x is [string, number] => x[1] !== undefined);
  }
  const averageUpheld = str(resRows[2]?.[3]) || undefined;
  return { figures, averageUpheld };
}

/** "H2 2025" → "1 July to 31 December 2025". */
export function periodSpan(label: string): string {
  const m = label.match(/^H([12]) (\d{4})$/);
  if (!m) return label;
  return m[1] === "1" ? `1 January to 30 June ${m[2]}` : `1 July to 31 December ${m[2]}`;
}

/** Period pages from the Ombudsman's sitemap, newest first. */
export function periodPages(sitemapXml: string): { label: string; url: string }[] {
  const found = new Map<string, { label: string; url: string; key: number }>();
  for (const m of sitemapXml.matchAll(/<loc>(https:\/\/[^<]*half-yearly-complaints-data-h([12])-(20\d{2}))<\/loc>/g)) {
    const label = `H${m[2]} ${m[3]}`;
    if (!found.has(label)) found.set(label, { label, url: m[1], key: Number(m[3]) * 2 + Number(m[2]) });
  }
  return [...found.values()].sort((a, b) => b.key - a.key).map(({ label, url }) => ({ label, url }));
}

export const percent = (x?: number) => (x === undefined ? "—" : `${Math.round(x * 100)}%`);
