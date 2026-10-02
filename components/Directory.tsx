import Link from "next/link";
import { KIND_LABEL, providerUrl, type ProviderKind } from "@/lib/providers";
import { checkedAt, monogram, type Entry } from "@/lib/directory";
import { longDate } from "@/lib/site";
import { loadLogo } from "@/lib/logo-records";

const TILE: Record<ProviderKind, string> = {
  bank: "bg-brand-700 text-white",
  transfer: "bg-brand-500 text-white",
  broker: "bg-ink text-white",
};

/**
 * The provider's logo, as published on its own website, or an initials tile
 * when we have none. Logos are trade marks of their owners, shown only to
 * identify each provider.
 */
export function Monogram({
  name,
  kind,
  slug,
  size = "md",
}: {
  name: string;
  kind: ProviderKind;
  slug?: string;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "h-16 w-16 text-xl" : "h-12 w-12 text-base";
  const logo = slug ? loadLogo(slug) : null;
  if (logo) {
    return (
      <span className={`flex shrink-0 items-center justify-center border border-line bg-white p-1 ${dim}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.file} alt={`${name} logo`} className="max-h-full max-w-full object-contain" loading="lazy" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center font-bold tracking-tight ${dim} ${TILE[kind]}`}
    >
      {monogram(name)}
    </span>
  );
}

export function KindBadge({ kind }: { kind: ProviderKind }) {
  return (
    <span className="inline-block border border-line-strong px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-body">
      {KIND_LABEL[kind]}
    </span>
  );
}

const year = (d?: string) => (d ? d.slice(0, 4) : "");

/** One row of the directory: identity, the facts we hold, and actions. */
export function ProviderCard({ entry, compareName }: { entry: Entry; compareName?: string }) {
  const { provider: p, company, statement, statedFrns } = entry;
  const c = company?.company;
  const checked = checkedAt(entry);
  return (
    <article className="flex flex-col gap-4 border border-line bg-white p-4 sm:flex-row sm:items-start sm:p-5">
      <Monogram name={p.name} kind={p.kind} slug={p.slug} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-lg font-bold">
            <Link href={providerUrl(p)} className="text-ink no-underline hover:underline">
              {p.name}
            </Link>
          </h3>
          <KindBadge kind={p.kind} />
        </div>

        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Registered company</dt>
            <dd className="font-semibold text-ink">{c ? c.name : "Not yet identified"}</dd>
          </div>
          <div>
            <dt className="text-muted">Company status and incorporated</dt>
            <dd className="font-semibold text-ink">
              {c ? `${c.status ?? "—"}${c.incorporated ? ` · ${year(c.incorporated)}` : ""}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">FCA number stated by the provider</dt>
            <dd className="font-semibold text-ink">{statedFrns.length ? statedFrns.join(", ") : "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Regulatory statement</dt>
            <dd className="font-semibold text-ink">{statement ? "Published on its website" : "Not found"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">
          {checked ? `Records checked ${longDate(checked.slice(0, 10))}` : "No public record fetched yet"}
        </p>
      </div>

      <div className="flex shrink-0 flex-row items-center gap-4 sm:flex-col sm:items-end">
        <Link href={providerUrl(p)} className="bg-brand-700 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-brand-800">
          View profile
        </Link>
        {compareName && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={compareName} value={p.slug} className="h-4 w-4" />
            Compare
          </label>
        )}
      </div>
    </article>
  );
}

/** Headline counts, as on the big directories, but only of facts we hold. */
export function DirectoryStats({ entries }: { entries: Entry[] }) {
  const stats: [string, number][] = [
    ["Providers listed", entries.length],
    ["With a Companies House record", entries.filter((e) => e.company?.company).length],
    ["With a published regulatory statement", entries.filter((e) => e.statement).length],
  ];
  const last = entries.map(checkedAt).filter((d): d is string => Boolean(d)).sort().pop();
  return (
    <div>
      <dl className="grid grid-cols-3 gap-4 sm:max-w-2xl">
        {stats.map(([k, v]) => (
          <div key={k} className="border-l-4 border-accent-500 pl-3">
            <dd className="text-3xl font-bold text-ink">{v}</dd>
            <dt className="text-sm text-muted">{k}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-muted">
        {last ? `Last updated ${longDate(last.slice(0, 10))}. ` : ""}
        {"Records are refreshed automatically every week. "}
        <Link href="/status/" className="link">
          Data status
        </Link>
      </p>
    </div>
  );
}
