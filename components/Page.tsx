import Link from "next/link";
import { pageGraph, type Crumb, type PageSchema } from "@/lib/schema";
import { glossaryUrl } from "@/lib/glossary";
import { longDate, SITE } from "@/lib/site";

export type { Crumb };

/** Static JSON-LD in the initial HTML, describing only what the page renders. */
export function JsonLd({ data }: { data: object }) {
  // Escape "<" so a value can never close the script element.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/**
 * Visible breadcrumb. Its BreadcrumbList is built from the same trail by
 * PageFrame's page graph, so the two can never disagree.
 */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const all: Crumb[] = [{ name: "Home", href: "/" }, ...trail];
  return (
    <>
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

/**
 * Standard page frame: a tinted header band carrying the breadcrumb, H1 and
 * lead, then the content column. Every inner page uses it so the site reads as
 * one consistent publication.
 */
export function PageFrame({
  trail,
  title,
  lead,
  icon,
  meta,
  aside,
  schema,
  children,
}: {
  trail: Crumb[];
  /**
   * The page's structured data: one graph with WebPage, BreadcrumbList and any
   * further nodes. Omitted only on pages that should carry none (the 404).
   */
  schema?: PageSchema;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Shown before the title, e.g. a provider's monogram. */
  icon?: React.ReactNode;
  /** Badges and actions under the title. */
  meta?: React.ReactNode;
  /** A side column (key facts, related links) beside the content on wide screens. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main id="main">
      {schema && <JsonLd data={pageGraph(schema, trail)} />}
      <div className="border-b border-line bg-wash">
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-5">
          <Breadcrumbs trail={trail} />
          <div className={icon ? "mt-5 flex items-start gap-4" : "mt-5"}>
            {icon}
            <div>
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
              {lead && <p className="mt-4 max-w-2xl text-lg text-body sm:text-xl">{lead}</p>}
              {meta && <div className="mt-4 flex flex-wrap items-center gap-3">{meta}</div>}
            </div>
          </div>
        </div>
      </div>
      <div className="prose-links mx-auto max-w-6xl px-5 pb-12 pt-2">
        {aside ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
            <div className="min-w-0 max-w-3xl">{children}</div>
            <aside className="lg:pt-8">{aside}</aside>
          </div>
        ) : (
          <div className="max-w-3xl">{children}</div>
        )}
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

/**
 * The standard attribution line under every data block: where the data came
 * from, when we fetched it, and how we collect it.
 */
export function SourceLine({
  source,
  fetchedAt,
  note,
  dateLabel = "Fetched",
}: {
  source: React.ReactNode;
  /** ISO timestamp of the fetch (or publication, with dateLabel). */
  fetchedAt: string;
  note?: React.ReactNode;
  dateLabel?: string;
}) {
  return (
    <p className="mt-2 text-sm text-muted">
      <span className="font-semibold text-body">Source:</span> {source}
      {" · "}
      <span>{`${dateLabel} ${longDate(fetchedAt.slice(0, 10))}`}</span>
      {note && <>{" · "}{note}</>}
      {" · "}
      <Link href="/methodology/">How we collect this</Link>
    </p>
  );
}

/** A term linked to its plain-English definition in the glossary. */
export function Term({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <Link href={glossaryUrl(slug)} className="text-inherit underline decoration-dotted underline-offset-4">
      {children}
    </Link>
  );
}

/** Our postal address and email, the same wherever they appear. */
export function ContactAddress({ subject, footer = false }: { subject?: string; footer?: boolean }) {
  const href = `mailto:${SITE.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return (
    <address className={`mt-3 not-italic ${footer ? "text-sm" : ""}`}>
      {SITE.name}
      <br />
      {SITE.address.streetAddress}
      <br />
      {`${SITE.address.addressLocality} ${SITE.address.postalCode}`}
      <br />
      United Kingdom
      <br />
      <a href={href} className={footer ? "text-white underline" : "link"}>
        {SITE.email}
      </a>
    </address>
  );
}
