import type { Metadata } from "next";
import Link from "next/link";
import { MATT_BOYD, personSchema, personId } from "@/lib/people";
import { SITE, ID } from "@/lib/site";

const p = MATT_BOYD;

export const metadata: Metadata = {
  title: `${p.name} — ${p.jobTitle}`,
  description: `${p.name} is ${p.jobTitle} of ${SITE.name}. What he reviews on this site, his background, and the limits of that review.`,
  alternates: { canonical: `/about/${p.slug}` },
};

/**
 * ProfilePage. Every property is evidenced — see lib/people.ts. No photograph,
 * no profile links and no experience claims, because none have been supplied.
 */
const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${SITE.url}/about/${p.slug}#page`,
      url: `${SITE.url}/about/${p.slug}`,
      name: `${p.name} — ${p.jobTitle}`,
      mainEntity: { "@id": personId(p) },
      isPartOf: { "@id": ID.website },
    },
    personSchema(p),
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "About", item: `${SITE.url}/about` },
        { "@type": "ListItem", position: 3, name: p.name },
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
        {" / "}
        <Link href="/about" className="underline">
          About
        </Link>
        {` / ${p.name}`}
      </nav>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">{p.name}</h1>
      <p className="mt-2 text-lg text-body">
        {`${p.jobTitle}, ${SITE.name}`}
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">Background</h2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
        {p.credentials.map((c) => (
          <li key={c.name}>
            {c.name}, {c.institution}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-ink">What Matt reviews on this site</h2>
      <p className="mt-3 max-w-prose">
        Pages carrying his name have been checked by him for accuracy in the following areas:
      </p>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
        {p.reviewScope.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-ink">
        What this review does not cover
      </h2>
      <p className="mt-3 max-w-prose">
        We would rather state the limits of a review than imply expertise we cannot evidence.
        Matt&rsquo;s review does not extend to:
      </p>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
        {p.outOfScope.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="mt-3 max-w-prose">
        Where a page depends on the interpretation of UK financial regulation, it either
        reports the position taken by a primary source — the FCA, the Payment Services
        Regulations 2017, or the Financial Services Compensation Scheme — with that source
        named and dated, or it is reviewed separately by someone qualified in UK financial
        regulation. Nothing on this site is financial advice.
      </p>

      <p className="mt-10">
        <Link href="/about" className="text-brand-600 underline">
          About {SITE.name}
        </Link>
      </p>
    </main>
  );
}
