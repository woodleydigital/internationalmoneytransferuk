import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { H2, P, PageFrame, ContactAddress } from "@/components/Page";

const TITLE = "Privacy notice";
const DESCRIPTION =
  "What personal data IMTUK publishes from public registers, why, and how to object.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy/" },
};

export default function Page() {
  return (
    <PageFrame
      schema={{ path: "/privacy/", name: TITLE, description: DESCRIPTION }}
      trail={[{ name: "Privacy notice" }]}
      title={<>Privacy notice</>}
      lead={<>What personal data this site shows, where it comes from, and how to ask us to remove it.</>}
    >
      
      <H2>Who is responsible</H2>
      <P>
        {`${SITE.name} is responsible for the personal data described here. You can contact us by email or post at the address below.`}
      </P>
      <ContactAddress subject="Privacy request" />

      <H2>Personal data from public registers</H2>
      <P>
        Provider profiles show the names of people registered at Companies House as persons
        with significant control of a provider — usually its owners — together with the nature
        of their control and the date it was notified. This information is already public on
        the Companies House register, and we copy it from there automatically.
      </P>
      <P>
        We do not store or show dates of birth, home or service addresses, or nationality, even
        where the register holds them.
      </P>

      <H2>Why we use it</H2>
      <P>
        Knowing who owns and controls a money transfer provider helps people decide whether to
        trust it with their money. We rely on legitimate interests as our lawful basis under UK
        data protection law, and we publish only what that purpose needs.
      </P>

      <H2>How long we keep it</H2>
      <P>
        Each record is refreshed weekly from Companies House. If a record has not been refreshed
        for 14 days it is no longer shown, and when a person stops being listed at Companies
        House they are removed at the next refresh.
      </P>

      <H2>Your rights</H2>
      <P>
        You can ask us for a copy of the personal data we hold about you, ask us to correct it,
        or object to it being shown. Write to us at the address above. If you are not satisfied
        with our response, you can complain to the{" "}
        <a href="https://ico.org.uk/make-a-complaint/" rel="noopener nofollow">
          Information Commissioner’s Office
        </a>
        .
      </P>

      <H2>Visitors to this site</H2>
      <P>
        This site does not set cookies or use analytics. Our hosting provider keeps standard
        server logs, such as IP addresses and the pages requested, to run and protect the
        service. Searches you make on the site are not stored by us. When you use the provider
        check, the firm name you enter is sent to the FCA Register to run the search.
      </P>

      <P>
        <Link href="/methodology/">How the directory is built</Link>
        {" · "}
        <Link href="/corrections/">Report an error</Link>
      </P>
    </PageFrame>
  );
}
