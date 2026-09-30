import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, H1, H2, JsonLd, NotYetPublished, P, webPage } from "@/components/Page";

export const metadata: Metadata = {
  title: "Transfer Tracker: monthly test transfer results",
  description:
    "Monthly results from real test transfers: what each provider cost against the mid-market rate, and how long the money took to arrive.",
  alternates: { canonical: "/tracker/" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10">
      <JsonLd data={webPage("/tracker/", "Transfer Tracker")} />
      <Breadcrumbs trail={[{ name: "Transfer Tracker" }]} />
      <H1>Transfer Tracker: monthly test transfer results</H1>
      <NotYetPublished>
        Each month we will send real money through the providers we have tested and publish
        what it cost against the mid-market rate and how long it took compared with what was
        promised. The first round has not been run, so there are no results yet.
      </NotYetPublished>
      <H2>How the results will be measured</H2>
      <P>
        {"Cost is measured the same way as our "}
        <Link href="/compare/" className="underline">cost comparison tool</Link>
        {": the amount received against what the same sum would have bought at the published mid-market reference rate on the day. "}
        <Link href="/methodology/" className="underline">Full methodology</Link>.
      </P>
    </main>
  );
}
