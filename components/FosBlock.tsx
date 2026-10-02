import Link from "next/link";
import { percent, PUBLICATION_RULE, type FosRecord } from "@/lib/fos";
import { SourceLine, Term } from "@/components/Page";

const OGL = "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/";
const count = (n?: number) => (n === undefined ? "—" : new Intl.NumberFormat("en-GB").format(n));

/**
 * The Ombudsman's published complaint figures for the company behind a
 * provider, copied as published under its own headings. No grading, no
 * comparison beyond the average the Ombudsman itself states.
 */
export function FosBlock({ name, record, sharedWith }: { name: string; record: FosRecord; sharedWith: { name: string; href: string }[] }) {
  const latest = record.periods[0];
  const listed = record.periods.filter((p) => p.figures);
  return (
    <section aria-labelledby="complaints" className="mt-8">
      <h2 id="complaints" className="text-2xl font-bold tracking-tight text-ink">
        Complaints to the <Term slug="financial-ombudsman-service">Financial Ombudsman Service</Term>
      </h2>
      <SourceLine
        source={
          <a href={latest.period.pageUrl} rel="noopener">
            Financial Ombudsman Service, half-yearly business complaints data
          </a>
        }
        fetchedAt={record.fetchedAt}
        note="figures copied as published"
      />

      {listed.length === 0 ? (
        <p className="mt-4 max-w-prose">
          {`${record.company} does not appear in the Ombudsman’s published data for ${record.periods.map((p) => p.period.label).join(" or ")}. ${PUBLICATION_RULE}`}
        </p>
      ) : (
        <>
          <p className="mt-4 max-w-prose">
            {`Figures for ${record.company}, the registered company behind ${name}. They cover complaints about all of the company’s products, not only international transfers.`}
            {sharedWith.length > 0 && (
              <>
                {" The same company also trades as "}
                {sharedWith.map((s, i) => (
                  <span key={s.href}>
                    {i > 0 && (i === sharedWith.length - 1 ? " and " : ", ")}
                    <Link href={s.href}>{s.name}</Link>
                  </span>
                ))}
                {", so these figures include those brands."}
              </>
            )}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <caption className="sr-only">{`Financial Ombudsman Service complaints data for ${record.company}`}</caption>
              <thead>
                <tr className="border-b-2 border-ink">
                  <th scope="col" className="py-2 pr-3">Period</th>
                  <th scope="col" className="px-3 py-2 text-right">Total new cases</th>
                  <th scope="col" className="px-3 py-2 text-right">Total % of cases upheld</th>
                  <th scope="col" className="px-3 py-2 text-right">Total proactive settled resolved</th>
                </tr>
              </thead>
              <tbody>
                {record.periods.map(({ period, figures }) => (
                  <tr key={period.label} className="border-b border-line align-top">
                    <th scope="row" className="py-2 pr-3 font-normal">
                      <strong className="text-ink">{period.label}</strong>
                      <span className="block text-xs text-muted">{period.span}</span>
                    </th>
                    {figures ? (
                      <>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{count(figures.newCases)}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-ink">{percent(figures.upheld)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{count(figures.proactiveSettled)}</td>
                      </>
                    ) : (
                      <td colSpan={3} className="px-3 py-2 text-muted">
                        Not in the published data for this period
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {latest.figures && (latest.figures.newByProduct.length > 1 || latest.figures.upheldByProduct.length > 0) && (
            <dl className="mt-4 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
              {latest.figures.newByProduct.map(([h, n]) => (
                <div key={`n-${h}`} className="flex justify-between gap-3 border-b border-line py-1">
                  <dt>{`New cases, ${h} (${latest.period.label})`}</dt>
                  <dd className="tabular-nums">{count(n)}</dd>
                </div>
              ))}
              {latest.figures.upheldByProduct.map(([h, p]) => (
                <div key={`u-${h}`} className="flex justify-between gap-3 border-b border-line py-1">
                  <dt>{`% of closed cases upheld, ${h} (${latest.period.label})`}</dt>
                  <dd className="tabular-nums">{percent(p)}</dd>
                </div>
              ))}
            </dl>
          )}
          {latest.period.averageUpheld && (
            <p className="mt-3 text-sm">{`Across all businesses in ${latest.period.label}, the Ombudsman states: “${latest.period.averageUpheld}”.`}</p>
          )}
        </>
      )}

      <p className="mt-4 text-xs text-muted">
        {"“Upheld” means the Ombudsman decided in the consumer’s favour. A business is linked to a provider only when the Ombudsman publishes it under exactly the registered company name we hold from Companies House. "}
        {"Contains public sector information licensed under the "}
        <a href={OGL} rel="noopener">
          Open Government Licence v3.0
        </a>
        {`. Source: Financial Ombudsman Service, `}
        <a href={latest.period.fileUrl} rel="noopener">
          {`business complaints data ${latest.period.label}`}
        </a>
        .
      </p>
    </section>
  );
}
