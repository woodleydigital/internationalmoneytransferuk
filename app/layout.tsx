import type { Metadata } from "next";
import Link from "next/link";
import { Source_Sans_3 } from "next/font/google";
import { SITE, ID } from "@/lib/site";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
});

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
  { href: "/", label: "Provider directory" },
  { href: "/check-a-provider/", label: "Check a provider" },
  { href: "/compare/", label: "Compare costs" },
  { href: "/register-changes/", label: "Register changes" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/about/", label: "About us" },
];

const FOOTER: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Services",
    links: [
      { href: "/", label: "Provider directory" },
      { href: "/check-a-provider/", label: "Check a provider" },
      { href: "/compare/", label: "Compare costs" },
    ],
  },
  {
    heading: "About us",
    links: [
      { href: "/about/", label: "About IMT UK" },
      { href: "/methodology/", label: "Methodology" },
      { href: "/how-we-get-paid/", label: "How we get paid" },
      { href: "/code-of-ethics/", label: "Code of ethics" },
    ],
  },
  {
    heading: "Help",
    links: [
      { href: "/corrections/", label: "Report an error" },
      { href: "/for-providers/", label: "For providers" },
      { href: "/privacy/", label: "Privacy notice" },
      { href: "/entitymap.html", label: "Entity map" },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={sourceSans.variable}>
      <head>
        <link rel="entitymap" type="application/json" href={`${SITE.url}/entitymap.json`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      </head>
      <body className="bg-white font-sans text-[1.0625rem] leading-relaxed text-body antialiased">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        {/* Stated plainly on every page: an independent site, not an official one. */}
        <div className="bg-brand-900 text-brand-100">
          <p className="mx-auto max-w-5xl px-5 py-1.5 text-xs sm:text-sm">
            An independent consumer information service. Not a government website, and not
            part of the FCA.
          </p>
        </div>

        <header className="bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5">
            <Link href="/" className="block max-w-full no-underline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-imt-uk.svg"
                alt={SITE.name}
                width={506}
                height={56}
                className="h-auto w-full max-w-[22rem] sm:w-auto sm:max-w-none sm:h-11"
              />
              <span className="mt-1.5 block text-sm text-muted sm:pl-[3.55rem]">
                Independent directory of UK money transfer providers
              </span>
            </Link>
            <form method="get" action="/" role="search" className="flex w-full sm:w-auto">
              <label htmlFor="site-q" className="sr-only">
                Search providers
              </label>
              <input
                id="site-q"
                name="q"
                type="search"
                placeholder="Search providers"
                autoComplete="off"
                className="w-full min-w-0 border-2 border-ink px-3 py-2 sm:w-64"
              />
              <button type="submit" className="bg-brand-700 px-4 py-2 font-semibold text-white">
                Search
              </button>
            </form>
          </div>
          <nav aria-label="Main" className="border-b-4 border-accent-500 bg-brand-700">
            <ul className="mx-auto flex max-w-5xl flex-wrap px-2 sm:px-3">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="block px-3 py-3 text-sm font-semibold text-white hover:bg-brand-800 sm:text-base"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {children}

        <footer className="bg-brand-900 text-brand-100">
          <div className="mx-auto max-w-5xl px-5 py-12">
            <div className="grid gap-8 sm:grid-cols-4">
              {FOOTER.map((col) => (
                <nav key={col.heading} aria-label={col.heading}>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    {col.heading}
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="underline underline-offset-2">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h2>
                <address className="mt-3 text-sm not-italic">
                  {SITE.name}
                  <br />
                  {SITE.address.streetAddress}
                  <br />
                  {SITE.address.addressLocality} {SITE.address.postalCode}
                  <br />
                  United Kingdom
                </address>
              </div>
            </div>

            <div className="mt-10 border-t border-brand-700 pt-6 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-imt-uk-reversed.svg"
                alt={SITE.name}
                width={506}
                height={56}
                className="h-9 w-auto max-w-full"
              />
              <p className="mt-4 max-w-3xl">
                {`${SITE.name} is an independent, privately run website. It is not a government body and is not affiliated with or endorsed by the Financial Conduct Authority, Companies House or the Financial Ombudsman Service. We are not a bank, a broker or a payment provider, and nothing on this site is financial advice.`}
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
