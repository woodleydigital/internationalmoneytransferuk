import type { Change } from "@/lib/changes";
import { longDate } from "@/lib/site";

/** The profile's change log: what our weekly imports found had changed, copied from each source. */
export function ChangesBlock({ changes }: { changes: Change[] }) {
  return (
    <section aria-labelledby="changes" className="mt-8">
      <h2 id="changes" className="text-2xl font-bold tracking-tight text-ink">
        Changes we have recorded
      </h2>
      <p className="mt-2 text-sm text-muted">
        Each week software compares the latest public records with the previous week’s and logs what changed.
      </p>
      <ol className="mt-4 divide-y divide-line border-y border-line">
        {changes.map((c, i) => (
          <li key={`${c.date}-${i}`} className="grid gap-1 py-2 text-sm sm:grid-cols-[10rem_1fr]">
            <span className="text-muted">{longDate(c.date)}</span>
            <span>
              <strong className="text-ink">{c.field}</strong>
              {c.from !== undefined && c.to !== undefined && (
                <span>{` changed from “${c.from}” to “${c.to}”`}</span>
              )}
              {c.from === undefined && <span> changed</span>}
              <span className="text-muted">{` · ${c.source}`}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
