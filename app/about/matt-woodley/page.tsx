import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/Page";
import { MATT_WOODLEY, personSchema, personId, personUrl } from "@/lib/people";
import { SITE } from "@/lib/site";

const p = MATT_WOODLEY;

const DESCRIPTION = `${p.name} is ${p.jobTitle} and owner of ${SITE.alternateName}.`;

export const metadata: Metadata = {
  title: `${p.name} — ${p.jobTitle}`,
  description: DESCRIPTION,
  alternates: { canonical: `/about/${p.slug}/` },
};

export default function Page() {
  return (
    <PageFrame
      // ProfilePage. Every property is evidenced — see lib/people.ts. No photograph,
      // no profile links and no experience claims, because none have been supplied.
      schema={{
        path: personUrl(p),
        name: `${p.name} — ${p.jobTitle}`,
        description: DESCRIPTION,
        type: "ProfilePage",
        mainEntity: { "@id": personId(p) },
        nodes: [personSchema(p)],
      }}
      trail={[{ name: "About us", href: "/about/" }, { name: p.name }]} title={<>{p.name}</>} lead={<>{`${p.jobTitle}, ${SITE.name}`}</>}>

      <h2 className="mt-10 text-xl font-semibold text-ink">Background</h2>
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
        {p.credentials.map((c) => (
          <li key={c.name}>
            {c.name}, {c.institution}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-ink">Role</h2>
      <p className="mt-3 max-w-prose">
        {`Matt owns ${SITE.name} and is responsible for it. Matt does not test providers or review individual pages: the directory is compiled automatically from public records, as set out in `}
        <Link href="/methodology/" className="text-brand-600 underline">
          our methodology
        </Link>
        . Nothing on this site is financial advice.
      </p>

      <p className="mt-10">
        <Link href="/about/" className="text-brand-600 underline">
          About {SITE.name}
        </Link>
      </p>
    </PageFrame>
  );
}
