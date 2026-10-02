import { formatFigure, type CompanyExtras } from "@/lib/company-extras";
import { longDate } from "@/lib/site";
import { SourceLine, Term } from "@/components/Page";

const day = (iso?: string) => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? longDate(iso.slice(0, 10)) : iso ?? "—");

/** Ownership, accounts figures, charges, previous names and the filing timeline, from Companies House. */
export function CompanyExtrasBlock({ name, extras }: { name: string; extras: CompanyExtras }) {
  const figures = extras.accounts?.figures ?? [];
  return (
    <section aria-labelledby="company-more" className="mt-8">
      <h2 id="company-more" className="text-2xl font-bold tracking-tight text-ink">
        Ownership, accounts and filings
      </h2>
      <SourceLine
        source={
          <a href={`https://find-and-update.company-information.service.gov.uk/company/${extras.number}`} rel="noopener">
            Companies House
          </a>
        }
        fetchedAt={extras.fetchedAt}
        note="values copied as filed"
      />

      <h3 className="mt-5 font-semibold text-ink">Who owns the company</h3>
      {extras.owners.length === 0 ? (
        <p className="mt-2">
          {"No current corporate owner was returned from the company’s persons with significant control. "}
          <a href={`https://find-and-update.company-information.service.gov.uk/company/${extras.number}/persons-with-significant-control`} rel="noopener">
            Check the register at Companies House
          </a>
          .
        </p>
      ) : (
        <ol className="mt-2 space-y-2">
          {extras.owners.map((o, i) => (
            <li key={`${o.name}-${i}`} className="border-l-4 border-line-strong pl-3">
              <span className="text-sm text-muted">{i === 0 ? `Owner of the company behind ${name}` : "Which is owned by"}</span>
              <span className="block font-semibold text-ink">
                {o.url ? (
                  <a href={o.url} rel="noopener">
                    {o.name}
                  </a>
                ) : (
                  o.name
                )}
                {o.registeredIn ? <span className="font-normal text-muted">{` · registered in ${o.registeredIn}`}</span> : null}
              </span>
              {o.control.length > 0 && <span className="block text-sm text-muted">{o.control.join("; ")}</span>}
              <a
                href={`https://find-and-update.company-information.service.gov.uk/company/${i === 0 ? extras.number : extras.owners[i - 1].number}/persons-with-significant-control`}
                rel="noopener"
                className="text-xs"
              >
                As recorded at Companies House
              </a>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-2 text-xs text-muted">
        Corporate owners recorded as <Term slug="psc">persons with significant control</Term>, copied as Companies House records
        them and followed up the chain only while each is a single owner registered there under the same name. Individuals are
        not shown.
      </p>

      {extras.accounts && (
        <>
          <h3 className="mt-6 font-semibold text-ink">
            <Term slug="annual-accounts">Figures from the latest accounts</Term>
          </h3>
          {figures.length ? (
            <>
              <dl className="mt-2 divide-y divide-line border-y border-line">
                {figures.map((f) => (
                  <div key={f.label} className="grid gap-1 py-2 sm:grid-cols-[16rem_1fr]">
                    <dt className="font-semibold text-ink">{f.label}</dt>
                    <dd className="tabular-nums">
                      {formatFigure(f)}
                      <span className="ml-2 text-sm text-muted">{`period ending ${day(f.periodEnd)}`}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-xs text-muted">
                {`Read from the tagged accounts filed on ${day(extras.accounts.filedOn)}${extras.accounts.madeUpTo ? `, made up to ${day(extras.accounts.madeUpTo)}` : ""}. A negative figure is a loss. `}
                <a href={extras.accounts.url} rel="noopener">
                  See the filing
                </a>
                .
              </p>
            </>
          ) : (
            <p className="mt-2">
              {`The latest accounts${extras.accounts.madeUpTo ? `, made up to ${day(extras.accounts.madeUpTo)},` : ""} were not filed in a machine-readable form, so no figures are copied here. `}
              <a href={extras.accounts.url} rel="noopener">
                See the filing at Companies House
              </a>
              .
            </p>
          )}
        </>
      )}

      {extras.charges && (
        <>
          <h3 className="mt-6 font-semibold text-ink">Registered charges</h3>
          <p className="mt-2">
            {extras.charges.total === 0
              ? "No charges are registered against the company."
              : `${extras.charges.total} registered, of which ${extras.charges.satisfied} satisfied and ${extras.charges.outstanding} not recorded as satisfied. `}
            {extras.charges.total > 0 && (
              <a href={extras.charges.url} rel="noopener">
                See the charges
              </a>
            )}
          </p>
          <p className="mt-1 text-xs text-muted">A charge is security a company gives a lender, such as a debenture or mortgage.</p>
        </>
      )}

      {extras.previousNames.length > 0 && (
        <>
          <h3 className="mt-6 font-semibold text-ink">Previous company names</h3>
          <ul className="mt-2 space-y-1">
            {extras.previousNames.map((n) => (
              <li key={`${n.name}-${n.from}`}>
                {n.name}
                <span className="text-sm text-muted">{` · ${day(n.from)} to ${day(n.to)}`}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {extras.timeline.length > 0 && (
        <details className="mt-6 border border-line">
          <summary className="cursor-pointer bg-wash px-4 py-3 font-semibold text-ink">{`Filing timeline (${extras.timeline.length} most recent filings shown)`}</summary>
          <ol className="divide-y divide-line px-4">
            {extras.timeline.map((t, i) => (
              <li key={`${t.date}-${i}`} className="grid gap-1 py-2 text-sm sm:grid-cols-[10rem_1fr]">
                <span className="text-muted">{day(t.date)}</span>
                <a href={t.url} rel="noopener">
                  {t.label}
                </a>
              </li>
            ))}
          </ol>
        </details>
      )}
      <p className="mt-4 text-xs text-muted">
        {"Contains public sector information licensed under the "}
        <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="noopener">
          Open Government Licence v3.0
        </a>
        {", source Companies House."}
      </p>
    </section>
  );
}
