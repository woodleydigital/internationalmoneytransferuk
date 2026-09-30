import Link from "next/link";
import { SITE, ID } from "@/lib/site";

export interface Crumb {
  name: string;
  href?: string;
}

/** Static JSON-LD in the initial HTML, describing only what the page renders. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/** Visible breadcrumb plus its BreadcrumbList, so the two can never disagree. */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const all: Crumb[] = [{ name: "Home", href: "/" }, ...trail];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            ...(c.href ? { item: `${SITE.url}${c.href}` } : {}),
          })),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        {all.map((c, i) => (
          <span key={c.name}>
            {i > 0 && " / "}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="underline">
                {c.name}
              </Link>
            ) : (
              c.name
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

/** A WebPage node tied to the site graph. */
export function webPage(path: string, name: string, type = "WebPage") {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${SITE.url}${path}#page`,
    url: `${SITE.url}${path}`,
    name,
    isPartOf: { "@id": ID.website },
    publisher: { "@id": ID.organization },
  };
}

export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">{children}</h1>;
}

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mt-10 text-xl font-semibold text-ink">
      {children}
    </h2>
  );
}

export function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`mt-3 max-w-prose ${className}`}>{children}</p>;
}

/** Plain statement that a section has no verified data yet. Never a placeholder figure. */
export function NotYetPublished({ children }: { children: React.ReactNode }) {
  return (
    <aside className="mt-6 rounded-lg border border-line-strong bg-wash p-4 text-sm">
      <p>
        <strong className="text-ink">Not yet published. </strong>
        {children}
      </p>
    </aside>
  );
}

export function Main({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10">
      {children}
    </main>
  );
}
