/** Explicit primary-source notices about a listed brand; never successor product data. */
export interface ProviderNotice {
  slug: string;
  publisher: string;
  url: string;
  fetchedAt: string;
  quotations: string[];
}
export const NOTICE_SOURCES = [
  { slug: "global-reach", publisher: "Corpay", url: "https://www.corpay.com/faq", name: "Global Reach" },
];

export function extractProviderNotices(text: string, name: string): string[] {
  const sentences = text.split(/\n+/).flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z])/));
  return [...new Set(sentences.map((s) => s.replace(/\s+/g, " ").trim()).filter((s) =>
    s.length >= 25 && s.length <= 420 && s.includes(name) &&
    /\b(?:acquired and rebranded|change its name to|brand will operate under|ceased (?:trading|operations)|no longer (?:offers?|provides?))\b/i.test(s),
  ))].slice(0, 2);
}
