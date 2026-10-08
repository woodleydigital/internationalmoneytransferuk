import { htmlToText } from "./disclosures.ts";

/** Main content, with exact headings retained for the extraction context. */
export function servicePageText(html: string): string {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const tables = main.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (original, body: string) => {
    const rows = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
    const header = rows.find((r) => /<th\b/i.test(r[1]));
    if (!header) return original;
    const columns = htmlToText(header[1]).replace(/\s+/g, " ").trim();
    return rows.filter((r) => r !== header).map((r) => {
      const row = htmlToText(r[1]).replace(/\s+/g, " ").trim();
      // Keep route and amount cells beside their time/price. Long lists keep
      // their paragraph boundaries, with their table headings still attached.
      return `<p>[IMT-T]${columns}[/IMT-T]</p>${row.length <= 420 ? `<p>${row}</p>` : r[1]}<p>[IMT-T-END]</p>`;
    }).join(" ");
  });
  // Raw source-code line wrapping is whitespace, not a paragraph boundary.
  return htmlToText(tables.replace(/[\r\n\t]+/g, " ")
    .replace(/<(header|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_match, level: string, body: string) =>
      `<br><p>[IMT-H:${level}]${htmlToText(body).replace(/\s+/g, " ").trim()}[/IMT-H]</p><br>`));
}
