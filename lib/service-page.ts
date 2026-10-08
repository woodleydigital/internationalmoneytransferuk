import { htmlToText } from "./disclosures.ts";

/** Main content, with exact headings retained for the extraction context. */
export function servicePageText(html: string): string {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  // Raw source-code line wrapping is whitespace, not a paragraph boundary.
  return htmlToText(main.replace(/[\r\n\t]+/g, " ")
    .replace(/<(nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi, "<p>[IMT-H]$1[/IMT-H]</p>"));
}
