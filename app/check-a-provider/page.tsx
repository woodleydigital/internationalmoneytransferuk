import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { registerEntryUrl, registerSearchUrl, searchFirms, type FirmSearch } from "@/lib/fca";
import { SITE, ID } from "@/lib/site";
import { abs, LANG } from "@/lib/schema";
import { H2, P, PageFrame } from "@/components/Page";

type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const TITLE = "Check a money transfer provider on the FCA Register";
const DESCRIPTION =
  "Look up any money transfer firm's status on the FCA Financial Services Register before you send money.";
const TOOL_ID = `${SITE.url}/check-a-provider/#tool`;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const hasQuery = one((await searchParams).q).trim() !== "";
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/check-a-provider/" },
    robots: hasQuery ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const q = one((await searchParams).q).replace(/[\u0000-\u001f]/g, "").trim().slice(0, 80);
  const h = await headers();
  const visitor = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "anon";
  const search: FirmSearch | null = q.length >= 2 ? await searchFirms(q, visitor) : null;

  return (
    <PageFrame
      trail={[{ name: "Check a provider" }]}
      title={<>{TITLE}</>}
      schema={{
        path: "/check-a-provider/",
        name: TITLE,
        description: DESCRIPTION,
        mainEntity: { "@id": TOOL_ID },
        nodes: [
          {
            "@type": "WebApplication",
            "@id": TOOL_ID,
            name: "FCA provider check",
            url: abs("/check-a-provider/"),
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            browserRequirements: "Requires a web browser.",
            // Accurate while live results are switched off: the tool hands the search to the FCA's own Register.
            description: "Helps you look up a firm on the FCA Financial Services Register, the FCA's own public record of authorised firms.",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
            inLanguage: LANG,
            publisher: { "@id": ID.organization },
          },
        ],
      }}
    >
      <section aria-labelledby="lookup" className="mt-6">
        <h2 id="lookup" className="sr-only">
          Look up a firm
        </h2>
        <form method="get" action="/check-a-provider/" role="search" className="rounded-lg border border-line bg-wash p-5">
          <label htmlFor="q" className="block text-sm font-medium text-ink">
            Firm name
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              minLength={2}
              autoComplete="off"
              className="w-full rounded-md border border-line-strong bg-white px-3 py-2"
            />
            <button type="submit" className="rounded-md bg-brand-700 px-5 py-2 font-medium text-white">
              Check
            </button>
          </div>
        </form>

        <div className="mt-6">{search ? <Results q={q} search={search} /> : <Intro />}</div>
      </section>

      <H2>What the FCA Register tells you</H2>
      <P>
        Any firm that sends money abroad for UK customers must be authorised or registered by
        the Financial Conduct Authority — usually as a bank, an electronic money institution
        or a payment institution. The Register shows whether a firm is authorised, what it is
        permitted to do, and whether that has been restricted or cancelled.
      </P>
      <P>
        Check the exact firm you are paying. Scam sites often copy the name of a real
        authorised firm, so compare the website address and phone number with the ones on the
        Register entry.
      </P>
    </PageFrame>
  );
}

function Intro() {
  return (
    <p className="max-w-prose text-sm">
      Enter the name of the firm you are thinking of using. We look it up on the FCA’s
      Financial Services Register for you, then and there, and show each match exactly as the
      Register returns it. Results are not stored.
    </p>
  );
}

function Results({ q, search }: { q: string; search: FirmSearch }) {
  const official = (
    <a href={registerSearchUrl(q)} className="underline" rel="noopener">
      {`search the FCA Register for “${q}”`}
    </a>
  );

  if (search.kind === "unconfigured" || search.kind === "error" || search.kind === "busy") {
    return (
      <div className="rounded-lg border border-line p-5">
        <p>
          {search.kind === "error"
            ? `${search.message} `
            : search.kind === "busy"
              ? "Too many searches in the last minute, so we have paused look-ups briefly. "
              : "Our live connection to the FCA Register is not switched on yet. "}
          You can {official} directly on the FCA’s own site.
        </p>
      </div>
    );
  }

  if (search.results.length === 0) {
    return (
      <div className="rounded-lg border border-line p-5">
        <p>
          {`The FCA Register returned no firms matching “${q}”. Check the spelling, or `}
          {official}. A firm that does not appear may not be authorised.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line p-5">
      <p className="text-sm">
        {`${search.results.length} ${search.results.length === 1 ? "match" : "matches"} on the FCA Register, checked ${new Date(search.checkedAt).toUTCString()}.`}
      </p>
      <table className="mt-3 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="py-1 pr-3 font-medium text-ink">Firm</th>
            <th className="py-1 pr-3 font-medium text-ink">FRN</th>
            <th className="py-1 pr-3 font-medium text-ink">Status</th>
            <th className="py-1 font-medium text-ink">Type</th>
          </tr>
        </thead>
        <tbody>
          {search.results.map((r) => (
            <tr key={`${r.frn}-${r.name}`} className="border-b border-line">
              <td className="py-1 pr-3">{r.name}</td>
              <td className="py-1 pr-3 tabular-nums">
                {r.frn ? (
                  <a href={registerEntryUrl(r.frn)} className="underline" rel="noopener">
                    {r.frn}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="py-1 pr-3">{r.status}</td>
              <td className="py-1">{r.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-sm">
        {"Shown exactly as the FCA’s Financial Services Register returned it for this search. The FCA does not endorse this site or these results. Each reference number links to the Register itself: confirm the firm’s details there, and on the "}
        {official}, before you send money. <Link href="/methodology/" className="underline">Methodology</Link>.
      </p>
    </div>
  );
}
