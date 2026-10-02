/**
 * Minimal .xlsx reader: sheet name → rows of cell values (strings or numbers).
 * Reads the cached value of formula cells, which is what the publisher saw.
 * Enough for simple published tables; not a general spreadsheet library.
 */
import { strFromU8, unzipSync } from "fflate";

const decode = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");

/** "C12" → column index 2 (zero-based). */
function colIndex(ref: string): number {
  const letters = ref.match(/^[A-Z]+/)![0];
  return [...letters].reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0) - 1;
}

export type Cell = string | number | null;

export function readXlsx(bytes: Uint8Array): Record<string, Cell[][]> {
  const files = unzipSync(bytes);
  const text = (p: string) => (files[p] ? strFromU8(files[p]) : "");

  const shared = [...text("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    decode([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")),
  );

  const rels = new Map(
    [...text("xl/_rels/workbook.xml.rels").matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map((m) => [
      m[1],
      m[2].replace(/^\/?(xl\/)?/, "xl/"),
    ]),
  );

  const out: Record<string, Cell[][]> = {};
  for (const m of text("xl/workbook.xml").matchAll(/<sheet\b[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)) {
    const xml = text(rels.get(m[2]) ?? "");
    const rows: Cell[][] = [];
    for (const r of xml.matchAll(/<row\b[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
      const row: Cell[] = [];
      for (const c of r[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const ref = c[1].match(/r="([A-Z]+\d+)"/)?.[1];
        if (!ref) continue;
        const type = c[1].match(/t="([^"]+)"/)?.[1];
        const v = c[2]?.match(/<v>([\s\S]*?)<\/v>/)?.[1];
        const inline = c[2]?.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1];
        let value: Cell = null;
        if (type === "s" && v !== undefined) value = shared[Number(v)] ?? null;
        else if (type === "inlineStr" && inline !== undefined) value = decode(inline);
        else if (type === "str" && v !== undefined) value = decode(v);
        else if (v !== undefined) value = Number.isFinite(Number(v)) ? Number(v) : decode(v);
        row[colIndex(ref)] = value;
      }
      rows[Number(r[1]) - 1] = Array.from(row, (x) => x ?? null);
    }
    out[decode(m[1])] = Array.from(rows, (x) => x ?? []);
  }
  return out;
}
