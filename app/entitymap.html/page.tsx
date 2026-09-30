import type { Metadata } from "next";
import { entityMap } from "@/lib/entitymap";
import { H2, P, PageFrame } from "@/components/Page";

export const metadata: Metadata = {
  title: "Entity map",
  description: "The entities this site describes, the claims it makes about them, and where each claim appears.",
  alternates: { canonical: "/entitymap.html" },
};

export default function Page() {
  const map = entityMap();
  return (
    <PageFrame trail={[{ name: "Entity map" }]} title={<>Entity map</>}>
      <P>
        {"A human-readable view of our "}
        <a href="/entitymap.json" className="underline">machine-readable entity map</a>
        {` (EntityMap v${map.version}): each entity we describe, the passages that describe it, and the page each passage comes from.`}
      </P>
      {map.entities.map((e) => (
        <section key={e.entityId} aria-labelledby={e.entityId}>
          <H2 id={e.entityId}>{e.name}</H2>
          <P>{e.description}</P>
          <ul className="mt-3 max-w-prose space-y-3">
            {e.hasChunks.map((c) => (
              <li key={c.chunkId} className="border-l-2 border-line pl-3">
                <p>“{c.text}”</p>
                <p className="text-sm text-muted">
                  <a href={c.sourceUrl} className="underline">{c.pageTitle}</a>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PageFrame>
  );
}
