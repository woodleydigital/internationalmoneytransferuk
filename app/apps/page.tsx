import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, H1, H2, JsonLd, NotYetPublished, P, webPage } from "@/components/Page";

// No app has been tested yet, so the page stays out of the index until it has data.
export const metadata: Metadata = {
  title: "International money transfer apps",
  description:
    "How long each money transfer app takes to verify you, which countries it sends to, and what a tested transfer cost.",
  alternates: { canonical: "/apps/" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10">
      <JsonLd data={webPage("/apps/", "International money transfer apps")} />
      <Breadcrumbs trail={[{ name: "Apps" }]} />
      <H1>International money transfer apps</H1>
      <NotYetPublished>
        This page will compare money transfer apps on three things we measure ourselves: how
        long identity checks took, which countries and currencies each app sends to, and the
        total cost of a real test transfer. None of those tests have been completed, so no
        app is listed or ranked here yet.
      </NotYetPublished>
      <H2>In the meantime</H2>
      <P>
        {"Every provider we list, app-based or not, is in the "}
        <Link href="/" className="underline">A–Z directory</Link>
        {". To see what a quote you have been given really costs, use "}
        <Link href="/compare/" className="underline">the cost comparison tool</Link>.
      </P>
    </main>
  );
}
