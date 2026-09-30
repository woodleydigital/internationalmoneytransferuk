import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { H2, JsonLd, P, PageFrame, webPage } from "@/components/Page";

export const metadata: Metadata = {
  title: "Corrections",
  description: "How to report an error in the directory, and the public log of corrections we have made.",
  alternates: { canonical: "/corrections/" },
};

/** Public log. Add an entry for every substantive correction; never remove one. */
const LOG: { date: string; page: string; change: string }[] = [];

export default function Page() {
  return (
    <PageFrame trail={[{ name: "Corrections" }]} title={<>Corrections</>}>
      <JsonLd data={webPage("/corrections/", "Corrections")} />

      <H2>Report an error</H2>
      <P>
        Tell us the page, what is wrong, and where the correct information can be found. Each
        report is checked against the original source record; if the site was wrong, the page
        is corrected and the correction is recorded below.
      </P>
      <P>
        Register and company facts are copied from the FCA Register and Companies House. If one
        of those records is itself wrong, it needs correcting there; this site updates at its
        next weekly refresh.
      </P>
      <address className="mt-3 not-italic">
        {SITE.name}
        <br />
        {SITE.address.streetAddress}
        <br />
        {SITE.address.addressLocality}, {SITE.address.postalCode}
        <br />
        United Kingdom
      </address>

      <H2>Corrections log</H2>
      {LOG.length === 0 ? (
        <P>No corrections have been made yet.</P>
      ) : (
        <ul className="mt-3 space-y-2">
          {LOG.map((e) => (
            <li key={`${e.date}-${e.page}`}>
              <strong className="text-ink">{e.date}</strong> — {e.page}: {e.change}
            </li>
          ))}
        </ul>
      )}
    </PageFrame>
  );
}
