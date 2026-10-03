import type { Metadata } from "next";
import Link from "next/link";
import { MATT_WOODLEY, personUrl } from "@/lib/people";
import { SITE, ID } from "@/lib/site";
import { H2, P, PageFrame, ContactAddress } from "@/components/Page";

const DESCRIPTION = "Who runs IMTUK, how the directory is built, and who owns it.";

export const metadata: Metadata = {
  title: "About us",
  description: DESCRIPTION,
  alternates: { canonical: "/about/" },
};

export default function Page() {
  return (
    <PageFrame
      schema={{
        path: "/about/",
        name: `About ${SITE.name}`,
        description: DESCRIPTION,
        type: "AboutPage",
        mainEntity: { "@id": ID.organization },
      }}
      trail={[{ name: "About" }]} title={<>About {SITE.name}</>} lead={<>{`${SITE.name} (${SITE.alternateName}) is a directory of the firms that send money abroad from the UK, built from the public record.`}</>}>
      <H2>What we do</H2>
      <P>
        {"For each provider we collect what Companies House and the Financial Ombudsman Service record about the company behind it, and what the provider says on its own website, and show when each was last fetched. "}
        <Link href="/methodology/" className="underline">How we build each profile</Link>.
      </P>

      <H2>Why this site exists</H2>
      <P>
        Before you send money abroad, it helps to know who you are really dealing with: the
        company behind the brand, what the public record says about it, and what it promises on
        its own website. This directory puts those in one place, shows where each came from,
        and leaves the decision to you.
      </P>

      <H2>How this site is made</H2>
      <P>
        {"The directory is compiled entirely by software that copies public records and quotes providers’ own websites word for word. AI helped write the software and the explanatory pages, but it does not produce any provider data. Nobody tests providers or reviews profiles by hand, so we never claim that anyone has. "}
        <Link href="/methodology/" className="underline">The rules the software follows</Link>.
      </P>

      <H2>What we are not</H2>
      <P>
        We are not a bank, a money transfer provider or a currency broker. We do not hold money,
        we do not make transfers, and we cannot quote you a rate. Nothing on this site is
        financial advice.
      </P>

      <H2>Ownership</H2>
      <P>
        {`${SITE.name} is privately owned and is not a government body. Its owner also operates other personal finance websites, including currencybrokers.uk. No provider has any say in what this directory publishes.`}
      </P>

      <H2>Who we are</H2>
      <P>
        <Link href={personUrl(MATT_WOODLEY)} className="underline">
          {MATT_WOODLEY.name}
        </Link>
        {`, ${MATT_WOODLEY.jobTitle}. ${MATT_WOODLEY.credentials
          .map((c) => `${c.name}, ${c.institution}`)
          .join("; ")}.`}
      </P>

      <H2>How we are funded</H2>
      <P>
        {"Listing is free and no provider can pay for its position or its data. "}
        <Link href="/how-we-get-paid/" className="underline">How we get paid</Link>
        {" · "}
        <Link href="/code-of-ethics/" className="underline">Code of ethics</Link>
      </P>

      <H2>Where to find us</H2>
      <ContactAddress />
    </PageFrame>
  );
}
