/** Exact selectable text from an official PDF; no OCR or generated facts. */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function pdfParagraphs(text: string): string {
  return text.split(/\f|\n\s*\n/).map((paragraph) => {
    const value = paragraph.replace(/\s+/g, " ").trim();
    if (/^(?:\d+(?:\.\d+)*\.?\s+)?(?:international payments|sending payments|receiving payments|fees and charges|transfer limits|identity verification|safeguarding)(?:\s*[:.]?)$/i.test(value)) {
      return `[IMT-H]${value}[/IMT-H]`;
    }
    return value;
  }).filter(Boolean).join("\n");
}

export function servicePdfText(bytes: Uint8Array): string {
  if (bytes.length > 10_000_000 || Buffer.from(bytes.subarray(0, 5)).toString() !== "%PDF-") throw new Error("Invalid or oversized PDF");
  const dir = mkdtempSync(join(tmpdir(), "imtu-source-pdf-"));
  try {
    const file = join(dir, "source.pdf");
    writeFileSync(file, bytes);
    // Reading order keeps two-column terms separate; -layout interleaves
    // their lines and can turn unrelated clauses into a false quotation.
    const text = execFileSync("pdftotext", [file, "-"], { encoding: "utf8", timeout: 20_000, maxBuffer: 4_000_000 });
    if (text.trim().length < 100) throw new Error("PDF has no usable selectable text");
    return pdfParagraphs(text);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
