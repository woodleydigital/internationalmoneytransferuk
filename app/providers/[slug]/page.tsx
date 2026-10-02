import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PROFILE_SCHEMA,
  PROVIDERS,
  getProvider,
  isIndexable,
  providerUrl,
  isVerified,
} from "@/lib/providers";
import { registerSearchUrl } from "@/lib/fca";
import { loadCompanyRecord } from "@/lib/company-records";
import { CompaniesHouseBlock } from "@/components/CompanyHouseBlock";
import { loadDisclosure } from "@/lib/disclosure-records";
import { ProviderStatementBlock } from "@/components/ProviderStatementBlock";
import { H2, JsonLd, P, PageFrame, webPage } from "@/components/Page";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;
// Re-render daily so records older than the freshness limit drop off the page.
export const revalidate = 86_400;

export function generateStaticParams() {
  return PROVIDERS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = getProvider((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name}: company and regulatory profile`,
    description: `${p.name}'s company and regulatory profile: its Companies House record and its own published regulatory statement, each shown with the date it was fetched.`,
    alternates: { canonical: providerUrl(p) },
    // Unverified profiles exist as entities but are noindex until verified.
    robots: isIndexable(p) ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function Page({ params }: { params: Params }) {
  const p = getProvider((await params).slug);
  if (!p) notFound();
  const verified = isVerified(p);
  const company = loadCompanyRecord(p.slug);
  const statement = loadDisclosure(p.slug);
  const blocks = [...new Set(PROFILE_SCHEMA.map((f) => f.block))];

  return (
    <PageFrame trail={[{ name: p.name }]} title={<>{p.name} international money transfer profile</>}>
      <JsonLd data={webPage(providerUrl(p), `${p.name} profile`, "ProfilePage")} />

      <section aria-labelledby="status" className="mt-6 rounded-lg border border-line bg-wash p-5">
        <h2 id="status" className="font-semibold text-ink">
          {verified ? "Verified" : "Register data pending"}
        </h2>
        <p className="mt-2 max-w-prose">
          {`We have not yet fetched ${p.name}'s record from the FCA Register${company ? "" : " or Companies House"}, ` +
            `so this profile does not state its FCA reference number, permissions or status. ` +
            `We do not fill these in from memory or from the provider's own website.`}
        </p>
        <p className="mt-2 text-sm">
          {"Until then, you can check the firm yourself on the "}
          <a href={registerSearchUrl(p.name)} className="underline" rel="noopener">
            FCA Register
          </a>
          {" or with our "}
          <Link href={`/check-a-provider/?q=${encodeURIComponent(p.name)}`} className="underline">
            provider check
          </Link>
          .
        </p>
      </section>


      {statement && <ProviderStatementBlock name={p.name} record={statement} />}
      {company && <CompaniesHouseBlock record={company} />}

      <H2 id="blocks">What this profile will show</H2>
      <P>
        This profile is compiled automatically. Each block below appears only once it has been
        collected from the stated source, and carries the date it was last fetched.
      </P>

      {blocks.map((block) => (
        <section key={block} aria-label={block} className="mt-6">
          <h3 className="font-semibold text-ink">{block}</h3>
          <dl className="mt-2 divide-y divide-line border-y border-line text-sm">
            {PROFILE_SCHEMA.filter((f) => f.block === block).map((f) => (
              <div key={f.field} className="grid gap-1 py-2 sm:grid-cols-[1fr_auto]">
                <dt className="text-ink">{f.field}</dt>
                <dd className="text-muted sm:text-right">
                  Not yet collected · {f.source}
                  <span className="block text-xs">{f.method}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <P>
        {`We do not test providers or rate them. This profile shows no exchange rates, and says nothing about ${p.name} that its public records and its own website do not.`}
      </P>

      <H2>About this profile</H2>
      <P>
        {"Listing is free and no provider can pay for its data fields or position. "}
        <Link href="/methodology/" className="underline">
          Methodology
        </Link>
        {" · "}
        <Link href="/how-we-get-paid/" className="underline">
          How we get paid
        </Link>
        {" · "}
        <Link href="/corrections/" className="underline">
          Report an error
        </Link>
        {" · "}
        <Link href="/for-providers/" className="underline">
          {`Are you ${p.name}?`}
        </Link>
      </P>
    </PageFrame>
  );
}
