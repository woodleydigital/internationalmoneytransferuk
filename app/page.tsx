import type { Metadata } from "next";
import Link from "next/link";
import {
  PROVIDERS,
  groupByInitial,
  providerUrl,
  searchProviders,
  tierOf,
} from "@/lib/providers";
import { SITE, ID } from "@/lib/site";
import { JsonLd } from "@/components/Page";

type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Searches are noindex with a canonical to the clean directory. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const hasQuery = one((await searchParams).q).trim() !== "";
  return {
    title: {
      absolute: `International money transfer providers: A–Z directory | ${SITE.name}`,
    },
    description:
      "A searchable A–Z directory of UK international money transfer providers, with every regulatory fact checked against the FCA Register and Companies House before it is published.",
    alternates: { canonical: "/" },
    robots: hasQuery ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const q = one((await searchParams).q).trim().slice(0, 80);
  const results = searchProviders(q);
  const groups = groupByInitial(results);
  const verified = PROVIDERS.filter((p) => tierOf(p) <= 2).length;
  const letters = groupByInitial(searchProviders("")).map(([k]) => k);

  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE.url}/#page`,
          url: SITE.url,
          name: "International money transfer providers: A–Z directory",
          isPartOf: { "@id": ID.website },
          publisher: { "@id": ID.organization },
        }}
      />

      <h1 className="text-3xl font-bold tracking-tight text-ink">
        International money transfer providers: the A–Z directory
      </h1>

      <section aria-labelledby="directory" className="mt-6">
        <h2 id="directory" className="sr-only">
          Search the directory
        </h2>

        <form method="get" action="/" role="search" className="rounded-lg border border-line bg-wash p-5">
          <label htmlFor="q" className="block text-sm font-medium text-ink">
            Find a provider
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              autoComplete="off"
              placeholder="e.g. Wise, HSBC, Western Union"
              className="w-full rounded-md border border-line-strong bg-white px-3 py-2"
            />
            <button type="submit" className="rounded-md bg-brand-700 px-5 py-2 font-medium text-white">
              Search
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm">
          {`${PROVIDERS.length} providers listed. ${verified} verified against the FCA Register so far. `}
          A provider is marked verified only when its FCA and Companies House record has been
          fetched from source and checked — until then its profile says so.{" "}
          <Link href="/methodology/" className="underline">
            How we verify providers
          </Link>
          .
        </p>

        {!q && (
          <nav aria-label="Jump to letter" className="mt-4 flex flex-wrap gap-2 text-sm">
            {letters.map((l) => (
              <a key={l} href={`#letter-${l}`} className="rounded border border-line px-2 py-0.5 underline">
                {l}
              </a>
            ))}
          </nav>
        )}

        {q && (
          <p className="mt-4 text-sm">
            {`${results.length} ${results.length === 1 ? "provider matches" : "providers match"} “${q}”. `}
            <Link href="/" className="underline">
              Show all
            </Link>
          </p>
        )}

        {results.length === 0 ? (
          <p className="mt-6">
            {"We do not list that provider yet. You can check any firm directly on the "}
            <Link href={`/check-a-provider/?q=${encodeURIComponent(q)}`} className="underline">
              FCA Register with our provider check
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6">
            {groups.map(([letter, list]) => (
              <section key={letter} id={`letter-${letter}`} aria-label={letter} className="border-t border-line py-3">
                <h3 className="text-lg font-semibold text-ink">{letter}</h3>
                <ul className="mt-1 grid gap-x-6 sm:grid-cols-2">
                  {list.map((p) => (
                    <li key={p.slug} className="flex items-baseline justify-between gap-3 py-1">
                      <Link href={providerUrl(p)} className="text-brand-600 underline">
                        {p.name}
                      </Link>
                      <span className="text-xs text-muted">
                        {tierOf(p) <= 2 ? "Verified" : "Verification pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="what" className="mt-12 border-t border-line pt-8">
        <h2 id="what" className="text-xl font-semibold text-ink">
          What each international money transfer profile covers
        </h2>
        <p className="mt-3 max-w-prose">
          Every profile is built from the public record rather than from the provider’s
          marketing: the firm’s FCA reference number, permissions and status from the FCA
          Register; its company number, filings and ownership from Companies House; and
          complaint figures from the Financial Ombudsman Service where they are published. Each
          block shows the date it was last verified.
        </p>
        <p className="mt-3 max-w-prose">
          Listing is free and no provider can pay to appear, to be ranked, or to change what
          its profile says.{" "}
          <Link href="/how-we-get-paid/" className="underline">
            How we get paid
          </Link>
          .
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5">
          <li>
            <Link href="/check-a-provider/" className="underline">
              Check a provider
            </Link>{" "}
            — look up any firm’s status on the FCA Register.
          </li>
          <li>
            <Link href="/compare/" className="underline">
              Compare the cost of a transfer
            </Link>{" "}
            — see the fee and exchange rate margin in a quote you were given.
          </li>
        </ul>
      </section>
    </main>
  );
}
