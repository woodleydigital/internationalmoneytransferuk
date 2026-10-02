import type { Metadata } from "next";
import Link from "next/link";
import { H2, NotYetPublished, P, PageFrame } from "@/components/Page";

const TITLE = "FCA register changes for money transfer firms";
const DESCRIPTION =
  "A weekly feed of money transfer firms newly authorised, restricted or cancelled on the FCA Register.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/register-changes/" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <PageFrame
      schema={{ path: "/register-changes/", name: TITLE, description: DESCRIPTION }} trail={[{ name: "Register changes" }]} title={<>FCA register changes for money transfer firms</>}>
            <NotYetPublished>
        This feed will list, each week, money transfer firms that have been newly authorised
        or registered, had restrictions added, or had their permission cancelled. It starts
        once our FCA Register import is running. Each change is shown exactly as the Register
        records it, with the date and a link to the firm’s Register entry — we add no comment.
      </NotYetPublished>
      <H2>Check a firm today</H2>
      <P>
        {"You can look up any firm's current status with our "}
        <Link href="/check-a-provider/" className="underline">provider check</Link>.
      </P>
    </PageFrame>
  );
}
