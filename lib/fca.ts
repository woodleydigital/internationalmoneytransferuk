/**
 * FCA Financial Services Register API client.
 *
 * Plain code only: values are passed through exactly as the Register returns
 * them (CLAUDE.md, "Data pipeline rules"). Credentials come from the
 * environment and are never committed.
 *
 *   FCA_API_EMAIL  — the email registered at register.fca.org.uk/Developer
 *   FCA_API_KEY    — the key from that registration profile
 */

import { KeyedWindows, SlidingWindow } from "./rate-limit.ts";

const BASE = "https://register.fca.org.uk/services/V0.1";

/**
 * The Register API allows 50 requests per 10 seconds and is meant for
 * user-level look-ups, not bulk use. We stay well under: at most 10 calls per
 * 10 seconds per server instance, and 6 searches a minute per visitor.
 */
const globalLimit = new SlidingWindow(10, 10_000);
const visitorLimit = new KeyedWindows(6, 60_000);

export interface FirmSearchResult {
  name: string;
  frn: string;
  status: string;
  type: string;
}

export type FirmSearch =
  | { kind: "ok"; results: FirmSearchResult[]; checkedAt: string }
  | { kind: "unconfigured" }
  | { kind: "busy" }
  | { kind: "error"; message: string };

export function fcaConfigured(): boolean {
  return Boolean(process.env.FCA_API_EMAIL && process.env.FCA_API_KEY);
}

/** The FCA's own public search, for when the API is unavailable. */
export function registerSearchUrl(query: string): string {
  return `https://register.fca.org.uk/s/search?q=${encodeURIComponent(query)}&type=Companies`;
}

/** Link to the Register's own search for a firm reference number or name. */
export function registerEntryUrl(frn: string): string {
  return registerSearchUrl(frn);
}

/**
 * One look-up for one visitor's search. Results are cached for at most an
 * hour and never stored or added to profiles (the FCA's terms do not allow
 * feeding Register data into another website's tables).
 */
export async function searchFirms(query: string, visitor = "anon"): Promise<FirmSearch> {
  if (!fcaConfigured()) return { kind: "unconfigured" };
  if (!visitorLimit.take(visitor) || !globalLimit.take()) return { kind: "busy" };

  const url = `${BASE}/Search?q=${encodeURIComponent(query)}&type=firm`;
  try {
    const res = await fetch(url, {
      headers: {
        "X-Auth-Email": process.env.FCA_API_EMAIL!,
        "X-Auth-Key": process.env.FCA_API_KEY!,
        Accept: "application/json",
      },
      // The same search within the hour is served from cache rather than asked again.
      next: { revalidate: 3_600 },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return { kind: "error", message: `The FCA Register returned ${res.status}.` };

    const body = (await res.json()) as { Data?: Record<string, string>[] | null };
    const results = (body.Data ?? []).map((d) => ({
      name: d["Name"] ?? "",
      frn: d["Reference Number"] ?? "",
      status: d["Status"] ?? "",
      type: d["Type of business or Individual"] ?? "",
    }));
    return { kind: "ok", results, checkedAt: new Date().toISOString() };
  } catch {
    return { kind: "error", message: "The FCA Register could not be reached." };
  }
}
