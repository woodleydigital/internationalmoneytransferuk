import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/Page";
import { SITE, ID } from "@/lib/site";
import { abs, LANG, pageId } from "@/lib/schema";

const PUBLISHED = "2026-09-02";

const TITLE = "How we calculate the exchange rate margin";
const DESCRIPTION =
  "The formulas, data source and limitations behind the FX margin checker: how total transfer cost is separated into a stated fee and the margin built into the exchange rate.";
const ARTICLE_ID = `${SITE.url}/how-we-calculate/#article`;

const article = {
  "@type": "Article",
  "@id": ARTICLE_ID,
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  inLanguage: LANG,
  // No named author: the site is compiled by software (see /methodology/).
  author: { "@id": ID.organization },
  publisher: { "@id": ID.organization },
  isPartOf: { "@id": ID.website },
  about: { "@type": "WebApplication", "@id": ID.marginChecker, name: "FX Margin Checker", url: abs("/compare/") },
  image: abs("/brand/logo-512.png"),
  mainEntityOfPage: { "@id": pageId("/how-we-calculate/") },
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/how-we-calculate/" },
};

export default function Page() {
  return (
    <PageFrame
      trail={[{ name: "Compare costs", href: "/compare/" }, { name: "How we calculate this" }]}
      title={<>{TITLE}</>}
      schema={{
        path: "/how-we-calculate/",
        name: TITLE,
        description: DESCRIPTION,
        datePublished: PUBLISHED,
        mainEntity: { "@id": ARTICLE_ID },
        nodes: [article],
      }}
    >

      <p className="mt-5 max-w-prose">
        The checker compares a transfer you were quoted against a published mid-market
        reference rate, then reports the difference as an estimated cost. It does not quote rates, and it
        does not compare providers. Every figure it uses about your transfer comes from you.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">
        Where the reference rate comes from
      </h2>
      <p className="mt-3 max-w-prose">
        Mid-market rates come from the{" "}
        <a href="https://frankfurter.dev" className="underline" rel="noopener nofollow">
          Frankfurter API
        </a>
        , an open-source service that publishes foreign exchange rates from central banks. We
        use its blended rate, which combines observations from many central bank sources rather
        than relying on one.
      </p>
      <p className="mt-3 max-w-prose">
        These are reference, spot and mid rates published by monetary authorities.{" "}
        <strong className="text-ink">
          They are dated benchmarks, not personalised provider quotes.
        </strong>{" "}
        Some providers use a mid-market rate and charge a separate fee. Their source and pricing
        time can differ from this daily publication, so the checker estimates a rate difference
        rather than proving the provider&rsquo;s exact margin.
      </p>
      <p className="mt-3 max-w-prose">
        Central banks publish once per working day, so no rate is available for weekends or
        bank holidays. We show the date the rate was actually published rather than
        today&rsquo;s date, and we never estimate a rate when the source is unavailable.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-ink">The formulas</h2>
      <p className="mt-3 max-w-prose">
        Where <em>S</em> is the transfer amount entered, <em>T</em> is what your recipient
        receives, <em>R</em> is the daily reference rate and <em>F</em> is the stated fee.
        Total customer spend (<em>C</em>) is <em>S</em> for a deducted fee, or <em>S + F</em>
        for a fee charged on top:
      </p>
      <pre className="mt-4 overflow-x-auto rounded-md bg-brand-900 p-4 text-sm text-white">
        <code>{`total spend C       = S (deducted fee), or S + F (added fee)
reference payout    = C × R
shortfall           = (C × R) − T          in the receiving currency
estimated cost      = shortfall ÷ R        in the sending currency
estimated cost %    = estimated cost ÷ C × 100
estimated rate gap  = estimated cost − F
all-in rate         = T ÷ C`}</code>
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
        2.61% of the amount transferred. With no separately stated fee, that £1,304.35 is
        the estimated exchange rate difference against the reference.
      </p>

      <p className="mt-3 max-w-prose">
        If a £1,000 transfer has a £10 fee charged on top, total spend is £1,010.
        At a reference rate of 1.20 and a quoted rate of 1.20, the recipient gets €1,200:
        the estimated cost is £10, entirely the stated fee, with no rate difference.
        These are illustrative figures, not a provider quote.
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
          A rate difference against this benchmark is not proof of a hidden fee or an exact
          provider margin. Compare quotes taken at similar times for the same route, total
          spend, funding method and payout method.
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
        <Link href="/compare/" className="underline">
          Back to the cost comparison tool
        </Link>
      </p>
    </PageFrame>
  );
}
