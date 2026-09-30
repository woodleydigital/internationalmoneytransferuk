import Link from "next/link";
import type { CompanyRecord } from "@/lib/companies-house";
import { longDate } from "@/lib/site";

/** Values from Companies House, copied as returned, with the date and source beside them. */
export function CompaniesHouseBlock({ record }: { record: CompanyRecord }) {
  const c = record.company!;
  const rows: [string, React.ReactNode][] = [
    ["Registered name", c.name],
    ["Company number", c.number],
    ["Company status", c.status ?? "Not stated"],
    ["Incorporated", c.incorporated ? longDate(c.incorporated) : "Not stated"],
    ["Registered office", c.registeredOffice || "Not stated"],
    ["SIC codes", c.sicCodes.join(", ") || "None filed"],
    [
      "Latest accounts made up to",
      c.lastAccountsMadeUpTo ? longDate(c.lastAccountsMadeUpTo) : "None filed",
    ],
    ["Next accounts due", c.accountsNextDue ? longDate(c.accountsNextDue) : "Not stated"],
    ["Accounts overdue (as recorded by Companies House)", c.accountsOverdue ? "Yes" : "No"],
  ];
  const psc = (record.psc ?? []).filter((p) => !p.ceased_on);

  return (
    <section aria-labelledby="companies-house" className="mt-8">
      <h2 id="companies-house" className="text-2xl font-bold tracking-tight text-ink">
        Companies House record
      </h2>
      <p className="mt-2 text-sm text-muted">
        {`Fetched ${longDate(record.fetchedAt.slice(0, 10))} from Companies House. `}
        <a href={c.url} rel="noopener">
          View this company on Companies House
        </a>
        .
      </p>
      <dl className="mt-4 divide-y divide-line border-y border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-2 sm:grid-cols-[16rem_1fr]">
            <dt className="font-semibold text-ink">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 font-semibold text-ink">Persons with significant control</h3>
      {psc.length === 0 ? (
        <p className="mt-2">None listed at Companies House.</p>
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
        <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="noopener">
          Open Government Licence v3.0
        </a>
        {". Source: Companies House. Names are shown as published on the public register; see our "}
        <Link href="/privacy/">privacy notice</Link>.
      </p>
    </section>
  );
}
