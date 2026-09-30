import type { Metadata } from "next";
import Link from "next/link";
import { H2, JsonLd, P, PageFrame, webPage } from "@/components/Page";

export const metadata: Metadata = {
  title: "Methodology: how we build and verify provider profiles",
  description:
    "Where every fact in the IMT UK directory comes from, how profiles are tiered, what a person checks before publication, and how we measure the cost of a transfer.",
  alternates: { canonical: "/methodology/" },
};

export default function Page() {
  return (
    <PageFrame trail={[{ name: "Methodology" }]} title={<>Methodology: how we build and verify provider profiles</>} lead={<>Every regulatory fact in this directory comes from the public record, is fetched by
        software rather than typed in, and shows the date it was last checked.</>}>
      <JsonLd data={webPage("/methodology/", "Methodology")} />
      <P>
        Our import from the FCA Register and Companies House is being set up. Until it has run
        for a provider, that provider’s profile is Tier 3 and says so.
      </P>

      <H2>Where the facts come from</H2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
        <li>
          <strong className="text-ink">FCA Register.</strong> Firm name, FCA reference number,
          permission type, status, restrictions and registered agents. Refreshed weekly.
        </li>
        <li>
          <strong className="text-ink">Companies House.</strong> Company number, incorporation
          date, registered office, filed accounts and ownership. Refreshed weekly.
        </li>
        <li>
          <strong className="text-ink">Financial Ombudsman Service.</strong> Complaint volumes
          and uphold rates, where the Ombudsman publishes them for a firm.
        </li>
        <li>
          <strong className="text-ink">The provider’s own website and terms.</strong> Corridors,
          payout methods, fees, limits and how customer money is safeguarded. Each of these is
          stored with the exact wording it came from, so it can be checked.
        </li>
      </ul>
      <P>
        We never generate these facts with AI or fill them in from memory. Where software reads
        a provider’s website, it must return the exact passage it relied on; if it cannot, the
        result is rejected rather than saved.
      </P>

      <H2>Profile tiers</H2>
      <dl className="mt-3 max-w-prose space-y-3">
        <div>
          <dt className="font-semibold text-ink">Tier 1 — Tested</dt>
          <dd>
            Everything in Tier 2, plus real test transfers and mystery shopping of customer
            support.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Tier 2 — Verified</dt>
          <dd>
            FCA Register, Companies House and Ombudsman data complete, and product details
            extracted with their source wording.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Tier 3 — Register data pending</dt>
          <dd>
            The provider is listed but its record is incomplete. These profiles are hidden from
            search engines until they reach Tier 2.
          </dd>
        </div>
      </dl>

      <H2>What a person checks before it is published</H2>
      <P>
        Anything that reflects badly on a firm — a cancelled or restricted permission, a
        requirement imposed by the FCA, a rise in complaints — is held for a person to review
        and is never published automatically. So are ownership details, safeguarding
        statements, filed financial figures and changes to fees or limits.
      </P>

      <H2>How we measure the cost of a transfer</H2>
      <P>
        {"The cost of a transfer is the difference between what the recipient received and what the same amount would have bought at the published mid-market reference rate on the day. The mid-market rate is a reference, not a rate anyone is offered. "}
        <Link href="/how-we-calculate/" className="underline">The calculation in full</Link>.
      </P>

      <H2>Changes and corrections</H2>
      <P>
        {"Each profile keeps a timeline of what changed and when. If you find an error, "}
        <Link href="/corrections/" className="underline">tell us</Link>
        {"; corrections are logged publicly."}
      </P>
    </PageFrame>
  );
}
