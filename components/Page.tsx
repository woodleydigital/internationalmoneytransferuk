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
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-x-2">
          {all.map((c, i) => (
            <li key={c.name} className="flex items-center gap-x-2">
              {i > 0 && <span aria-hidden="true" className="text-muted">›</span>}
              {c.href && i < all.length - 1 ? (
                <Link href={c.href} className="link">
                  {c.name}
                </Link>
              ) : (
                <span aria-current="page">{c.name}</span>
              )}
            </li>
          ))}
        </ol>
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

/**
 * Standard page frame: a tinted header band carrying the breadcrumb, H1 and
 * lead, then the content column. Every inner page uses it so the site reads as
 * one consistent publication.
 */
export function PageFrame({
  trail,
  title,
  lead,
  children,
}: {
  trail: Crumb[];
  title: React.ReactNode;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main id="main">
      <div className="border-b border-line bg-wash">
        <div className="mx-auto max-w-5xl px-5 pb-8 pt-5">
          <Breadcrumbs trail={trail} />
          <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          {lead && <p className="mt-4 max-w-2xl text-lg text-body sm:text-xl">{lead}</p>}
        </div>
      </div>
      <div className="prose-links mx-auto max-w-5xl px-5 pb-12 pt-2">
        <div className="max-w-3xl">{children}</div>
      </div>
    </main>
  );
}

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mt-10 text-2xl font-bold tracking-tight text-ink">
      {children}
    </h2>
  );
}

export function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`mt-4 max-w-prose ${className}`}>{children}</p>;
}

/** Plain statement that a section has no verified data yet. Never a placeholder figure. */
export function NotYetPublished({ children }: { children: React.ReactNode }) {
  return (
    <aside className="mt-6 border-l-4 border-accent-500 bg-accent-100/40 p-4">
      <p className="font-semibold text-ink">Not yet published</p>
      <p className="mt-1 max-w-prose">{children}</p>
    </aside>
  );
}

/** Highlighted panel for key facts or next steps. */
export function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className="mt-6 border-l-4 border-brand-600 bg-brand-50 p-4">
      <p className="font-semibold text-ink">{title}</p>
      <div className="mt-1 max-w-prose">{children}</div>
    </aside>
  );
}
