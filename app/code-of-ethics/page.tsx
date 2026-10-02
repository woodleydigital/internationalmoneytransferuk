import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, P, PageFrame, webPage } from "@/components/Page";

export const metadata: Metadata = {
  title: "Code of ethics",
  description: "The editorial standards IMTUK works to.",
  alternates: { canonical: "/code-of-ethics/" },
};

const RULES: [string, string][] = [
  ["Facts come from source.", "Regulatory and company facts are taken from the FCA Register, Companies House and the Financial Ombudsman Service, and each shows when it was last verified."],
  ["We say what we don't know.", "Where data has not been collected, the page says so. We do not estimate, round up or fill gaps."],
  ["Bad news is quoted, not described.", "Anything that reflects badly on a firm is shown exactly as the official source records it, with a link and a date. We add no comment of our own."],
  ["Automation is disclosed.", "This site is compiled by software. We never imply that a person has tested a provider or reviewed a page."],
  ["Money does not buy position.", "No provider can pay to be listed, ranked or described differently."],
  ["Commercial links are labelled.", "Anything we are paid for is marked and kept separate from the facts."],
  ["Mistakes are corrected in public.", "Corrections are made promptly and recorded in our corrections log."],
  ["Plain English.", "We explain any technical term we use, and write in British English."],
];

export default function Page() {
  return (
    <PageFrame trail={[{ name: "Code of ethics" }]} title={<>Code of ethics</>}>
      <JsonLd data={webPage("/code-of-ethics/", "Code of ethics")} />
      <ol className="mt-6 max-w-prose list-decimal space-y-3 pl-5">
        {RULES.map(([title, body]) => (
          <li key={title}>
            <strong className="text-ink">{title}</strong> {body}
          </li>
        ))}
      </ol>
      <P>
        <Link href="/corrections/" className="underline">Corrections log</Link>
        {" · "}
        <Link href="/how-we-get-paid/" className="underline">How we get paid</Link>
      </P>
    </PageFrame>
  );
}
