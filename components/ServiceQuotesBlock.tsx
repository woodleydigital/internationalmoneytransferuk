import { TOPICS, TOPIC_LABEL, quoteContext, type ServiceRecord } from "@/lib/service-facts";
import { SourceLine, Term } from "@/components/Page";

const host = (u: string) => new URL(u).hostname.replace(/^www\./, "");
const path = (u: string) => {
  const p = new URL(u).pathname;
  return p === "/" ? "homepage" : p;
};

/**
 * What the provider says about its own service, sentence by sentence, word for
 * word, grouped by topic. Labelled as the provider's claims, never as ours.
 */
export function ServiceQuotesBlock({ name, record }: { name: string; record: ServiceRecord }) {
  const topics = TOPICS.filter((t) => record.quotes.some((q) => q.topic === t));
  const site = host(record.pages[0] ?? record.quotes[0].url);
  return (
    <section aria-labelledby="service" className="mt-8">
      <h2 id="service" className="text-2xl font-bold tracking-tight text-ink">
        {`What ${name} says about its service`}
      </h2>
      <SourceLine
        source={`${site} (${name}'s own website)`}
        fetchedAt={record.fetchedAt}
        note="sentences quoted word for word"
      />
      {topics.map((t) => (
        <div key={t} id={`service-${t}`} className="mt-5 scroll-mt-4">
          <h3 className="font-semibold text-ink">
            {t === "safeguarding" ? <Term slug="safeguarding">{TOPIC_LABEL[t]}</Term> : TOPIC_LABEL[t]}
          </h3>
          <ul className="mt-2 space-y-2">
            {record.quotes
              .filter((q) => q.topic === t)
              .map((q) => (
                <li key={`${q.url}:${q.text}`}>
                  <blockquote cite={q.url} className="border-l-4 border-line-strong bg-wash px-4 py-2">
                    <p>{q.text}</p>
                    <p className="mt-1 text-xs text-muted">
                      {"From "}
                      <a href={q.url} rel="noopener nofollow">
                        {path(q.url)}
                      </a>
                    </p>
                  </blockquote>
                  {quoteContext(q).length > 0 && (
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted">
                      {quoteContext(q).map((note) => <li key={note}>{note}</li>)}
                    </ul>
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}
      <aside className="mt-5 border-l-4 border-accent-500 bg-accent-100/40 p-4">
        <p className="font-semibold text-ink">These are the provider’s own words</p>
        <p className="mt-1 max-w-prose">
          {`Software picked these sentences out of ${name}'s website by topic; nobody has checked them, and they may leave out conditions that appear elsewhere on the page. Fees, limits and delivery times change, so confirm the current terms with ${name} before you send money.`}
        </p>
      </aside>
    </section>
  );
}
