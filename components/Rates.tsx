import Link from "next/link";
import { formatChange, formatRate, STRIP_CURRENCIES, type RateTable } from "@/lib/rate-table";
import { longDate } from "@/lib/site";
import { SourceLine, Term } from "@/components/Page";

const short = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

/** The full table. Renders nothing if there is no fresh data. */
export function RateTableBlock({ table }: { table: RateTable | null }) {
  if (!table) return null;
  const mixed = new Set(table.rows.map((r) => r.date)).size > 1;
  return (
    <section aria-labelledby="rates-heading" id="rates" className="mt-14 scroll-mt-4 border-t border-line pt-8">
      <h2 className="text-2xl font-bold tracking-tight text-ink" id="rates-heading">
        Today’s <Term slug="mid-market-rate">mid-market reference rates</Term> against the pound
      </h2>
      <p className="mt-3 max-w-prose">
        {`What one pound buys at the mid-market rate published on ${longDate(table.date)}. These are reference rates from central banks, updated once each working day. No provider will give you one: use them to see how much a quote costs you.`}
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <caption className="sr-only">{`Mid-market reference rates for 1 British pound, ${longDate(table.date)}`}</caption>
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className="py-2 pr-3">Currency</th>
              <th scope="col" className="px-3 py-2 text-right">1 GBP =</th>
              <th scope="col" className="px-3 py-2 text-right">7 days</th>
              <th scope="col" className="px-3 py-2 text-right">30 days</th>
              <th scope="col" className="px-3 py-2 text-right">Central banks</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r) => (
              <tr key={r.code} className="border-b border-line">
                <th scope="row" className="py-2 pr-3 font-normal">
                  <strong className="text-ink">{r.code}</strong> <span className="text-muted">{r.name}</span>
                  {mixed && r.date !== table.date && <span className="block text-xs text-muted">{`Published ${short(r.date)}`}</span>}
                </th>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-ink">{formatRate(r.rate)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatChange(r.change7)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatChange(r.change30)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted">{r.sources}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SourceLine
        source={
          <a href="https://frankfurter.dev/" rel="noopener">
            Frankfurter
          </a>
        }
        fetchedAt={table.date}
        dateLabel="Published"
        note="a blend of central bank reference rates; change is in units per pound"
      />
      <p className="mt-2 text-sm text-muted">
        Not a quote, an offer or a rate any provider will give you, and not financial advice.
      </p>
    </section>
  );
}

/** One line for the homepage, linking to the full table. */
export function RateStrip({ table }: { table: RateTable | null }) {
  if (!table) return null;
  const rows = STRIP_CURRENCIES.map((c) => table.rows.find((r) => r.code === c)).filter((r) => r !== undefined);
  if (!rows.length) return null;
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3 text-sm">
        <span className="font-semibold text-ink">{`£1 at mid-market, ${short(table.date)}:`}</span>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {rows.map((r) => (
            <li key={r.code} className="tabular-nums">
              <span className="text-muted">{r.code}</span> <strong className="text-ink">{formatRate(r.rate)}</strong>
            </li>
          ))}
        </ul>
        <Link href="/compare/#rates" className="link">
          All reference rates
        </Link>
      </div>
    </div>
  );
}
