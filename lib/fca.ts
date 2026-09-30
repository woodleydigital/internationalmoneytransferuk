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

const BASE = "https://register.fca.org.uk/services/V0.1";

export interface FirmSearchResult {
  name: string;
  frn: string;
  status: string;
  type: string;
}

export type FirmSearch =
  | { kind: "ok"; results: FirmSearchResult[]; checkedAt: string }
  | { kind: "unconfigured" }
  | { kind: "error"; message: string };

export function fcaConfigured(): boolean {
  return Boolean(process.env.FCA_API_EMAIL && process.env.FCA_API_KEY);
}

/** The FCA's own public search, for when the API is unavailable. */
export function registerSearchUrl(query: string): string {
  return `https://register.fca.org.uk/s/search?q=${encodeURIComponent(query)}&type=Companies`;
}

export async function searchFirms(query: string): Promise<FirmSearch> {
  if (!fcaConfigured()) return { kind: "unconfigured" };

  const url = `${BASE}/Search?q=${encodeURIComponent(query)}&type=firm`;
  try {
    const res = await fetch(url, {
      headers: {
        "X-Auth-Email": process.env.FCA_API_EMAIL!,
        "X-Auth-Key": process.env.FCA_API_KEY!,
        Accept: "application/json",
      },
      // Register data is refreshed by the ingestion job; a lookup is cached briefly.
      next: { revalidate: 3_600 },
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
