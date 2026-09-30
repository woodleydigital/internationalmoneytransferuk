import type { Metadata } from "next";
import Link from "next/link";
import { H2, JsonLd, NotYetPublished, P, PageFrame, webPage } from "@/components/Page";

// Stays out of the index until provider data has been collected.
export const metadata: Metadata = {
  title: "International money transfer apps",
  description:
    "Money transfer apps available in the UK: which countries each sends to, how recipients are paid, and the fees and limits each app publishes.",
  alternates: { canonical: "/apps/" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <PageFrame trail={[{ name: "Apps" }]} title={<>International money transfer apps</>}>
      <JsonLd data={webPage("/apps/", "International money transfer apps")} />
      <NotYetPublished>
        This page will list money transfer apps with the countries each one sends to, how
        recipients can be paid, and the fees and limits each app publishes — every detail
        quoted from the provider’s own website with a link. That data has not been collected
        yet, so no app is listed here.
      </NotYetPublished>
      <H2>In the meantime</H2>
      <P>
        {"Every provider we list, app-based or not, is in the "}
        <Link href="/">A–Z directory</Link>
        {". To see what a quote you have been given really costs, use "}
        <Link href="/compare/">the cost comparison tool</Link>.
      </P>
    </PageFrame>
  );
}
