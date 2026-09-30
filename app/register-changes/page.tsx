import type { Metadata } from "next";
import Link from "next/link";
import { H2, JsonLd, NotYetPublished, P, PageFrame, webPage } from "@/components/Page";

export const metadata: Metadata = {
  title: "FCA register changes for money transfer firms",
  description:
    "A weekly feed of money transfer firms newly authorised, restricted or cancelled on the FCA Register.",
  alternates: { canonical: "/register-changes/" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <PageFrame trail={[{ name: "Register changes" }]} title={<>FCA register changes for money transfer firms</>}>
      <JsonLd data={webPage("/register-changes/", "FCA register changes")} />
      <NotYetPublished>
        This feed will list, each week, money transfer firms that have been newly authorised
        or registered, had restrictions added, or had their permission cancelled. It starts
        once our FCA Register import is running. Changes that reflect badly on a firm are
        checked by a person before they appear.
      </NotYetPublished>
      <H2>Check a firm today</H2>
      <P>
        {"You can look up any firm's current status with our "}
        <Link href="/check-a-provider/" className="underline">provider check</Link>.
      </P>
    </PageFrame>
  );
}
