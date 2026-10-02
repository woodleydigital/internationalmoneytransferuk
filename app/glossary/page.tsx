import type { Metadata } from "next";
import { GLOSSARY } from "@/lib/glossary";
import { abs, LANG } from "@/lib/schema";
import { SITE } from "@/lib/site";
import { P, PageFrame } from "@/components/Page";

const TITLE = "Glossary";
const DESCRIPTION =
  "Plain-English explanations of the terms used in the directory: FCA Register, firm reference number, company number, mid-market rate, safeguarding and more.";
const SET_ID = `${SITE.url}/glossary/#terms`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/glossary/" },
};

const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, "en-GB"));

export default function Page() {
  return (
    <PageFrame
      trail={[{ name: TITLE }]}
      title={<>{TITLE}</>}
      lead={<>The terms used on this site, explained in plain English.</>}
      schema={{
        path: "/glossary/",
        name: TITLE,
        description: DESCRIPTION,
        mainEntity: { "@id": SET_ID },
        nodes: [
          {
            "@type": "DefinedTermSet",
            "@id": SET_ID,
            name: `${SITE.alternateName} glossary`,
            inLanguage: LANG,
            hasDefinedTerm: terms.map((t) => ({
              "@type": "DefinedTerm",
              "@id": `${abs("/glossary/")}#${t.slug}`,
              name: t.term,
              ...(t.also ? { alternateName: t.also.split(/,\s*/) } : {}),
              description: t.definition,
              url: `${abs("/glossary/")}#${t.slug}`,
              inDefinedTermSet: { "@id": SET_ID },
            })),
          },
        ],
      }}
    >
      <nav aria-label="Terms" className="mt-6 text-sm">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {terms.map((t) => (
            <li key={t.slug}>
              <a href={`#${t.slug}`}>{t.term}</a>
            </li>
          ))}
        </ul>
      </nav>

      <dl className="mt-8 divide-y divide-line border-y border-line">
        {terms.map((t) => (
          <div key={t.slug} id={t.slug} className="scroll-mt-4 py-4">
            <dt className="text-lg font-bold text-ink">
              {t.term}
              {t.also && <span className="ml-2 text-base font-normal text-muted">{`(${t.also})`}</span>}
            </dt>
            <dd className="mt-1 max-w-prose">
              {t.definition}
              {t.source && (
                <span className="mt-1 block text-sm">
                  {"More: "}
                  <a href={t.source.url} rel="noopener">
                    {t.source.label}
                  </a>
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <P className="text-sm text-muted">
        These are general explanations, not legal or financial advice, and they say nothing about
        any particular provider.
      </P>
    </PageFrame>
  );
}
