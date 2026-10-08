/** Explicit primary-source notices about a listed brand; never successor product data. */
export interface ProviderNotice {
  slug: string;
  publisher: string;
  url: string;
  fetchedAt: string;
  /** Historical publication year when the linked notice explicitly dates it. */
  publishedYear?: number;
  quotations: string[];
}
export const NOTICE_SOURCES = [
  { slug: "global-reach", publisher: "Corpay", url: "https://www.corpay.com/faq", name: "Global Reach" },
  { slug: "ramsdens", publisher: "Ramsdens", url: "https://www.ramsdenscurrency.co.uk/international-money-transfers", name: "Ramsdens" },
  { slug: "pure-fx", publisher: "Lumon", url: "https://www.lumonpay.com/help-centre/about-lumon/", name: "Pure FX" },
  { slug: "hamilton-court-fx", publisher: "Hamilton Court", url: "https://hamiltoncourtfx.com/marex-migration/", name: "Hamilton Court" },
  { slug: "fc-exchange", publisher: "Inflexion", url: "https://www.inflexion.com/news-and-insights/news/2016/inflexion-s-global-reach-partners-completes-purchase-of-fc-exchange/", name: "FC Exchange", publishedYear: 2016 },
];

export function extractProviderNotices(text: string, name: string): string[] {
  const sentences = text.split(/\n+/).flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z])/));
  return [...new Set(sentences.map((s) => s.replace(/\s+/g, " ").trim()).filter((s) =>
    s.length >= 25 && s.length <= 420 && s.includes(name) &&
    (/\b(?:acquired and rebranded|completed the acquisition|change its name to|brand will operate under|ceased (?:trading|operations)|no longer (?:offers?|provides?|available))\b/i.test(s) ||
    (/^\d{4}\s*[–—-]/.test(s) && /\bacquires?\b/i.test(s))),
  ))].slice(0, 2);
}
