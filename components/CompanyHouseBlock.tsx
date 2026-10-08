import Link from "next/link";
import type { CompanyRecord } from "@/lib/companies-house";
import { longDate, PRIVACY_NOTICE_COMPLETE } from "@/lib/site";
import { SourceLine, Term } from "@/components/Page";

/** Values from Companies House, copied as returned, with the date and source beside them. */
export function CompaniesHouseBlock({ record }: { record: CompanyRecord }) {
  const c = record.company!;
  const rows: [React.ReactNode, React.ReactNode][] = [
    ["Registered name", c.name],
    [<Term key="t" slug="company-number">Company number</Term>, c.number],
    [<Term key="t" slug="company-status">Company status</Term>, c.status ?? "Not stated"],
    ["Incorporated", c.incorporated ? longDate(c.incorporated) : "Not stated"],
    [<Term key="t" slug="registered-office">Registered office</Term>, c.registeredOffice || "Not stated"],
    [<Term key="t" slug="sic-code">SIC codes</Term>, c.sicCodes.join(", ") || "None filed"],
    [
      <Term key="t" slug="annual-accounts">Latest accounts made up to</Term>,
      c.lastAccountsMadeUpTo ? longDate(c.lastAccountsMadeUpTo) : "None filed",
    ],
    ["Next accounts due", c.accountsNextDue ? longDate(c.accountsNextDue) : "Not stated"],
    ["Accounts overdue (as recorded by Companies House)", c.accountsOverdue ? "Yes" : "No"],
  ];
  const current = (record.psc ?? []).filter((p) => !p.ceased_on);
  const isPerson = (k?: string) => (k ?? "").startsWith("individual");
  const psc = PRIVACY_NOTICE_COMPLETE ? current : current.filter((p) => !isPerson(p.kind));
  const hiddenPeople = current.length - psc.length;

  return (
    <section aria-labelledby="companies-house" className="mt-8">
      <h2 id="companies-house" className="text-2xl font-bold tracking-tight text-ink">
        Companies House record
      </h2>
      <SourceLine
        source={
          <a href={c.url} rel="noopener nofollow">
            Companies House
          </a>
        }
        fetchedAt={record.fetchedAt}
        note="values copied as returned"
      />
      <dl className="mt-4 divide-y divide-line border-y border-line">
        {rows.map(([k, v], i) => (
          <div key={i} className="grid gap-1 py-2 sm:grid-cols-[16rem_1fr]">
            <dt className="font-semibold text-ink">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 font-semibold text-ink">
        <Term slug="psc">Persons with significant control</Term>
      </h3>
      {hiddenPeople > 0 && (
        <p className="mt-2 text-sm">
          {`${hiddenPeople} ${hiddenPeople === 1 ? "individual is" : "individuals are"} listed at Companies House. We do not show individuals' names yet; see the company's `}
          <a href={`${c.url}/persons-with-significant-control`} rel="noopener nofollow">
            Companies House record
          </a>
          .
        </p>
      )}
      {psc.length === 0 ? (
        hiddenPeople === 0 && <p className="mt-2">None listed at Companies House.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {psc.map((p) => (
            <li key={`${p.name}-${p.notified_on}`}>
              <strong className="text-ink">{p.name}</strong>
              <span className="block text-sm text-muted">
                {(p.natures_of_control ?? []).map((n) => n.replace(/-/g, " ")).join("; ")}
                {p.notified_on ? ` · notified ${longDate(p.notified_on)}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-muted">
        {"How this company was identified: "}
        {record.match.rule}{" "}
        {"Contains public sector information licensed under the "}
        <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="noopener nofollow">
          Open Government Licence v3.0
        </a>
        {". Source: Companies House. Names are shown as published on the public register; see our "}
        <Link href="/privacy/">privacy notice</Link>.
      </p>
    </section>
  );
}
