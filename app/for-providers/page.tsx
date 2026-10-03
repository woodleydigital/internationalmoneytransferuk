import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { H2, P, PageFrame, ContactAddress } from "@/components/Page";

const TITLE = "For providers: claim or correct your profile";
const DESCRIPTION =
  "How money transfer providers can correct their profile in the IMTUK directory. Listing is free and cannot be paid for.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/for-providers/" },
};

export default function Page() {
  return (
    <PageFrame
      schema={{ path: "/for-providers/", name: TITLE, description: DESCRIPTION }} trail={[{ name: "For providers" }]} title={<>For providers: claim or correct your profile</>} lead={<>Listing is free, and every provider we can verify is listed. You cannot pay to be
        listed, to be ranked, or to change what your profile says.</>}>
      
      <H2>What you can change</H2>
      <P>
        Regulatory and company facts come directly from the FCA Register and Companies House.
        If one of them is wrong, it needs correcting at the source; our profile updates at the
        next weekly refresh.
      </P>
      <P>
        Product details — corridors, payout methods, fees, limits and safeguarding — come from
        your own website and terms. If we have misread them, send us the page and the exact
        wording and it will be checked against that page.
      </P>

      <H2>Your logo</H2>
      <P>
        We show the logo your own website publishes as its icon, only to identify you in the
        directory. If you would rather we did not, write to us and we will replace it with your
        initials.
      </P>

      <H2>Contact</H2>
      <ContactAddress subject="Provider profile" />
      <P>
        <Link href="/methodology/" className="underline">Methodology</Link>
        {" · "}
        <Link href="/how-we-get-paid/" className="underline">How we get paid</Link>
      </P>
    </PageFrame>
  );
}
