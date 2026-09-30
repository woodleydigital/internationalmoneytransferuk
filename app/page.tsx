import type { Metadata } from "next";
import Link from "next/link";
import {
  PROVIDERS,
  groupByInitial,
  providerUrl,
  searchProviders,
  isVerified,
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
      "A searchable A–Z directory of UK international money transfer providers, with every regulatory fact taken directly from the FCA Register and Companies House.",
    alternates: { canonical: "/" },
    robots: hasQuery ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const q = one((await searchParams).q).trim().slice(0, 80);
  const results = searchProviders(q);
  const groups = groupByInitial(results);
  const verified = PROVIDERS.filter(isVerified).length;
  const letters = groupByInitial(searchProviders("")).map(([k]) => k);

  return (
    <main id="main">
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

      <div className="border-b border-line bg-brand-50">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:py-12">
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-5xl">
            International money transfer providers: the A–Z directory
          </h1>
          <p className="mt-4 max-w-2xl text-lg sm:text-xl">
            Find a UK money transfer provider and see what the public record says about it,
            from the FCA Register, Companies House and the Financial Ombudsman Service.
          </p>

          <form method="get" action="/" role="search" className="mt-6 max-w-2xl">
            <label htmlFor="q" className="block font-semibold text-ink">
              Search for a provider
            </label>
            <div className="mt-2 flex">
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                autoComplete="off"
                placeholder="For example, Wise, HSBC or Western Union"
                className="w-full min-w-0 border-2 border-ink bg-white px-3 py-3 text-lg"
              />
              <button type="submit" className="bg-brand-700 px-6 py-3 text-lg font-semibold text-white">
                Search
              </button>
            </div>
          </form>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="text-sm text-muted">Providers listed</dt>
              <dd className="text-3xl font-bold text-ink">{PROVIDERS.length}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Verified against the FCA Register</dt>
              <dd className="text-3xl font-bold text-ink">{verified}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="prose-links mx-auto max-w-5xl px-5 pb-12">
        <section aria-labelledby="directory" className="mt-10">
          <h2 id="directory" className="text-2xl font-bold tracking-tight text-ink">
            {q ? "Search results" : "All providers, A to Z"}
          </h2>
          <p className="mt-2 max-w-prose">
            A provider is marked verified only when its FCA Register, Companies House and
            Ombudsman records have been fetched from source. Until then its profile says so.{" "}
            <Link href="/methodology/">How we verify providers</Link>.
          </p>

          {!q && (
            <nav aria-label="Jump to letter" className="mt-5 flex flex-wrap gap-1.5">
              {letters.map((l) => (
                <a
                  key={l}
                  href={`#letter-${l}`}
                  className="flex h-9 w-9 items-center justify-center border border-line-strong font-semibold no-underline hover:bg-brand-50"
                >
                  {l}
                </a>
              ))}
            </nav>
          )}

          {q && (
            <p className="mt-4">
              {`${results.length} ${results.length === 1 ? "provider matches" : "providers match"} “${q}”. `}
              <Link href="/">Show all providers</Link>
            </p>
          )}

          {results.length === 0 ? (
            <p className="mt-6">
              {"We do not list that provider yet. You can check any firm directly with our "}
              <Link href={`/check-a-provider/?q=${encodeURIComponent(q)}`}>FCA provider check</Link>.
            </p>
          ) : (
            <div className="mt-6 border-t-2 border-ink">
              {groups.map(([letter, list]) => (
                <section
                  key={letter}
                  id={`letter-${letter}`}
                  aria-label={letter}
                  className="grid gap-2 border-b border-line py-4 sm:grid-cols-[4rem_1fr]"
                >
                  <h3 className="text-2xl font-bold text-ink">{letter}</h3>
                  <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                    {list.map((p) => (
                      <li key={p.slug} className="flex items-baseline justify-between gap-3 py-1">
                        <Link href={providerUrl(p)} className="font-semibold">
                          {p.name}
                        </Link>
                        <span className="shrink-0 text-sm text-muted">
                          {isVerified(p) ? "Verified" : "Register data pending"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="services" className="mt-14">
          <h2 id="services" className="text-2xl font-bold tracking-tight text-ink">
            Other services
          </h2>
          <ul className="mt-5 grid gap-5 sm:grid-cols-3">
            {SERVICES.map((sv) => (
              <li key={sv.href} className="border-t-4 border-brand-600 bg-wash p-5">
                <h3 className="text-lg font-bold">
                  <Link href={sv.href}>{sv.title}</Link>
                </h3>
                <p className="mt-2 text-base">{sv.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="what" className="mt-14">
          <h2 id="what" className="text-2xl font-bold tracking-tight text-ink">
            What each international money transfer profile covers
          </h2>
          <p className="mt-3 max-w-prose">
            Every profile is built from the public record rather than from the provider’s
            marketing: the firm’s FCA reference number, permissions and status from the FCA
            Register; its company number, filings and ownership from Companies House; and
            complaint figures from the Financial Ombudsman Service where they are published.
            Each block shows the date it was last verified.
          </p>
          <p className="mt-3 max-w-prose">
            Listing is free and no provider can pay to appear, to be ranked, or to change what
            its profile says. <Link href="/how-we-get-paid/">How we get paid</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}

const SERVICES = [
  {
    href: "/check-a-provider/",
    title: "Check a provider",
    body: "Look up any firm’s status on the FCA Register before you send money.",
  },
  {
    href: "/compare/",
    title: "Compare costs",
    body: "See the fee and the exchange rate margin hidden in a quote you were given.",
  },
  {
    href: "/register-changes/",
    title: "Register changes",
    body: "Coming soon: a weekly feed of money transfer firms newly authorised, restricted or cancelled by the FCA.",
  },
];
