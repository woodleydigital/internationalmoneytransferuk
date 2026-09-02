import type { Metadata } from "next";
import Link from "next/link";
import { Byline } from "@/components/Byline";
import { MATT_BOYD, personSchema, personId, type ReviewMeta } from "@/lib/people";
import { SITE, ID } from "@/lib/site";

// Methodology and arithmetic sit squarely inside Matt's review scope.
const review: ReviewMeta = {
  reviewer: MATT_BOYD,
  published: "2026-09-02",
  reviewed: "2026-09-02",
  reviewIntervalMonths: 6,
};

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": `${SITE.url}/how-we-calculate#article`,
      headline: "How we calculate the exchange rate margin",
      datePublished: review.published,
      dateModified: review.reviewed,
      author: { "@id": ID.organization },
      reviewedBy: { "@id": personId(MATT_BOYD) },
      publisher: { "@id": ID.organization },
      isPartOf: { "@id": ID.website },
      mainEntityOfPage: `${SITE.url}/how-we-calculate`,
    },
    personSchema(MATT_BOYD),
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "How we calculate this" },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: "How we calculate the exchange rate margin",
  description:
    "The formulas, data source and limitations behind the FX margin checker: how total transfer cost is separated into a stated fee and the margin built into the exchange rate.",
  alternates: { canonical: "/how-we-calculate" },
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
        {" / How we calculate this"}
      </nav>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
        How we calculate the exchange rate margin
      </h1>

      <Byline meta={review} />

      <p className="mt-5 max-w-prose">
        The checker compares a transfer you were quoted against a published mid-market
        reference rate, then reports the difference as a cost. It does not quote rates, and it
        does not compare providers. Every figure it uses about your transfer comes from you.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">
        Where the reference rate comes from
      </h2>
      <p className="mt-3 max-w-prose">
        Mid-market rates come from the{" "}
        <a href="https://frankfurter.dev" className="underline" rel="noopener">
          Frankfurter API
        </a>
        , an open-source service that publishes foreign exchange rates from central banks. We
        use its blended rate, which combines observations from many central bank sources rather
        than relying on one.
      </p>
      <p className="mt-3 max-w-prose">
        These are reference, spot and mid rates published by monetary authorities.{" "}
        <strong className="text-ink">
          They are not rates available to consumers, and no provider will give you one.
        </strong>{" "}
        They are the benchmark against which a provider&rsquo;s margin is measured — which is
        exactly why they are the right comparison, and why we never present one as a rate you
        could obtain.
      </p>
      <p className="mt-3 max-w-prose">
        Central banks publish once per working day, so no rate is available for weekends or
        bank holidays. We show the date the rate was actually published rather than
        today&rsquo;s date, and we never estimate a rate when the source is unavailable.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">The formulas</h2>
      <p className="mt-3 max-w-prose">
        Where <em>S</em> is the amount you send, <em>T</em> is what your recipient receives,{" "}
        <em>R</em> is the mid-market reference rate and <em>F</em> is any fee you were told
        about:
      </p>
      <pre className="mt-4 overflow-x-auto rounded-md bg-brand-900 p-4 text-sm text-white">
        <code>{`mid-market payout   = S × R
shortfall           = (S × R) − T          in the receiving currency
total cost          = shortfall ÷ R        in the sending currency
total cost %        = shortfall ÷ (S × R) × 100

exchange rate margin = total cost − F      the part not itemised`}</code>
      </pre>
      <p className="mt-4 max-w-prose">
        If you know the rate you were quoted rather than the payout, we derive the payout
        first. That calculation depends on whether the fee was taken off before conversion or
        charged on top, which is why the form asks: the two give different answers, and
        assuming one silently is a common way for these calculations to go wrong.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">
        Worked example
      </h2>
      <p className="mt-3 max-w-prose">
        A £50,000 transfer quoted at 1.1200 when the mid-market rate is 1.1500 delivers
        €56,000 rather than €57,500. The shortfall of €1,500 divided by 1.1500 is £1,304.35 —
        2.61% of the amount transferred. If no fee was stated, the whole of that £1,304.35 is
        margin built into the rate.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">Limitations</h2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
        <li>
          The reference rate is a once-daily published figure. Your provider priced at a
          specific moment, and may have used a different reference source, so small differences
          are expected and do not indicate an error.
        </li>
        <li>
          A quote can legitimately come out better than the reference rate for the same date.
          That is a timing effect, not a profit.
        </li>
        <li>
          We assume any fee you enter is in the currency you are sending. Fees charged in
          another currency are outside what this tool handles.
        </li>
        <li>
          Intermediary or receiving-bank charges deducted after the transfer leaves your
          provider are not visible to this calculation. If your recipient received less than
          expected, that is a common reason.
        </li>
        <li>
          A margin is a normal and legitimate way for a provider to charge. This tool reports
          what yours amounted to; it does not judge whether it was reasonable.
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-ink">
        What we do with your figures
      </h2>
      <p className="mt-3 max-w-prose">
        The numbers you enter are used to render your result and are not sent to any third
        party. They appear in the page address so you can bookmark or share a result, which
        also means you should treat that link as you would any other record of your finances.
      </p>

      <p className="mt-10">
        <Link href="/" className="underline">
          Back to the margin checker
        </Link>
      </p>
    </main>
  );
}
