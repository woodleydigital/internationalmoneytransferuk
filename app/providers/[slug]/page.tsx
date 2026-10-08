import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  KIND_LABEL,
  KIND_PLURAL,
  PROFILE_SCHEMA,
  PROVIDERS,
  getProvider,
  isIndexable,
  providerUrl,
  isVerified,
} from "@/lib/providers";
import { registerSearchUrl } from "@/lib/fca";
import { CompaniesHouseBlock } from "@/components/CompanyHouseBlock";
import { ProviderStatementBlock } from "@/components/ProviderStatementBlock";
import { ServiceQuotesBlock } from "@/components/ServiceQuotesBlock";
import { FosBlock } from "@/components/FosBlock";
import { CompanyExtrasBlock } from "@/components/CompanyExtrasBlock";
import { ChangesBlock } from "@/components/ChangesBlock";
import { TransferChecklist } from "@/components/TransferChecklist";
import { ProviderNoticeBlock } from "@/components/ProviderNoticeBlock";
import { loadProviderNotice } from "@/lib/provider-notice-records";
import { loadChanges, loadCompanyExtras } from "@/lib/extras-records";
import { loadFosRecord } from "@/lib/fos-records";
import { H2, P, PageFrame, Term } from "@/components/Page";
import { providerId, providerNode } from "@/lib/schema";
import { loadLogo } from "@/lib/logo-records";
import { KindBadge, Monogram } from "@/components/Directory";
import { loadEntries, loadEntry } from "@/lib/directory-data";
import { checkedAt, isIndexableEntry, similar } from "@/lib/directory";
import { longDate } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;
// Re-render daily so records older than the freshness limit drop off the page.
export const revalidate = 86_400;

export function generateStaticParams() {
  return PROVIDERS.map((p) => ({ slug: p.slug }));
}

const describe = (name: string) =>
  `${name}'s company and regulatory profile: its Companies House record and its own published regulatory statement, each shown with the date it was fetched.`;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = getProvider((await params).slug);
  if (!p) return {};
  const entry = loadEntry(p.slug);
  return {
    title: `${p.name}: company and regulatory profile`,
    description: describe(p.name),
    alternates: { canonical: providerUrl(p) },
    // Thin profiles exist as entities but stay noindex until they hold enough public-record data.
    robots: entry && (isIndexable(p) || isIndexableEntry(entry)) ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function Page({ params }: { params: Params }) {
  const p = getProvider((await params).slug);
  if (!p) notFound();
  const verified = isVerified(p);
  const entries = loadEntries();
  const entry = entries.find((e) => e.provider.slug === p.slug)!;
  const { company, statement, statedFrns } = entry;
  const logo = loadLogo(p.slug);
  const checked = checkedAt(entry);
  const c = company?.company;
  const blocks = [...new Set(PROFILE_SCHEMA.map((f) => f.block))];
  const service = entry.service;
  const notice = loadProviderNotice(p.slug);
  const fos = loadFosRecord(p.slug);
  const extras = loadCompanyExtras(p.slug, c?.number);
  const changes = loadChanges(p.slug);
  const sharedWith = c
    ? entries
        .filter((e) => e.provider.slug !== p.slug && e.company?.company?.number === c.number)
        .map((e) => ({ name: e.provider.name, href: providerUrl(e.provider) }))
    : [];
  const hasTopic = (...ts: string[]) => Boolean(service?.quotes.some((q) => ts.includes(q.topic)));
  const SERVICE_FIELDS: Record<string, string[]> = {
    "How customer money is safeguarded": ["safeguarding"],
    "Countries and currencies served": ["countries"],
    "Payout methods (bank, cash pickup, mobile wallet)": ["payout"],
    "Fees, limits, minimums": ["fees", "limits"],
    "ID documents required": ["identity"],
  };
  const FOS_FIELD = "Complaint volumes and uphold rate (where published)";
  const collected = (f: (typeof PROFILE_SCHEMA)[number]) =>
    (Boolean(c) && f.source === "Companies House") ||
    (f.field in SERVICE_FIELDS && hasTopic(...SERVICE_FIELDS[f.field])) ||
    (f.field === FOS_FIELD && Boolean(fos)) ||
    (f.field.startsWith("Revenue") && Boolean(extras?.accounts?.figures.length));
  const sections: [string, string][] = [
    ["transfer-checklist", "Questions for your transfer"],
    ...(notice ? ([["provider-notice", "Published brand notice"]] as [string, string][]) : []),
    ...(statement ? ([["regulation", "Regulatory statement"]] as [string, string][]) : []),
    ...(service ? ([["service", "What it says about its service"]] as [string, string][]) : []),
    ...(company ? ([["companies-house", "Companies House record"]] as [string, string][]) : []),
    ...(extras ? ([["company-more", "Ownership, accounts and filings"]] as [string, string][]) : []),
    ...(fos ? ([["complaints", "Ombudsman complaints"]] as [string, string][]) : []),
    ...(changes.length ? ([["changes", "Changes we have recorded"]] as [string, string][]) : []),
    ["coverage", "Data coverage"],
    ["about-profile", "About this profile"],
  ];
  const others = similar(entries, entry);

  return (
    <PageFrame
      schema={{
        path: providerUrl(p),
        name: `${p.name}: company and regulatory profile`,
        description: describe(p.name),
        type: "ProfilePage",
        mainEntity: { "@id": providerId(p.slug) },
        about: { "@id": providerId(p.slug) },
        ...(logo ? { primaryImage: logo.file } : {}),
        nodes: [providerNode(entry, logo?.file)],
      }}
      trail={[{ name: p.name }]}
      icon={<Monogram name={p.name} kind={p.kind} slug={p.slug} size="lg" />}
      title={<>{p.name}: company and regulatory profile</>}
      meta={
        <>
          <KindBadge kind={p.kind} />
          <span className="text-sm text-muted">{verified ? "Verified" : "Register data pending"}</span>
          {p.website && (
            <a href={p.website} rel="noopener nofollow" className="border-2 border-ink bg-white px-3 py-1.5 text-sm font-semibold text-ink no-underline hover:bg-brand-50">
              Visit website ↗
            </a>
          )}
          <Link href={`/compare/providers/?p=${p.slug}`} className="bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white no-underline hover:bg-brand-800">
            Compare
          </Link>
        </>
      }
      aside={
        <div className="space-y-6 lg:sticky lg:top-4">
          <section aria-labelledby="key-facts" className="border-t-4 border-brand-600 bg-wash p-5">
            <h2 id="key-facts" className="text-lg font-bold text-ink">
              Key facts
            </h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-muted">Category</dt>
                <dd className="font-semibold text-ink">{KIND_LABEL[p.kind]}</dd>
              </div>
              <div>
                <dt className="text-muted">Registered company</dt>
                <dd className="font-semibold text-ink">{c ? `${c.name} (${c.number})` : "Not yet identified"}</dd>
              </div>
              {c && (
                <div>
                  <dt className="text-muted">Status and incorporated</dt>
                  <dd className="font-semibold text-ink">
                    {`${c.status ?? "—"}${c.incorporated ? ` · ${longDate(c.incorporated)}` : ""}`}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted">
                  <Term slug="frn">FCA number</Term>, as stated by the provider
                </dt>
                <dd className="font-semibold text-ink">{statedFrns.length ? statedFrns.join(", ") : "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Records last checked</dt>
                <dd className="font-semibold text-ink">{checked ? longDate(checked.slice(0, 10)) : "—"}</dd>
              </div>
            </dl>
          </section>

          <nav aria-labelledby="on-this-page" className="text-sm">
            <h2 id="on-this-page" className="font-bold uppercase tracking-wide text-muted">
              On this page
            </h2>
            <ul className="mt-2 space-y-1">
              {sections.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <form method="get" action="/compare/providers/" className="text-sm">
            <input type="hidden" name="p" value={p.slug} />
            <label htmlFor="compare-with" className="font-bold uppercase tracking-wide text-muted">
              {`Compare ${p.name} with`}
            </label>
            <div className="mt-2 flex">
              <select id="compare-with" name="p" className="w-full min-w-0 border-2 border-ink bg-white px-2 py-2">
                {entries
                  .filter((e) => e.provider.slug !== p.slug)
                  .sort((a, b) => a.provider.name.localeCompare(b.provider.name, "en-GB"))
                  .map((e) => (
                    <option key={e.provider.slug} value={e.provider.slug}>
                      {e.provider.name}
                    </option>
                  ))}
              </select>
              <button type="submit" className="bg-ink px-3 font-semibold text-white">
                Go
              </button>
            </div>
          </form>

          {others.length > 0 && (
            <section aria-labelledby="similar">
              <h2 id="similar" className="text-sm font-bold uppercase tracking-wide text-muted">
                {`Other ${KIND_PLURAL[p.kind].toLowerCase()}`}
              </h2>
              <ul className="mt-2 space-y-2">
                {others.map((o) => (
                  <li key={o.provider.slug} className="flex items-center gap-3">
                    <Monogram name={o.provider.name} kind={o.provider.kind} slug={o.provider.slug} />
                    <Link href={providerUrl(o.provider)} className="font-semibold">
                      {o.provider.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm">
                <Link href={`/?kind=${p.kind}`}>{`All ${KIND_PLURAL[p.kind].toLowerCase()} →`}</Link>
              </p>
            </section>
          )}
        </div>
      }
    >

      {notice && <ProviderNoticeBlock name={p.name} notice={notice} />}
      {!verified && (
        <aside className="mt-8 border-l-4 border-line-strong bg-wash p-4 text-sm">
          <p>
            {`This profile does not include FCA Register data, so it does not state ${p.name}'s FCA status or permissions. Check the firm yourself on the `}
            <a href={registerSearchUrl(p.name)} rel="noopener nofollow">
              FCA Register
            </a>
            {" or with our "}
            <Link href={`/check-a-provider/?q=${encodeURIComponent(p.name)}`}>provider check</Link>.
          </p>
        </aside>
      )}

      <TransferChecklist entry={entry} entries={entries} />

      {statement && (
        <div id="regulation">
          <ProviderStatementBlock name={p.name} record={statement} />
        </div>
      )}
      {service && (
        <div id="service-quotes">
          <ServiceQuotesBlock name={p.name} record={service} />
        </div>
      )}
      {company && <CompaniesHouseBlock record={company} />}
      {extras && <CompanyExtrasBlock name={p.name} extras={extras} />}
      {fos && <FosBlock name={p.name} record={fos} sharedWith={sharedWith} />}
      {changes.length > 0 && <ChangesBlock changes={changes} />}

      <section aria-labelledby="coverage" className="mt-10">
        <H2 id="coverage">Data coverage</H2>
        <P>
          This profile is compiled automatically. Each item appears only once it has been
          collected from the stated source, and carries the date it was fetched.
        </P>
        <details className="mt-4 border border-line">
          <summary className="cursor-pointer bg-wash px-4 py-3 font-semibold text-ink">
            {`Show every item and its source (${PROFILE_SCHEMA.filter(collected).length} of ${PROFILE_SCHEMA.length} collected)`}
          </summary>
          <div className="px-4 pb-4">
            {blocks.map((block) => (
              <section key={block} aria-label={block} className="mt-4">
                <h3 className="font-semibold text-ink">{block}</h3>
                <dl className="mt-2 divide-y divide-line border-y border-line text-sm">
                  {PROFILE_SCHEMA.filter((f) => f.block === block).map((f) => (
                    <div key={f.field} className="grid gap-1 py-2 sm:grid-cols-[1fr_auto]">
                      <dt className="text-ink">{f.field}</dt>
                      <dd className="text-muted sm:text-right">
                        {collected(f) ? "Collected" : "Not yet collected"} · {f.source}
                        <span className="block text-xs">{f.method}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </details>
        <P>
          {`We do not test providers or rate them. This profile shows no exchange rates, and says nothing about ${p.name} that its public records and its own website do not.`}
        </P>
      </section>

      <section aria-labelledby="about-profile" className="mt-10">
        <H2 id="about-profile">About this profile</H2>
        <P>
          {"Listing is free and no provider can pay for its data fields or position. "}
          <Link href="/methodology/">Methodology</Link>
          {" · "}
          <Link href="/how-we-get-paid/">How we get paid</Link>
          {" · "}
          <Link href="/corrections/">Report an error</Link>
          {" · "}
          <Link href="/for-providers/">{`Are you ${p.name}?`}</Link>
        </P>
      </section>
    </PageFrame>
  );
}
