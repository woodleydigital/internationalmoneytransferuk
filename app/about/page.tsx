import type { Metadata } from "next";
import Link from "next/link";
import { MATT_WOODLEY, personUrl } from "@/lib/people";
import { SITE, ID } from "@/lib/site";

export const metadata: Metadata = {
  title: `About ${SITE.name}`,
  description:
    "Who we are, what the margin checker does, and how we are paid. IMT UK introduces people making large international transfers to FCA-authorised currency brokers.",
  alternates: { canonical: "/about" },
};

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE.url}/about#page`,
      url: `${SITE.url}/about`,
      name: `About ${SITE.name}`,
      mainEntity: { "@id": ID.organization },
      isPartOf: { "@id": ID.website },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "About" },
      ],
    },
  ],
};

export default function Page() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="underline">
          Home
        </Link>
        {" / About"}
      </nav>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">About {SITE.name}</h1>

      <p className="mt-5 max-w-prose text-lg">
        {`${SITE.name} helps people moving large sums abroad find out what their transfer actually costs.`}
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">What we do</h2>
      <p className="mt-3 max-w-prose">
        On a large international money transfer, the fee you are shown is rarely the main
        cost. Most of it sits in the exchange rate, as the difference between the rate the
        provider gives you and the rate at which currency actually trades. That difference is
        not itemised anywhere on a quote.
      </p>
      <p className="mt-3 max-w-prose">
        Our{" "}
        <Link href="/" className="text-brand-600 underline">
          margin checker
        </Link>{" "}
        takes the figures you were quoted and measures them against a published mid-market
        reference rate, so you can see the margin in pounds.{" "}
        <Link href="/how-we-calculate" className="text-brand-600 underline">
          The method is published in full
        </Link>
        .
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">What we are not</h2>
      <p className="mt-3 max-w-prose">
        We are not a bank, a currency broker, or a payment provider. We do not hold client
        money, we do not execute transfers, and we cannot quote you a rate. Nothing on this
        site is financial advice.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">Who we are</h2>
      <p className="mt-3 max-w-prose">
        <Link href={personUrl(MATT_WOODLEY)} className="text-brand-600 underline">
          {MATT_WOODLEY.name}
        </Link>
        {`, ${MATT_WOODLEY.jobTitle}. ${MATT_WOODLEY.credentials
          .map((c) => `${c.name}, ${c.institution}`)
          .join("; ")}. His profile sets out which pages he reviews and, just as importantly, which he does not.`}
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">Where to find us</h2>
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
