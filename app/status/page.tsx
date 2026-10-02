import type { Metadata } from "next";
import Link from "next/link";
import { PROVIDERS, providerUrl } from "@/lib/providers";
import { MAX_AGE_DAYS } from "@/lib/company-records";
import { OUTCOME, nextRun, pipelines } from "@/lib/status";
import { longDate } from "@/lib/site";
import { H2, P, PageFrame } from "@/components/Page";

const TITLE = "Data status";
const DESCRIPTION =
  "When each automated import last ran, what it found, and when it runs next: Companies House records, provider statements and logos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/status/" },
};

// Re-read the records hourly so the page reflects the latest import.
export const revalidate = 3_600;

const day = (iso?: string) => (iso ? longDate(iso.slice(0, 10)) : "—");

export default function Page() {
  const now = new Date();
  const ps = pipelines(now);
  const next = nextRun(now);
  const providers = [...PROVIDERS].sort((a, b) => a.name.localeCompare(b.name, "en-GB"));

  return (
    <PageFrame
      trail={[{ name: TITLE }]}
      title={<>{TITLE}</>}
      lead={<>Everything in the directory is collected by software. This page shows when each import last ran and what it found.</>}
      schema={{ path: "/status/", name: TITLE, description: DESCRIPTION }}
    >
      <P>
        {`The imports run automatically every week. The next run is scheduled for ${longDate(next.toISOString().slice(0, 10))} at ${next.toISOString().slice(11, 16)} UTC. A record not refreshed within ${MAX_AGE_DAYS} days is taken off the site rather than shown out of date.`}
      </P>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ps.map((p) => (
          <section key={p.key} aria-labelledby={`p-${p.key}`} className="border border-line bg-white p-4">
            <h2 id={`p-${p.key}`} className="font-bold text-ink">
              {p.name}
            </h2>
            <p className="mt-1 text-sm text-muted">{p.what}</p>
            <p className="mt-3 text-sm">
              <span className="text-muted">Last run: </span>
              <strong className="text-ink">{day(p.lastRun)}</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {p.counts.map(([k, n]) => (
                <li key={k} className="flex justify-between gap-2">
                  <span>{OUTCOME[k] ?? k}</span>
                  <strong className="text-ink">{n}</strong>
                </li>
              ))}
              {p.stale > 0 && (
                <li className="flex justify-between gap-2">
                  <span>{`Older than ${MAX_AGE_DAYS} days (hidden)`}</span>
                  <strong className="text-ink">{p.stale}</strong>
                </li>
              )}
            </ul>
          </section>
        ))}
      </div>

      <H2 id="providers">By provider</H2>
      <P>
        What each import found for each provider. “No certain match” and “Nothing found”
        describe our import, not the provider: they mean we could not link or read a record with
        certainty, so we show nothing rather than guess.
      </P>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className="py-2 pr-3">Provider</th>
              {ps.map((p) => (
                <th key={p.key} scope="col" className="px-3 py-2">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {providers.map((pr) => (
              <tr key={pr.slug} className="border-b border-line align-top">
                <th scope="row" className="py-2 pr-3 font-semibold">
                  <Link href={providerUrl(pr)}>{pr.name}</Link>
                </th>
                {ps.map((p) => {
                  const r = p.records.get(pr.slug);
                  return (
                    <td key={p.key} className="px-3 py-2">
                      {r ? (
                        <>
                          {OUTCOME[r.status ?? "error"] ?? r.status}
                          <span className="block text-xs text-muted">{day(r.fetchedAt)}</span>
                        </>
                      ) : (
                        <span className="text-muted">
                          {!pr.website && p.key !== "companies-house" ? "No website on file" : "Not yet run"}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <P className="text-sm text-muted">
        {"The FCA Register is not imported yet, so no profile states FCA status. "}
        <Link href="/methodology/">How the directory is built</Link>.
      </P>
    </PageFrame>
  );
}
