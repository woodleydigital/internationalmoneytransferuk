import Link from "next/link";
import type { Entry } from "@/lib/directory";
import { comparisonEvidence } from "@/lib/comparison-evidence";
import { quoteContext, type ServiceQuote, type Topic } from "@/lib/service-facts";
import { providerUrl } from "@/lib/providers";
import { longDate } from "@/lib/site";

function Quotation({ quote }: { quote: ServiceQuote }) {
  const notes = quoteContext(quote);
  return <div className="space-y-2">
    {quote.context && <p className="text-xs text-muted">Source context: {quote.context}</p>}
    <blockquote cite={quote.url} className="border-l-2 border-line-strong pl-3">{quote.text}</blockquote>
    {notes.length > 0 && <ul className="list-disc space-y-1 pl-4 text-xs text-muted">
      {notes.map((note) => <li key={note}>{note}</li>)}
    </ul>}
    <a href={quote.url} rel="noopener nofollow" className="text-xs">Read the source and full conditions ↗</a>
  </div>;
}

export function ServiceEvidenceCell({ entry, topic }: { entry: Entry; topic: Topic }) {
  const { quotes, receivingOnly } = comparisonEvidence(entry, topic);
  if (!quotes.length) return <p className="text-muted">
    {receivingOnly ? "Only receiving-payment statements collected; sending terms remain unconfirmed." : "No sending-service quotation collected on this topic."}
  </p>;
  return <div className="space-y-3">
    <Quotation quote={quotes[0]} />
    {quotes.length > 1 && <details>
      <summary className="cursor-pointer text-xs font-semibold">{`${quotes.length - 1} more source ${quotes.length === 2 ? "statement" : "statements"}`}</summary>
      <div className="mt-3 space-y-4">{quotes.slice(1).map((quote) => <Quotation key={`${quote.url}:${quote.text}`} quote={quote} />)}</div>
    </details>}
    <p className="text-xs text-muted">Source fetched {longDate(entry.service!.fetchedAt.slice(0, 10))}. <Link href={`${providerUrl(entry.provider)}#service-${topic}`}>Full profile evidence</Link></p>
  </div>;
}
