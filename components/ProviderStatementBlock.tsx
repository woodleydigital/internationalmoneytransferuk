import type { DisclosureRecord } from "@/lib/disclosures";
import { registerSearchUrl } from "@/lib/fca";
import { SourceLine, Term } from "@/components/Page";

/**
 * The provider's own regulatory statement, quoted word for word. It is labelled
 * as the provider's claim and paired with a link to check it on the FCA Register.
 */
export function ProviderStatementBlock({ name, record }: { name: string; record: DisclosureRecord }) {
  const frns = [...new Set(record.statements.flatMap((s) => s.frns))];
  return (
    <section aria-labelledby="provider-statement" className="mt-8">
      <h2 id="provider-statement" className="text-2xl font-bold tracking-tight text-ink">
        {`What ${name} says about its regulation`}
      </h2>
      <SourceLine
        source={
          <>
            <a href={record.url} rel="noopener nofollow">
              {new URL(record.url).hostname}
            </a>
            {` (${name}'s own website)`}
          </>
        }
        fetchedAt={record.fetchedAt}
        note="quoted word for word"
      />
      <div className="mt-4 space-y-3">
        {record.statements.map((s) => (
          <blockquote
            key={s.text}
            cite={s.url ?? record.url}
            className="border-l-4 border-line-strong bg-wash px-4 py-3"
          >
            <p>{s.text}</p>
            {s.url && (
              <p className="mt-1 text-sm text-muted">
                {"From "}
                <a href={s.url} rel="noopener nofollow">
                  {new URL(s.url).pathname}
                </a>
              </p>
            )}
          </blockquote>
        ))}
      </div>
      <aside className="mt-4 border-l-4 border-accent-500 bg-accent-100/40 p-4">
        <p className="font-semibold text-ink">This is the provider’s own statement</p>
        <p className="mt-1 max-w-prose">
          We have not checked it against the <Term slug="fca-register">FCA Register</Term>. Before
          you send money, confirm the firm’s details on the Register yourself
          {frns.length ? ": " : "."}
          {frns.map((f, i) => (
            <span key={f}>
              {i > 0 && ", "}
              <a href={registerSearchUrl(f)} rel="noopener nofollow">
                {`search the Register for ${f}`}
              </a>
            </span>
          ))}
          {frns.length ? "." : ""}
        </p>
      </aside>
    </section>
  );
}
