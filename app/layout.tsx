import type { Metadata } from "next";
import Link from "next/link";
import { SITE, ID } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "International money transfer providers: A–Z directory",
    template: `%s | ${SITE.name}`,
  },
  description:
    "A directory of UK international money transfer providers, built from the FCA Register, Companies House and Financial Ombudsman data.",
  icons: { icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }] },
};

/** Site-wide entity graph: static, and describing only what the pages render. */
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
      // Permanent URL: search engines associate it with the entity over time.
      logo: `${SITE.url}/brand/logo-imt-uk.svg`,
    },
    {
      "@type": "WebSite",
      "@id": ID.website,
      url: SITE.url,
      name: SITE.name,
      publisher: { "@id": ID.organization },
    },
  ],
};

const NAV = [
  { href: "/", label: "Directory" },
  { href: "/compare/", label: "Compare" },
  { href: "/check-a-provider/", label: "Check a provider" },
];

const FOOTER = [
  { href: "/about/", label: "About" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/how-we-get-paid/", label: "How we get paid" },
  { href: "/code-of-ethics/", label: "Code of ethics" },
  { href: "/corrections/", label: "Corrections" },
  { href: "/for-providers/", label: "For providers" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="entitymap" type="application/json" href={`${SITE.url}/entitymap.json`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      </head>
      <body className="bg-white font-sans text-body antialiased">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-4">
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
            <nav className="flex gap-4 text-sm">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="underline">
                  {n.label}
                </Link>
              ))}
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
              A directory of money transfer providers built from the FCA Register, Companies
              House and the Financial Ombudsman Service. We are not a bank, a broker or a
              payment provider, and nothing here is financial advice.
            </p>
            <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {FOOTER.map((n) => (
                <Link key={n.href} href={n.href} className="underline">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
