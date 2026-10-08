import type { Metadata } from "next";
import Link from "next/link";
import { H2, P, PageFrame } from "@/components/Page";

const TITLE = "Methodology: how the directory is built";
const DESCRIPTION =
  "How the IMTUK directory is compiled automatically from Companies House, the Financial Ombudsman Service and providers' own websites, and the rules that keep it accurate.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/methodology/" },
};

export default function Page() {
  return (
    <PageFrame
      schema={{ path: "/methodology/", name: TITLE, description: DESCRIPTION }}
      trail={[{ name: "Methodology" }]}
      title={<>Methodology: how the directory is built</>}
      lead={
        <>
          This directory is compiled entirely by software from public records. Every fact shows
          where it came from and when it was last fetched.
        </>
      }
    >
            <P>
        Profiles do not include FCA Register data: the FCA’s terms do not allow its Register to
        feed another website’s tables. Profiles link to the Register and our live lookup instead.
        A profile is eligible for search indexing only when it is in our
        publishing plan, has a Companies House identity or a provider regulatory statement,
        and has sending-service quotations across at least three of countries, payout methods,
        fees, limits and delivery times. This is our publishing safeguard, not a Google quality
        score. Incoming-only terms and a single availability quotation do not meet it. Other profiles
        remain available in the directory but are not submitted for search indexing.
      </P>

      <H2>Built by software, not by reviewers</H2>
      <P>
        Nobody at IMTUK tests providers, makes transfers, or reviews profiles by hand. We
        say this plainly because it shapes what the site can and cannot tell you: it reports
        what the public record and a provider’s own website say, and nothing else. It does not
        rate, rank or recommend providers.
      </P>

      <H2>What the comparison adds</H2>
      <P>
        The <Link href="/compare/providers/">provider comparison</Link> brings quoted
        service terms and matched public records together for the providers you select.
        Source headings, conditions and dates stay with each statement. Receiving-payment
        statements are excluded from the sending-service comparison. It does not turn
        different routes, products or funding methods into equivalent prices.
      </P>
      <P>
        The <Link href="/compare/">quote cost checker</Link> uses the figures you enter
        and a dated reference rate to calculate a comparison. Neither tool tests a provider,
        verifies a marketing claim, recommends a firm or supplies a live transfer quote.
      </P>

      <H2>Where the facts come from</H2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
        <li>
          <strong className="text-ink">Companies House.</strong> Company number, incorporation
          date, registered office, persons with significant control and filed accounts.
          Refreshed weekly.
        </li>
        <li>
          <strong className="text-ink">Financial Ombudsman Service.</strong> The Ombudsman’s
          half-yearly complaints data for the two latest periods: new cases, the share upheld
          in the consumer’s favour and cases settled proactively, copied as published under its
          own headings. A business is linked to a provider only when the Ombudsman publishes it
          under exactly the registered company name we hold from Companies House. The figures
          cover the whole company and all its products, and the Ombudsman publishes only
          businesses with at least 30 new and 30 resolved complaints in the period. Contains
          public sector information licensed under the Open Government Licence v3.0.
        </li>
        <li>
          <strong className="text-ink">The provider’s own regulatory statement.</strong> The
          sentence on a provider’s website saying who regulates it, usually with its FCA
          reference number and company number. We quote it word for word, label it as the
          provider’s own claim, and link to the FCA Register so you can check it. Where the
          statement gives a company number, that is how we find the company at Companies House.
        </li>
        <li>
          <strong className="text-ink">FCA Register look-ups.</strong> The “Check a provider” page
          searches the FCA’s Financial Services Register when you ask it to and shows the matches
          exactly as the Register returns them. Results may be cached for up to one hour, and Register data is not
          copied into provider profiles. The FCA does not endorse this site.
        </li>
        <li>
          <strong className="text-ink">Ownership, accounts and filings.</strong> For each matched
          company: its corporate owners, followed up the chain only while there is a single owner
          registered at Companies House; previous names; registered charges; recent filings; and
          headline figures (turnover, profit or loss, net assets, cash, average employees) read
          from the latest accounts when they were filed in tagged, machine-readable form. Figures
          are copied as filed, for the latest period in the accounts, and never estimated.
          Individuals are not shown.
        </li>
        <li>
          <strong className="text-ink">Change log.</strong> Each week software compares every
          Companies House record with the previous week’s and logs what changed on the profile,
          such as a new registered name, status, registered office or accounts date, and notes
          when the Ombudsman publishes new complaints figures.
        </li>
        <li>
          <strong className="text-ink">What providers say about their service.</strong> Software
          reads up to twelve official product and help sources per provider, including selectable
          text in official PDF terms, using configured
          source links and links discovered on the provider’s own pages and help subdomains.
          It keeps sentences on eight topics (service availability, where it sends money,
          how recipients are paid, delivery times, fees, limits, customer-money protection,
          and identity documents), word for word, with the page each came from. It drops marketing
          superlatives, promotions, other products (cards, loans, savings) and claims about other
          firms. Stored quotations are filtered again when displayed, so improved extraction rules
          also apply to earlier imports, including corrected topic classifications. Nearby headings,
          questions and table columns are retained when they explain a quotation. A table row keeps
          its route beside its price or time; privacy safeguards, document-processing times,
          domestic payments, first-transfer promotions and incomplete examples are excluded.
          Context notes identify business pages, receiving payments,
          destination-specific pages and starting prices without rewriting the quotation. Nobody checks the sentences
          by hand, and they are always shown as the provider’s own words.
        </li>
        <li>
          <strong className="text-ink">Published brand notices.</strong> Explicit statements about
          an acquisition or rebrand are copied from a configured primary company source and labelled
          with its publisher, link and fetch date. A successor’s prices and capabilities are not
          assigned to the former brand. Missing quotations mean the collection has a gap, rather
          than that a provider does not offer a service.
        </li>
        <li>
          <strong className="text-ink">Logos.</strong> The icon each provider’s own website
          publishes, saved by software and refreshed weekly. Logos are trade marks of their
          owners and are shown only to identify each provider.
        </li>
        <li>
          <strong className="text-ink">Reference exchange rates.</strong> Daily mid-market rates
          against the pound from the Frankfurter API, which blends central bank publications. A
          currency is shown only when at least three central banks contribute, and the table is
          withdrawn if the latest publication is more than five days old. They are reference
          benchmarks, not personalised provider quotes. Providers may use a mid-market rate with
          a separate fee; their rate can differ from this once-daily reference.
        </li>
        <li>
          <strong className="text-ink">The provider’s own website and terms.</strong> Countries
          served, payout methods, fees, limits, ID requirements and how customer money is
          safeguarded.
        </li>
      </ul>

      <H2>The rules the software follows</H2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
        <li>
          Company, complaint and register facts are copied from the official source by ordinary
          code. AI is never used to produce, recall or summarise them.
        </li>
        <li>
          Details from providers’ own websites are found by plain pattern matching, not AI, and
          kept word for word with the page they came from.
        </li>
        <li>
          Anything that could reflect badly on a firm — a cancelled or restricted permission, a
          requirement imposed by the FCA, complaint figures — is shown exactly as the source
          records it, with a link and a date. The site adds no description, judgement or
          commentary of its own.
        </li>
        <li>Every block of a profile shows when it was last fetched.</li>
        <li>
          If a source cannot be reached or a check fails, the site shows nothing for that block
          rather than an older or estimated value.
        </li>
        <li>
          AI was used to build the site’s software and to draft its explanatory pages (this page,
          the glossary and the questions and answers). It does not write or edit any provider’s
          profile data.
        </li>
      </ul>

      <H2>How we measure the cost of a transfer</H2>
      <P>
        {"The checker estimates a transfer's cost by comparing the recipient payout with what the customer's total spend would have bought at the published daily reference rate. Total spend includes any fee charged on top. A daily reference is a benchmark, not a personalised quote or proof of a provider's exact margin. "}
        <Link href="/how-we-calculate/">The calculation in full</Link>.
      </P>

      <H2>Questions to confirm for your transfer</H2>
      <P>
        Each profile has a checklist tailored to its provider category and the service topics
        collected on that profile. A quotation is evidence of what the provider published, not
        confirmation that the terms apply to every transfer. Shared-company links are calculated
        from matching Companies House company numbers; they do not imply identical products or
        prices. These checks are generated by software, not from test transfers.
      </P>
      <P>
        Fetch dates describe when software read a source. They are not publication dates or
        evidence that the underlying facts changed, so they are not used as profile modification
        dates in structured data or sitemaps.
      </P>

      <H2>Changes and corrections</H2>
      <P>
        {"Each profile keeps a timeline of what changed and when. If you find an error, "}
        <Link href="/corrections/">tell us</Link>
        {"; corrections are logged publicly."}
      </P>
    </PageFrame>
  );
}
