import type { Metadata } from "next";
import Link from "next/link";
import { H2, P, PageFrame } from "@/components/Page";

const TITLE = "Methodology: how the directory is built";
const DESCRIPTION =
  "How the IMTUK directory is compiled automatically from the FCA Register, Companies House, the Financial Ombudsman Service and providers' own websites, and the rules that keep it accurate.";

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
        Our import from the FCA Register and Companies House is being set up. Until it has run
        for a provider, that provider’s profile says “register data pending” and is hidden from
        search engines.
      </P>

      <H2>Built by software, not by reviewers</H2>
      <P>
        Nobody at IMTUK tests providers, makes transfers, or reviews profiles by hand. We
        say this plainly because it shapes what the site can and cannot tell you: it reports
        what the public record and a provider’s own website say, and nothing else. It does not
        rate, rank or recommend providers.
      </P>

      <H2>Where the facts come from</H2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
        <li>
          <strong className="text-ink">FCA Register.</strong> Firm name, FCA reference number,
          permission type, status, restrictions and registered agents. Refreshed weekly.
        </li>
        <li>
          <strong className="text-ink">Companies House.</strong> Company number, incorporation
          date, registered office, persons with significant control and filed accounts.
          Refreshed weekly.
        </li>
        <li>
          <strong className="text-ink">Financial Ombudsman Service.</strong> Complaint volumes
          and uphold rates, where the Ombudsman publishes them for a firm.
        </li>
        <li>
          <strong className="text-ink">The provider’s own regulatory statement.</strong> The
          sentence on a provider’s website saying who regulates it, usually with its FCA
          reference number and company number. We quote it word for word, label it as the
          provider’s own claim, and link to the FCA Register so you can check it. Where the
          statement gives a company number, that is how we find the company at Companies House.
        </li>
        <li>
          <strong className="text-ink">Logos.</strong> The icon each provider’s own website
          publishes, saved by software and refreshed weekly. Logos are trade marks of their
          owners and are shown only to identify each provider.
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
          Register and company facts are copied from the official source by ordinary code. AI is
          never used to produce or recall them.
        </li>
        <li>
          AI is used only to find details on providers’ own websites. It must return the exact
          wording it relied on; if that wording cannot be found on the page, the result is
          thrown away rather than saved.
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
      </ul>

      <H2>How we measure the cost of a transfer</H2>
      <P>
        {"The cost of a transfer is the difference between what the recipient received and what the same amount would have bought at the published mid-market reference rate on the day. The mid-market rate is a reference, not a rate anyone is offered. "}
        <Link href="/how-we-calculate/">The calculation in full</Link>.
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
