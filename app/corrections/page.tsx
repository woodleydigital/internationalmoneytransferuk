import type { Metadata } from "next";
import Link from "next/link";
import { H2, P, PageFrame, ContactAddress } from "@/components/Page";

const TITLE = "Corrections";
const DESCRIPTION =
  "How to report an error in the directory, and the public log of corrections we have made.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/corrections/" },
};

/** Public log. Add an entry for every substantive correction; never remove one. */
const LOG: { date: string; page: string; href: string; change: string }[] = [
  { date: "8 October 2026", page: "Provider profiles", href: "/", change: "Corrected automatic extraction so fee brackets are classified as fees; excluded domestic-payment statements, promotional offers, incomplete worked examples and unrelated privacy or document-processing statements. Kept routes, table headings and timing conditions with quotations." },
  { date: "8 October 2026", page: "Provider comparisons", href: "/compare/providers/", change: "Added service quotations with source conditions and dates. Missing published complaint counts are shown as missing rather than zero." },
  { date: "8 October 2026", page: "Privacy and data status", href: "/privacy/", change: "Aligned the privacy notice with the treatment of ownership records, lookup caching, calculator submissions and request logs. Changed an unmatched Ombudsman record's label so it does not imply a known complaint volume. An empty FCA search no longer suggests a regulatory-status conclusion." },
];

export default function Page() {
  return (
    <PageFrame
      schema={{ path: "/corrections/", name: TITLE, description: DESCRIPTION }} trail={[{ name: "Corrections" }]} title={<>Corrections</>}>
      
      <H2>Report an error</H2>
      <P>
        Email us with the page, what is wrong, and where the correct information can be found. Each
        report is checked against the original source record; if the site was wrong, the page
        is corrected and the correction is recorded below.
      </P>
      <P>
        Company records and published complaints figures come from Companies House and the
        Financial Ombudsman Service; service statements come from providers' own websites.
        FCA Register information appears only in the live lookup. If an original source is
        wrong, report it to that source too. Imported records refresh weekly; our website's
        own extraction or display errors can be corrected separately.
      </P>
      <ContactAddress subject="Correction request" />

      <H2>Corrections log</H2>
      {LOG.length === 0 ? (
        <P>No corrections have been made yet.</P>
      ) : (
        <ul className="mt-3 space-y-2">
          {LOG.map((e) => (
            <li key={`${e.date}-${e.page}`}>
              <strong className="text-ink">{e.date}</strong> — <Link href={e.href}>{e.page}</Link>: {e.change}
            </li>
          ))}
        </ul>
      )}
    </PageFrame>
  );
}
