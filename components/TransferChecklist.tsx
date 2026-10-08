import Link from "next/link";
import type { Entry } from "@/lib/directory";
import { providerUrl } from "@/lib/providers";
import { TOPIC_LABEL } from "@/lib/service-facts";
import { sharedCompanyEntries, transferQuestions } from "@/lib/transfer-checklist";
import { SourceLine } from "@/components/Page";

export function TransferChecklist({ entry, entries }: { entry: Entry; entries: Entry[] }) {
  const shared = sharedCompanyEntries(entry, entries);
  const company = entry.company?.company;
  return (
    <section aria-labelledby="transfer-checklist" className="mt-8 border-t-4 border-brand-600 bg-wash p-5">
      <h2 id="transfer-checklist" className="text-xl font-bold text-ink">
        {`What to confirm before sending with ${entry.provider.name}`}
      </h2>
      <p className="mt-2 max-w-prose text-sm">
        These questions connect the source material below to your particular transfer.
        A quotation records what the provider published; it does not confirm your eligibility
        or that the conditions apply to your payment. Missing evidence describes our collection,
        not the provider’s capabilities.
      </p>
      <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
        {transferQuestions(entry).map((q) => (
          <div key={q.topic} className="py-3">
            <dt className="font-semibold text-ink">{q.question}</dt>
            <dd className="mt-1 text-muted">
              {q.hasQuotation ? (
                <a href={`#service-${q.topic}`}>{`Read the provider's statement: ${TOPIC_LABEL[q.topic].toLowerCase()}`}</a>
              ) : "No source quotation on this topic has been collected for this profile."}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm">
        <Link href={`/check-a-provider/?q=${encodeURIComponent(entry.provider.name)}`}>Check the firm on the FCA Register</Link>
        {" · "}<Link href="/compare/">Check the cost of a quote you already have</Link>
      </p>
      {company && shared.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <h3 className="font-semibold text-ink">Other listed brands linked to this company number</h3>
          <p className="mt-2 text-sm">{`${company.name} (${company.number}) is also the matched company for:`}</p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {shared.map((e) => <li key={e.provider.slug}><Link href={providerUrl(e.provider)}>{e.provider.name}</Link></li>)}
          </ul>
          <SourceLine source={<a href={company.url} rel="noopener">Companies House</a>} fetchedAt={entry.company!.fetchedAt} note="matched company numbers, grouped by software" />
          <p className="mt-2 text-xs text-muted">
            A shared legal entity does not establish identical products, fees or customer-money protection.
            Contains public sector information licensed under the <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="noopener">Open Government Licence v3.0</a>.
          </p>
        </div>
      )}
    </section>
  );
}
