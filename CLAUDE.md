# International Money Transfer UK (internationalmoneytransfer.uk)

Sister site to Currency Brokers UK (https://www.currencybrokers.uk, "CBUK").
IMT UK is a **directory of every FCA-authorised money transfer provider**, with an
information-gain-heavy entity profile for each. CBUK remains the advisory/comparison
site for brokers, large transfers and business FX.

## Reference files
- `docs/IMT_UK_topical_map.xlsx` — topical map with QDP verdicts, removed/merged pages,
  full keyword→page map (1,903 keywords, Ahrefs GB export 2026-09-25), profile schema.
- CBUK is built on Next.js (inferred from its `/_next/image` URLs). Match its conventions
  unless told otherwise.

## Split with CBUK (intent-based) — never create a page CBUK already owns
| Topic | Owner |
|---|---|
| Head term "international money transfer", A–Z directory, provider profiles | IMT |
| Apps, cash pickup, tracking/missing transfers, Nigeria corridor | IMT |
| Transfer times, limits & tax, receiving money, regulations guide | CBUK (IMT links to it) |
| Corridors: Spain, Australia, USA, India | CBUK `/send-money/{country}` |
| Large/purpose transfers (property, investment), forwards, hedging | CBUK |
| Broker reviews (OFX, XE, TorFX, etc.) | CBUK — IMT shows data profile only + link to CBUK review |

Pending decisions (need SERP overlap check, 4+ shared top-10 URLs = same page):
`/compare/` vs homepage; `/business/` vs CBUK `/business-fx`; `/banks/` vs CBUK
best-uk-banks post; `/guides/how-it-works/` vs homepage.

## Query-deserves-a-page rules
1. One URL per SERP, across **both** sites.
2. Provider variants (fees, limits, rates, forms, time) stay on the single profile URL. Never create provider sub-pages.
3. Country filters and zero-demand profiles exist as entities but are `noindex` until they have Tier 2 data and confirmed brand demand.
4. Tools, the Transfer Tracker and register-change feed are justified by function/links, not volume.

## Site structure (phase 1 first)
- `/` — homepage = searchable A–Z directory
- `/providers/{slug}/` — entity profiles
- `/compare/`, `/apps/` (phase 1); `/business/`, `/banks/`, `/cash-pickup/`, `/send-to/nigeria/`, `/guides/how-it-works/`, `/guides/track-a-transfer/` (phase 2)
- `/check-a-provider/` (FCA status tool), `/tracker/`, `/register-changes/`
- Trust: `/methodology/`, `/how-we-get-paid/`, `/code-of-ethics/`, `/corrections/`, `/about/`, `/for-providers/`, `/entitymap.html` + `/entitymap.json` (EntityMap v1.0, as on CBUK)

## Profile tiers
- **Tier 1 – Tested:** real test transfers, mystery shopping (CBUK methodology). Top ~30 providers.
- **Tier 2 – Verified:** FCA Register + Companies House + FOS data complete, product data extracted with source quotes.
- **Tier 3 – Register-only:** `noindex`.

## Data pipeline rules (critical — YMYL and defamation risk)
- Facts (FRN, status, permissions, company number, dates) flow from the **FCA Register API** and **Companies House API** into the database via plain code. The LLM never generates or "remembers" these values.
- LLM extraction from provider websites returns JSON against a fixed schema **plus the exact source snippet**; validate before saving, reject on failure.
- Anything negative or status-related (cancellation, restriction, complaint spike) goes to a human review queue — never auto-published.
- Every data block shows a "last verified" date; changes are logged to the profile timeline.
- Model tiers: Haiku for bulk classification/extraction, Sonnet for drafting, Opus for review of sensitive changes and methodology. Use batch processing for bulk jobs.

## Editorial & brand (inherit from CBUK)
- British English, plain English, data-driven claims, no jargon without explanation.
- Named authors; methodology and affiliate disclosure linked from every profile.
- Listing is free; no provider can pay for data fields or ranking. Commercial elements are clearly labelled and kept separate from factual fields.
- Disclose the CBUK relationship on `/about/`. Cross-links between sites are contextual only (no sitewide footer links).

## First tasks
1. Scaffold the Next.js project and page routes above (phase 1 only).
2. Define the database schema from the "Profile schema" tab of the workbook.
3. Build the FCA Register ingestion job: filter to firms offering consumer money remittance; store raw responses.
4. Build the Companies House enrichment job keyed on company number.
5. Generate Tier 3 entity pages (noindex) for all ingested firms, then upgrade the 14 phase-1 profiles.
