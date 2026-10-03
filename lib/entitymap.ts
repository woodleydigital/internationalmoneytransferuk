/**
 * EntityMap v1.0, in the same shape Currency Brokers UK publishes.
 *
 * Every chunk's text is quoted verbatim from the page at its sourceUrl — keep
 * them in step if that copy changes.
 */
import { SITE } from "./site";

const chunk = (id: string, text: string, path: string, pageTitle: string, contentType: string) => ({
  chunkId: id,
  text,
  sourceUrl: `${SITE.url}${path}`,
  pageTitle,
  publisher: SITE.name,
  contentType,
});

export function entityMap() {
  return {
    version: "1.0",
    schema: "https://entitymap.org/spec/v1.0",
    publisher: { name: SITE.name, url: SITE.url },
    generated: new Date().toISOString(),
    verificationStatus: "self-declared",
    entities: [
      {
        entityId: "e_imt_uk",
        "@type": "Organization",
        name: SITE.name,
        description:
          "A directory of the firms that send money abroad from the UK, built from Companies House and Financial Ombudsman Service records and providers' own published statements.",
        audienceType: "general",
        hasChunks: [
          chunk(
            "c_imt_uk_01",
            "We are not a bank, a money transfer provider or a currency broker. We do not hold money, we do not make transfers, and we cannot quote you a rate. Nothing on this site is financial advice.",
            "/about/",
            `About ${SITE.name}`,
            "definition",
          ),
        ],
        relations: [
          { predicate: "USES_SOURCE", targetName: "FCA Financial Services Register", targetId: "e_fca_register" },
        ],
      },
      {
        entityId: "e_fca_register",
        "@type": "Concept",
        name: "FCA Financial Services Register",
        description:
          "The Financial Conduct Authority's public record of the firms and individuals it authorises or registers.",
        sameAs: "https://register.fca.org.uk/",
        audienceType: "general",
        hasChunks: [
          chunk(
            "c_fca_register_01",
            "The Register shows whether a firm is authorised, what it is permitted to do, and whether that has been restricted or cancelled.",
            "/check-a-provider/",
            "Check a money transfer provider on the FCA Register",
            "definition",
          ),
        ],
        relations: [
          {
            predicate: "PUBLISHED_BY",
            targetName: "Financial Conduct Authority",
            targetUri: "https://en.wikipedia.org/wiki/Financial_Conduct_Authority",
          },
        ],
      },
      {
        entityId: "e_mid_market_rate",
        "@type": "Concept",
        name: "Mid-Market Rate",
        description:
          "The published reference exchange rate we measure transfer costs against. It is a reference, not a rate anyone is offered.",
        audienceType: "general",
        hasChunks: [
          chunk(
            "c_mid_market_rate_01",
            "The cost of a transfer is the difference between what the recipient received and what the same amount would have bought at the published mid-market reference rate on the day. The mid-market rate is a reference, not a rate anyone is offered.",
            "/methodology/",
            "Methodology: how we build and verify provider profiles",
            "definition",
          ),
        ],
        relations: [],
      },
    ],
  };
}
