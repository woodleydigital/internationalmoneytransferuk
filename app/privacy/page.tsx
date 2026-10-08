import type { Metadata } from "next";
import Link from "next/link";
import { SITE, PRIVACY_NOTICE_COMPLETE } from "@/lib/site";
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
        The Companies House import collects a limited record of persons with significant
        control: their published name, type of owner, nature of control, notification date
        and any cessation date. This information comes from the public Companies House register.
      </P>
      <P>
        {PRIVACY_NOTICE_COMPLETE
          ? "Profiles show the published names and control details of current owners, including individuals."
          : "Profiles currently show corporate owners and the number of individual owners, with a link to the original record. Individual owners' names are withheld from profile pages."}
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
        Imports run weekly. Records older than 14 days are hidden from profiles, and owners
        marked as having ceased control are excluded from the displayed list. Hiding a record
        does not delete it: historical versions are retained in the project's data audit
        history. Contact us about correction, objection or deletion requests so the stored
        record and its history can also be considered.
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
        The site does not use analytics or set tracking cookies. Our hosting provider keeps
        standard server logs, including IP addresses and requested URLs, to run and protect
        the service. A search term can appear in the URL, browser history and those logs, so
        do not enter personal or confidential information into a provider search.
      </P>
      <P>
        When you use the provider check, the firm name is sent to the FCA Register. Results
        may be cached for up to one hour and are not copied into provider profiles. The
        visitor's IP address is temporarily held in server-instance memory to limit request
        frequency. The quote cost calculator submits its inputs to our server as URL
        parameters for the calculation and reference-rate lookup. Those inputs can therefore
        appear in browser history and server logs. The calculator does not ask for bank
        account numbers, payment credentials or other identifying information.
      </P>

      <P>
        <Link href="/methodology/">How the directory is built</Link>
        {" · "}
        <Link href="/corrections/">Report an error</Link>
      </P>
    </PageFrame>
  );
}
