# International Money Transfer UK (internationalmoneytransfer.uk)

IMT UK is a **directory of every FCA-authorised money transfer provider**, with an
information-gain-heavy entity profile for each. It is presented as an **independent
site in its own right**: its own brand, no cross-links to Currency Brokers UK
(https://www.currencybrokers.uk, "CBUK"), and no "sister site" framing. Common ownership
is stated once, factually, on `/about/` — claiming independence while hiding it would be
misleading. The CBUK split below is an internal keyword plan only.

## Fully automated — no human testing or review
The entire site is built and maintained by AI and code. Nobody tests providers, makes
transfers, mystery-shops, or reviews pages or profiles by hand. Consequences:
- No test-transfer data, no Transfer Tracker, no "tested" tier, no ratings or rankings.
- No named authors or "reviewed by" lines, and no copy implying a person checked anything.
  The site says plainly that it is compiled by software.
- Where the plan called for human review, the rule is now: publish only what the source
  says, verbatim, with link and date — or publish nothing.

## Reference files
- `docs/IMT_UK_topical_map.xlsx` — topical map with QDP verdicts, removed/merged pages,
  full keyword→page map (1,903 keywords, Ahrefs GB export 2026-09-25), profile schema.
- Next.js App Router, server-rendered; trailing-slash URLs.

## Keyword split with CBUK (internal) — never create a page CBUK already owns
| Topic | Owner |
|---|---|
| Head term "international money transfer", A–Z directory, provider profiles | IMT |
| Apps, cash pickup, tracking/missing transfers, Nigeria corridor | IMT |
| Transfer times, limits & tax, receiving money, regulations guide | CBUK |
| Corridors: Spain, Australia, USA, India | CBUK `/send-money/{country}` |
| Large/purpose transfers (property, investment), forwards, hedging | CBUK |
| Broker reviews (OFX, XE, TorFX, etc.) | CBUK — IMT shows the data profile only |

Pending decisions (need SERP overlap check, 4+ shared top-10 URLs = same page):
`/compare/` vs homepage; `/business/` vs CBUK `/business-fx`; `/banks/` vs CBUK
best-uk-banks post; `/guides/how-it-works/` vs homepage.

## Query-deserves-a-page rules
1. One URL per SERP, across **both** sites.
2. Provider variants (fees, limits, rates, forms, time) stay on the single profile URL. Never create provider sub-pages.
3. Country filters and zero-demand profiles exist as entities but are `noindex` until they have Tier 2 data and confirmed brand demand.
4. Tools and the register-change feed are justified by function/links, not volume.

## Site structure (phase 1 first)
- `/` — homepage = searchable A–Z directory
- `/providers/{slug}/` — entity profiles
- `/compare/`, `/apps/` (phase 1); `/business/`, `/banks/`, `/cash-pickup/`, `/send-to/nigeria/`, `/guides/how-it-works/`, `/guides/track-a-transfer/` (phase 2)
- `/check-a-provider/` (FCA status tool), `/register-changes/` (`/tracker/` removed; it 301s to `/methodology/`)
- Trust: `/methodology/`, `/how-we-get-paid/`, `/code-of-ethics/`, `/corrections/`, `/about/`, `/for-providers/`, `/entitymap.html` + `/entitymap.json` (EntityMap v1.0)

## Profile status
- **Verified:** FCA Register + Companies House + FOS data complete, product data extracted
  with source quotes. Indexable if the topical map says so.
- **Register data pending:** anything less. `noindex`.
The workbook's "Testing" rows and the "Human review?" column no longer apply.

## Data pipeline rules (critical — YMYL and defamation risk)
- Facts (FRN, status, permissions, company number, dates) flow from the **FCA Register API** and **Companies House API** into the database via plain code. The LLM never generates or "remembers" these values.
- LLM extraction from provider websites returns JSON against a fixed schema **plus the exact source snippet**; validate before saving, reject on failure.
- Anything negative or status-related (cancellation, restriction, requirement, complaints) is
  published only as the source's own wording, verbatim, with a link and date. The AI never
  describes, summarises, characterises or draws conclusions from it.
- If a source is unreachable or a validation fails, show nothing for that block — never a
  stale or estimated value.
- Every data block shows a "last verified" date; changes are logged to the profile timeline.
- Model tiers: Haiku for bulk classification/extraction, Sonnet for drafting, Opus for review of sensitive changes and methodology. Use batch processing for bulk jobs.

## Design — independent public-interest agency
- Sober, institutional, accessibility-first: utility strip, white header with logo and
  tagline, dark-teal nav band with gold rule, tinted page-header bands, square controls,
  Source Sans 3, the IMT UK palette in `app/globals.css`. Every page uses `PageFrame`.
- It may look like a public-interest body; it must **never** pass for an official one.
  No crowns, crests or coats of arms, no GOV.UK or FCA styling, fonts or colours, no
  "official" wording. Keep the "Not a government website, and not part of the FCA"
  strip and the footer disclaimer on every page.

## Editorial
- British English, plain English, data-driven claims, no jargon without explanation.
- No named authors or reviewers (see "Fully automated"); methodology and affiliate
  disclosure linked from every profile. Matt Woodley appears as owner only.
- Listing is free; no provider can pay for data fields or ranking. Commercial elements are clearly labelled and kept separate from factual fields.
- No links to CBUK. Common ownership is disclosed on `/about/` only.

## First tasks
1. Scaffold the Next.js project and page routes above (phase 1 only).
2. Define the database schema from the "Profile schema" tab of the workbook.
3. Build the FCA Register ingestion job: filter to firms offering consumer money remittance; store raw responses.
4. Build the Companies House enrichment job keyed on company number.
5. Generate Tier 3 entity pages (noindex) for all ingested firms, then upgrade the 14 phase-1 profiles.
