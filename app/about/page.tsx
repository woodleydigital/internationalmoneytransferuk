import type { Metadata } from "next";
import Link from "next/link";
import { MATT_WOODLEY, personUrl } from "@/lib/people";
import { SITE, ID } from "@/lib/site";
import { Breadcrumbs, H1, H2, JsonLd, P } from "@/components/Page";

export const metadata: Metadata = {
  title: `About ${SITE.name}`,
  description:
    "Who runs International Money Transfer UK, how the directory is built, and our relationship with Currency Brokers UK.",
  alternates: { canonical: "/about/" },
};

export default function Page() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${SITE.url}/about/#page`,
          url: `${SITE.url}/about/`,
          name: `About ${SITE.name}`,
          mainEntity: { "@id": ID.organization },
          isPartOf: { "@id": ID.website },
        }}
      />
      <Breadcrumbs trail={[{ name: "About" }]} />
      <H1>About {SITE.name}</H1>

      <P className="text-lg">
        {`${SITE.name} (${SITE.alternateName}) is a directory of the firms that send money abroad from the UK, built from the public record.`}
      </P>

      <H2>What we do</H2>
      <P>
        {"For each provider we collect what the FCA Register, Companies House and the Financial Ombudsman Service say about it, and show when each fact was last checked. "}
        <Link href="/methodology/" className="underline">How we build each profile</Link>.
      </P>

      <H2>What we are not</H2>
      <P>
        We are not a bank, a money transfer provider or a currency broker. We do not hold money,
        we do not make transfers, and we cannot quote you a rate. Nothing on this site is
        financial advice.
      </P>

      <H2>Our sister site</H2>
      <P>
        {`${SITE.name} is a sister site of `}
        <a href={SITE.sister.url} className="underline">
          {SITE.sister.name}
        </a>
        {", which is owned by the same business. Currency Brokers UK covers currency brokers, large transfers and business payments, including its own reviews of brokers. Where it already covers a subject, we link to it rather than repeat it."}
      </P>

      <H2>Who we are</H2>
      <P>
        <Link href={personUrl(MATT_WOODLEY)} className="underline">
          {MATT_WOODLEY.name}
        </Link>
        {`, ${MATT_WOODLEY.jobTitle}. ${MATT_WOODLEY.credentials
          .map((c) => `${c.name}, ${c.institution}`)
          .join("; ")}.`}
      </P>

      <H2>How we are funded</H2>
      <P>
        {"Listing is free and no provider can pay for its position or its data. "}
        <Link href="/how-we-get-paid/" className="underline">How we get paid</Link>
        {" · "}
        <Link href="/code-of-ethics/" className="underline">Code of ethics</Link>
      </P>

      <H2>Where to find us</H2>
      <address className="mt-3 not-italic">
        {SITE.name}
        <br />
        {SITE.address.streetAddress}
        <br />
        {SITE.address.addressLocality}, {SITE.address.postalCode}
        <br />
        United Kingdom
      </address>
    </main>
  );
}
