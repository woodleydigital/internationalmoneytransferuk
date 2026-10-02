import type { Metadata } from "next";
import Link from "next/link";
import { KIND_LABEL, PROVIDERS, providerUrl } from "@/lib/providers";
import { loadEntries } from "@/lib/directory-data";
import type { Entry } from "@/lib/directory";
import { longDate } from "@/lib/site";
import { registerSearchUrl } from "@/lib/fca";
import { P, PageFrame } from "@/components/Page";
import { Monogram } from "@/components/Directory";

type SearchParams = Record<string, string | string[] | undefined>;
const MAX = 3;

const pick = (params: SearchParams): string[] => {
  const v = params.p;
  const slugs = (Array.isArray(v) ? v : v ? [v] : []).filter((s) => PROVIDERS.some((p) => p.slug === s));
  return [...new Set(slugs)].slice(0, MAX);
};

const TITLE = "Compare money transfer providers side by side";
const DESCRIPTION =
  "Put up to three money transfer providers side by side: the company behind each brand, its Companies House record and its own regulatory statement.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const chosen = pick(await searchParams);
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/compare/providers/" },
    robots: chosen.length ? { index: false, follow: true } : { index: true, follow: true },
  };
}

type Row = { label: string; source: string; value: (e: Entry) => React.ReactNode };

const ROWS: Row[] = [
  { label: "Category", source: "IMTUK", value: (e) => KIND_LABEL[e.provider.kind] },
  { label: "Registered company", source: "Companies House", value: (e) => e.company?.company?.name ?? "Not yet identified" },
  { label: "Company number", source: "Companies House", value: (e) => e.company?.company?.number ?? "—" },
  { label: "Company status", source: "Companies House", value: (e) => e.company?.company?.status ?? "—" },
  {
    label: "Incorporated",
    source: "Companies House",
    value: (e) => (e.company?.company?.incorporated ? longDate(e.company.company.incorporated) : "—"),
  },
  { label: "Registered office", source: "Companies House", value: (e) => e.company?.company?.registeredOffice || "—" },
  {
    label: "Latest accounts made up to",
    source: "Companies House",
    value: (e) => (e.company?.company?.lastAccountsMadeUpTo ? longDate(e.company.company.lastAccountsMadeUpTo) : "—"),
  },
  {
    label: "Accounts overdue, as recorded",
    source: "Companies House",
    value: (e) => (e.company?.company ? (e.company.company.accountsOverdue ? "Yes" : "No") : "—"),
  },
  {
    label: "Corporate owner (person with significant control)",
    source: "Companies House",
    value: (e) => {
      const owners = (e.company?.psc ?? []).filter((p) => !p.ceased_on && !(p.kind ?? "").startsWith("individual"));
      return owners.length ? owners.map((o) => o.name).join("; ") : "—";
    },
  },
  {
    label: "FCA number, as stated by the provider",
    source: "Provider's website",
    value: (e) =>
      e.statedFrns.length
        ? e.statedFrns.map((f, i) => (
            <span key={f}>
              {i > 0 && ", "}
              <a href={registerSearchUrl(f)} rel="noopener">{f}</a>
            </span>
          ))
        : "—",
  },
  {
    label: "Regulatory statement",
    source: "Provider's website",
    value: (e) => (e.statement ? "Published (quoted on the profile)" : "Not found"),
  },
];

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const chosen = pick(await searchParams);
  const entries = loadEntries();
  const cols = chosen.map((s) => entries.find((e) => e.provider.slug === s)!).filter(Boolean);
  const options = [...entries].sort((a, b) => a.provider.name.localeCompare(b.provider.name, "en-GB"));

  return (
    <PageFrame
      schema={{ path: "/compare/providers/", name: TITLE, description: DESCRIPTION }}
      trail={[{ name: "Compare costs", href: "/compare/" }, { name: "Compare providers" }]}
      title={<>Compare money transfer providers side by side</>}
      lead={<>Choose up to three providers. Every row shows where the fact comes from; nothing here is a rating or a ranking.</>}
    >
      
      <form method="get" action="/compare/providers/" className="mt-6 grid gap-3 border border-line bg-wash p-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        {Array.from({ length: MAX }).map((_, i) => (
          <div key={i}>
            <label htmlFor={`p${i}`} className="block text-sm font-semibold text-ink">
              {`Provider ${i + 1}`}
            </label>
            <select id={`p${i}`} name="p" defaultValue={chosen[i] ?? ""} className="mt-1 w-full border-2 border-ink bg-white px-2 py-2">
              <option value="">Choose…</option>
              {options.map((e) => (
                <option key={e.provider.slug} value={e.provider.slug}>
                  {e.provider.name}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button type="submit" className="bg-brand-700 px-5 py-2.5 font-semibold text-white">
          Compare
        </button>
      </form>

      {cols.length === 0 ? (
        <P>
          {"Pick providers above, or tick “Compare” beside them in the "}
          <Link href="/">A–Z directory</Link>.
        </P>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th scope="col" className="w-56 border-b-2 border-ink py-3 pr-4 align-bottom font-semibold text-muted">
                  Fact and source
                </th>
                {cols.map((e) => (
                  <th key={e.provider.slug} scope="col" className="border-b-2 border-ink px-3 py-3 align-bottom">
                    <div className="flex items-center gap-3">
                      <Monogram name={e.provider.name} kind={e.provider.kind} slug={e.provider.slug} />
                      <Link href={providerUrl(e.provider)} className="text-base font-bold text-ink">
                        {e.provider.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="border-b border-line align-top">
                  <th scope="row" className="py-3 pr-4 font-semibold text-ink">
                    {r.label}
                    <span className="block text-xs font-normal text-muted">{r.source}</span>
                  </th>
                  {cols.map((e) => (
                    <td key={e.provider.slug} className="px-3 py-3">
                      {r.value(e)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-muted">
            {"Companies House data: contains public sector information licensed under the "}
            <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="noopener">
              Open Government Licence v3.0
            </a>
            {". FCA numbers are as the providers state them on their own websites and have not been checked against the FCA Register."}
          </p>
        </div>
      )}
    </PageFrame>
  );
}
