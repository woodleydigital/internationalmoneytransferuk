import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, H1, H2, JsonLd, P, webPage } from "@/components/Page";

export const metadata: Metadata = {
  title: "How we get paid",
  description:
    "How International Money Transfer UK makes money, and the rules that stop that from affecting what the directory says.",
  alternates: { canonical: "/how-we-get-paid/" },
};

export default function Page() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-10">
      <JsonLd data={webPage("/how-we-get-paid/", "How we get paid")} />
      <Breadcrumbs trail={[{ name: "How we get paid" }]} />
      <H1>How we get paid</H1>

      <P className="text-lg">
        We may earn a commission from a provider when a reader signs up with it through a link
        on this site. Right now, no link on this site earns us anything.
      </P>

      <H2>The rules</H2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
        <li>Listing in the directory is free. Every provider we can verify is listed.</li>
        <li>
          No provider can pay to be listed, to change its position, or to change any fact on
          its profile.
        </li>
        <li>
          Commercial links are labelled as such and kept apart from the factual parts of a
          profile.
        </li>
        <li>
          Whether we are paid by a provider never affects its FCA, Companies House or
          complaints data, which come straight from those sources.
        </li>
      </ul>

      <H2>More about us</H2>
      <P>
        <Link href="/about/" className="underline">About us</Link>
        {" · "}
        <Link href="/code-of-ethics/" className="underline">Code of ethics</Link>
        {" · "}
        <Link href="/methodology/" className="underline">Methodology</Link>
      </P>
    </main>
  );
}
