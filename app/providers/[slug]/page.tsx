import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PROFILE_SCHEMA,
  PROVIDERS,
  getProvider,
  isIndexable,
  providerUrl,
  tierOf,
} from "@/lib/providers";
import { registerSearchUrl } from "@/lib/fca";
import { H2, JsonLd, NotYetPublished, P, PageFrame, webPage } from "@/components/Page";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return PROVIDERS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = getProvider((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name} international money transfer: FCA and company profile`,
    description: `${p.name}'s regulatory profile: FCA Register status and permissions, Companies House record, and complaints data, each with the date it was last verified.`,
    alternates: { canonical: providerUrl(p) },
    // Tier 3 profiles exist as entities but are noindex until verified.
    robots: isIndexable(p) ? { index: true, follow: true } : { index: false, follow: true },
  };
}

const TIER_LABEL = {
  1: "Tier 1 — tested",
  2: "Tier 2 — verified",
  3: "Tier 3 — register data pending",
} as const;

export default async function Page({ params }: { params: Params }) {
  const p = getProvider((await params).slug);
  if (!p) notFound();
  const tier = tierOf(p);
  const blocks = [...new Set(PROFILE_SCHEMA.map((f) => f.block))];

  return (
    <PageFrame trail={[{ name: p.name }]} title={<>{p.name} international money transfer profile</>}>
      <JsonLd data={webPage(providerUrl(p), `${p.name} profile`, "ProfilePage")} />

      <section aria-labelledby="status" className="mt-6 rounded-lg border border-line bg-wash p-5">
        <h2 id="status" className="font-semibold text-ink">
          {TIER_LABEL[tier]}
        </h2>
        <p className="mt-2 max-w-prose">
          {`We have not yet fetched ${p.name}'s record from the FCA Register or Companies House, ` +
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


      <H2 id="blocks">What this profile will show</H2>
      <P>
        Each block below is published only once it has been collected from the stated source
        and, where marked, checked by a person. Every block carries its own last-verified date.
      </P>

      {blocks.map((block) => (
        <section key={block} aria-label={block} className="mt-6">
          <h3 className="font-semibold text-ink">{block}</h3>
          <dl className="mt-2 divide-y divide-line border-y border-line text-sm">
            {PROFILE_SCHEMA.filter((f) => f.block === block).map((f) => (
              <div key={f.field} className="grid gap-1 py-2 sm:grid-cols-[1fr_auto]">
                <dt className="text-ink">{f.field}</dt>
                <dd className="text-muted">
                  Not yet verified · source: {f.source}
                  {f.humanReview !== "No" ? ` · human review: ${f.humanReview.toLowerCase()}` : ""}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <NotYetPublished>
        {`No test transfer has been made with ${p.name}, so this profile shows no costs, rates ` +
          `or delivery times.`}
      </NotYetPublished>

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
