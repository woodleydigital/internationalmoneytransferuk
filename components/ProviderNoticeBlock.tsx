import type { ProviderNotice } from "@/lib/provider-notices";
import { SourceLine } from "@/components/Page";

export function ProviderNoticeBlock({ name, notice }: { name: string; notice: ProviderNotice }) {
  return <section aria-labelledby="provider-notice" className="mt-8 border-l-4 border-accent-500 bg-wash p-5">
    <h2 id="provider-notice" className="text-xl font-semibold text-ink">Published notice about {name}</h2>
    <SourceLine source={<a href={notice.url} rel="noopener nofollow">{notice.publisher}</a>} fetchedAt={notice.fetchedAt} note="source wording copied by software" />
    {notice.quotations.map((text) => <blockquote key={text} cite={notice.url} className="mt-3"><p>{text}</p></blockquote>)}
    <p className="mt-3 text-sm">Read the linked notice for the current brand and service information.</p>
  </section>;
}
