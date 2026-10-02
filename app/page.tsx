import type { Metadata } from "next";
import Link from "next/link";
import { KIND_LABEL, KIND_PLURAL, type ProviderKind } from "@/lib/providers";
import { SITE, ID } from "@/lib/site";
import {
  applyFilters,
  facetCounts,
  groupByLetter,
  isFiltered,
  parseFilters,
  type Filters,
} from "@/lib/directory";
import { loadEntries } from "@/lib/directory-data";
import { JsonLd } from "@/components/Page";
import { DirectoryStats, ProviderCard } from "@/components/Directory";

type SearchParams = Record<string, string | string[] | undefined>;

/** Filtered or searched views are noindex with a canonical to the clean directory. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const filtered = isFiltered(parseFilters(await searchParams));
  return {
    title: {
      absolute: `International money transfer providers: A–Z directory | ${SITE.name}`,
    },
    description:
      "A searchable A–Z directory of UK international money transfer providers, built from Companies House records and each provider's own published regulatory statement.",
    alternates: { canonical: "/" },
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
  };
}

const KINDS: ProviderKind[] = ["bank", "transfer", "broker"];

const KIND_BLURB: Record<ProviderKind, string> = {
  bank: "High-street, digital and private banks and building societies that send money abroad.",
  transfer: "Specialist money transfer companies and apps, including cash pickup and mobile wallets.",
  broker: "Currency brokers that convert and send larger sums, often by phone or online account.",
};

const SORT_LABEL: Record<Filters["sort"], string> = {
  az: "Name, A to Z",
  za: "Name, Z to A",
  oldest: "Incorporated, oldest first",
  newest: "Incorporated, newest first",
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const f = parseFilters(await searchParams);
  const entries = loadEntries();
  const results = applyFilters(entries, f);
  const counts = facetCounts(entries, f);
  const grouped = f.sort === "az" || f.sort === "za";

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
      {/* One GET form; its fields sit in the hero and the sidebar via form="filters". */}
      <form id="filters" method="get" action="/" />

      <div className="border-b border-line bg-brand-50">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-5xl">
            International money transfer providers: the A–Z directory
          </h1>
          <p className="mt-4 max-w-2xl text-lg sm:text-xl">
            Find a UK money transfer provider and see what the public record says about it: the
            company behind the brand, its Companies House record, and what it says about its own
            regulation.
          </p>

          <div role="search" className="mt-6 max-w-2xl">
            <label htmlFor="q" className="block font-semibold text-ink">
              Search by provider or company name
            </label>
            <div className="mt-2 flex">
              <input
                id="q"
                name="q"
                form="filters"
                type="search"
                defaultValue={f.q}
                autoComplete="off"
                placeholder="For example, Wise, HSBC or UKForex"
                className="w-full min-w-0 border-2 border-ink bg-white px-3 py-3 text-lg"
              />
              <button
                type="submit"
                form="filters"
                className="bg-brand-700 px-6 py-3 text-lg font-semibold text-white"
              >
                Search
              </button>
            </div>
          </div>

          <div className="mt-8">
            <DirectoryStats entries={entries} />
          </div>
        </div>
      </div>

      <div className="prose-links mx-auto max-w-6xl px-5 pb-12">
        {!isFiltered(f) && (
          <section aria-labelledby="categories" className="mt-10">
            <h2 id="categories" className="text-2xl font-bold tracking-tight text-ink">
              Browse by category
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {KINDS.map((k) => (
                <li key={k}>
                  <Link
                    href={`/?kind=${k}`}
                    className="block h-full border-t-4 border-brand-600 bg-wash p-5 no-underline hover:bg-brand-50"
                  >
                    <span className="block text-lg font-bold text-ink">{KIND_PLURAL[k]}</span>
                    <span className="mt-1 block text-sm text-body">{KIND_BLURB[k]}</span>
                    <span className="mt-3 block text-sm font-semibold text-brand-600">
                      {`${entries.filter((e) => e.provider.kind === k).length} providers →`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside aria-labelledby="refine" className="lg:sticky lg:top-4 lg:self-start">
            <h2 id="refine" className="text-lg font-bold text-ink">
              Refine results
            </h2>

            <fieldset className="mt-4">
              <legend className="text-sm font-bold uppercase tracking-wide text-muted">Category</legend>
              {KINDS.map((k) => (
                <label key={k} className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="kind"
                    value={k}
                    form="filters"
                    defaultChecked={f.kinds.includes(k)}
                    className="h-4 w-4"
                  />
                  <span className="flex-1">{KIND_LABEL[k]}</span>
                  <span className="text-sm text-muted">{counts.kinds[k]}</span>
                </label>
              ))}
            </fieldset>

            <fieldset className="mt-6">
              <legend className="text-sm font-bold uppercase tracking-wide text-muted">Public record</legend>
              <label className="mt-2 flex items-center gap-2">
                <input type="checkbox" name="company" value="1" form="filters" defaultChecked={f.hasCompany} className="h-4 w-4" />
                <span className="flex-1">Has a Companies House record</span>
                <span className="text-sm text-muted">{counts.hasCompany}</span>
              </label>
              <label className="mt-2 flex items-center gap-2">
                <input type="checkbox" name="statement" value="1" form="filters" defaultChecked={f.hasStatement} className="h-4 w-4" />
                <span className="flex-1">Publishes a regulatory statement</span>
                <span className="text-sm text-muted">{counts.hasStatement}</span>
              </label>
            </fieldset>

            <div className="mt-6">
              <label htmlFor="sort" className="text-sm font-bold uppercase tracking-wide text-muted">
                Sort by
              </label>
              <select
                id="sort"
                name="sort"
                form="filters"
                defaultValue={f.sort}
                className="mt-2 w-full border-2 border-ink bg-white px-2 py-2"
              >
                {(Object.keys(SORT_LABEL) as Filters["sort"][]).map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button type="submit" form="filters" className="bg-brand-700 px-4 py-2 font-semibold text-white">
                Apply
              </button>
              {isFiltered(f) && <Link href="/">Clear all</Link>}
            </div>

            <p className="mt-6 text-sm text-muted">
              There is no ranking here: providers are listed by name or by a recorded date, and no
              one can pay to appear higher. <Link href="/how-we-get-paid/">How we get paid</Link>.
            </p>
          </aside>

          <section aria-labelledby="results">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="results" className="text-2xl font-bold tracking-tight text-ink">
                {`${results.length} ${results.length === 1 ? "provider" : "providers"}`}
              </h2>
              <p className="text-sm text-muted">Tick up to three providers to compare them side by side.</p>
            </div>

            {results.length === 0 ? (
              <p className="mt-6">
                {"No provider matches those filters. "}
                <Link href="/">Clear all filters</Link>
                {f.q && (
                  <>
                    {", or check the firm on the "}
                    <Link href={`/check-a-provider/?q=${encodeURIComponent(f.q)}`}>FCA Register</Link>
                  </>
                )}
                .
              </p>
            ) : (
              <form method="get" action="/compare/providers/" className="mt-4">
                {grouped ? (
                  groupByLetter(results).map(([letter, list]) => (
                    <section key={letter} id={`letter-${letter}`} aria-label={letter} className="mt-6">
                      <h3 className="border-b-2 border-ink pb-1 text-xl font-bold text-ink">{letter}</h3>
                      <div className="mt-3 space-y-3">
                        {list.map((e) => (
                          <ProviderCard key={e.provider.slug} entry={e} compareName="p" />
                        ))}
                      </div>
                    </section>
                  ))
                ) : (
                  <div className="space-y-3">
                    {results.map((e) => (
                      <ProviderCard key={e.provider.slug} entry={e} compareName="p" />
                    ))}
                  </div>
                )}

                <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-4 border-t-4 border-accent-500 bg-white py-3">
                  <span className="text-sm">Selected providers are compared on the facts we hold.</span>
                  <button type="submit" className="bg-ink px-5 py-2 font-semibold text-white">
                    Compare selected
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>

        <section aria-labelledby="what" className="mt-14 max-w-3xl">
          <h2 id="what" className="text-2xl font-bold tracking-tight text-ink">
            What each international money transfer profile covers
          </h2>
          <p className="mt-3 max-w-prose">
            Every profile is built from the public record rather than from the provider’s
            marketing: the company behind the brand and its Companies House record, and the
            regulatory statement the provider publishes on its own website, quoted word for word.
            Each block shows the date it was fetched.
          </p>
          <p className="mt-3 max-w-prose">
            Listing is free and no provider can pay to appear, to be ranked, or to change what its
            profile says. <Link href="/how-we-get-paid/">How we get paid</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
