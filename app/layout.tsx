import type { Metadata } from "next";
import Link from "next/link";
import { SITE, ID } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Check the margin on your international money transfer",
    template: `%s | ${SITE.name}`,
  },
  description:
    "Enter the rate or payout you were quoted on an international transfer and see the exchange rate margin built into it, separated from any stated fee.",
  icons: { icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }] },
};

/**
 * Site-wide entity graph. Static, server-rendered, and describing only what the
 * pages actually render (standard §1 rule 4).
 *
 * The tool is a WebApplication, not a FinancialProduct: we do not provide
 * financial products, and asserting otherwise while FCA status is unresolved
 * would be a critical failure (build-spec §4).
 */
const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ID.organization,
      name: SITE.name,
      alternateName: SITE.alternateName,
      url: SITE.url,
      address: { "@type": "PostalAddress", ...SITE.address },
      // Permanent URL. Search engines associate this with the entity over time —
      // see docs/brand-guidelines.md §7 before ever changing it.
      logo: `${SITE.url}/brand/logo-imt-uk.svg`,
    },
    {
      "@type": "WebSite",
      "@id": ID.website,
      url: SITE.url,
      name: SITE.name,
      publisher: { "@id": ID.organization },
    },
    {
      "@type": "WebApplication",
      "@id": ID.marginChecker,
      name: "FX Margin Checker",
      applicationCategory: "FinanceApplication",
      description:
        "Compares a quoted international transfer against the mid-market reference rate and shows the exchange rate margin applied.",
      isAccessibleForFree: true,
      publisher: { "@id": ID.organization },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      </head>
      <body className="bg-white font-sans text-body antialiased">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-3xl items-baseline justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-imt-uk.svg"
                alt=""
                width={129}
                height={32}
                className="h-8 w-auto"
              />
              <span className="sr-only sm:not-sr-only sm:text-sm sm:font-medium sm:text-ink">
                {SITE.name}
              </span>
            </Link>
            <nav>
              <Link href="/how-we-calculate" className="text-sm underline">
                How we calculate this
              </Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="mt-16 bg-brand-900 text-brand-100">
          <div className="mx-auto max-w-3xl px-5 py-10 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-imt-uk-reversed.svg"
              alt=""
              width={129}
              height={32}
              className="h-8 w-auto"
            />
            <p className="mt-4 font-semibold text-white">{SITE.name}</p>
            <address className="not-italic">
              {SITE.address.streetAddress}, {SITE.address.addressLocality},{" "}
              {SITE.address.postalCode}, United Kingdom
            </address>
            <p className="mt-4 max-w-prose">
              This tool reports the difference between a rate you were quoted and a published
              mid-market reference rate. It is information, not advice, and it is not a quote.
              We are not a bank, a broker or a payment provider.
            </p>
            <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/about" className="underline">
                About
              </Link>
              <Link href="/about/matt-woodley" className="underline">
                Matt Woodley
              </Link>
              <Link href="/how-we-calculate" className="underline">
                How we calculate this
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
