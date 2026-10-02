/**
 * Provider logos, taken from the icons each provider publishes on its own
 * website (apple-touch-icon, icon links, web manifest, favicon). Logos are
 * trade marks of their owners and are shown only to identify each provider.
 */

export interface IconCandidate {
  url: string;
  /** Largest stated dimension in pixels; 0 when unknown. */
  size: number;
  /** Preference: apple-touch-icon > sized icon > svg > manifest > favicon. */
  rank: number;
}

const attr = (tag: string, name: string) =>
  tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] ?? "";

/** Icon links declared in a page's <head>, resolved against the page URL. */
export function findIconLinks(html: string, base: string): IconCandidate[] {
  const out: IconCandidate[] = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = attr(tag, "rel").toLowerCase();
    const href = attr(tag, "href");
    if (!href || !/\bicon\b|apple-touch-icon/.test(rel) || /mask-icon/.test(rel)) continue;
    let url: string;
    try {
      url = new URL(href.replace(/&amp;/g, "&"), base).toString();
    } catch {
      continue;
    }
    const sizes = attr(tag, "sizes");
    const size = Math.max(0, ...[...sizes.matchAll(/(\d+)x(\d+)/g)].map((s) => Number(s[1])));
    const svg = /\.svg(\?|$)/i.test(url) || /svg/.test(attr(tag, "type"));
    const rank = rel.includes("apple-touch-icon") ? 4 : size >= 96 ? 3 : svg ? 2 : 1;
    out.push({ url, size, rank });
  }
  return out;
}

/** Best candidate first: highest preference, then largest size. */
export function rankIcons(list: IconCandidate[]): IconCandidate[] {
  return [...list].sort((a, b) => b.rank - a.rank || b.size - a.size);
}

/** File extension from the bytes themselves; null if it is not an image we accept. */
export function imageType(bytes: Uint8Array, contentType = ""): "png" | "jpg" | "svg" | "ico" | "webp" | null {
  const b = bytes;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0xff && b[1] === 0xd8) return "jpg";
  if (b[0] === 0x00 && b[1] === 0x00 && b[2] === 0x01 && b[3] === 0x00) return "ico";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57) return "webp";
  const head = new TextDecoder().decode(b.slice(0, 512)).trimStart().toLowerCase();
  if ((head.startsWith("<svg") || head.startsWith("<?xml")) && head.includes("<svg") || contentType.includes("svg")) {
    // Reject SVGs carrying scripts or event handlers.
    const text = new TextDecoder().decode(b).toLowerCase();
    if (/<script|\son[a-z]+\s*=|javascript:/.test(text)) return null;
    return "svg";
  }
  return null;
}

/** Width of a PNG from its IHDR header (0 if unreadable). */
export function pngWidth(b: Uint8Array): number {
  if (b.length < 24) return 0;
  return ((b[16] << 24) | (b[17] << 16) | (b[18] << 8) | b[19]) >>> 0;
}

export interface LogoRecord {
  file: string;
  source: string;
  fetchedAt: string;
}
