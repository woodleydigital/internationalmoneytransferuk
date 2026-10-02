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

## Data licensing (checked 2026-09-30)
- **Companies House:** Open Government Licence v3.0 — commercial reuse allowed. Attribute
  it on every page that shows its data ("Contains public sector information licensed under
  the Open Government Licence v3.0", source Companies House). Officer and PSC names are
  personal data under UK GDPR: publish a privacy notice (lawful basis: legitimate
  interests) before showing them, never show dates of birth, and honour objections.
- Companies House pipeline: `scripts/import-companies-house.ts` (weekly GitHub Action,
  secret `COMPANIES_HOUSE_API_KEY`) writes `data/companies-house/{slug}.json`; git history
  is the audit trail. A company is matched only by the strict rule in
  `lib/companies-house.ts` (exactly one active, name + legal suffix, payments SIC code) —
  never guessed. Records older than 14 days are not shown. PSC names only; the privacy
  notice is at `/privacy/`.
- **Provider statements (in place of FCA data for now):** `scripts/import-disclosures.ts`
  reads each provider's homepage weekly (robots.txt respected, identified user agent) and
  keeps the paragraphs that state an FRN or company number, verbatim, in
  `data/disclosures/`. Shown as "What {provider} says about its regulation", labelled as the
  provider's own statement, never as verified, with a Register search link. If the homepage
  gives no company number, up to four of its own legal/regulatory links are followed;
  sub-page statements carrying only a different FRN are dropped (sister firms). Stated
  company numbers drive the Companies House match via `chooseStatedCompany` (tier 1:
  trading name + legal suffix, or the homepage FRN in the same statement; tier 2, only when
  the homepage has no FRN: the statement names the company; exactly one must qualify).
  If the site states company numbers but none qualifies, there is no name-rule fallback.
  Brand links in the provider's own words ("a trading name of", "a division of", "provided
  by", "(trading as …)", or "{company} is authorised" beside the homepage's only FRN) name
  the company behind a brand; one without a stated number is found by exact-name search
  (exactly one active). Pages whose footer is drawn by JavaScript are read in headless
  Chromium (installed in the workflow). Building societies have no Companies House record.
  Plain pattern matching — no AI.
- **Reference exchange rates:** Frankfurter API (`lib/rate-table.ts`, `lib/rates.ts`), a
  free blend of central bank publications, updated once per working day. Always labelled
  "mid-market reference rates, published {date}" with the source; never "live", never a
  rate a provider offers, never beside a provider's name. Shown on `/compare/#rates` (GBP
  table, 7/30-day change, `Dataset` markup) and as one line on the homepage. A currency
  needs ≥3 contributing central banks; the table is withdrawn if the latest publication is
  over 5 days old or the API fails. No currency-pair or corridor pages (CBUK owns those).
- **FCA Register: BLOCKED pending written permission.** The FCA's website terms say data
  must not be used "to provide a data feed to any comparison table or any other website
  without our written permission", and the Register API is "designed for individual
  look-ups rather than bulk data access". The paid Register Extract Service
  (£6,012–£9,445 a year plus SDM fees, ex VAT) prohibits sharing on its own-business
  licence. Do not build FCA ingestion or switch on `/check-a-provider/` live results until
  the FCA has confirmed in writing what may be displayed. Never imply FCA endorsement.

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
- Directory features borrowed from Capterra/Clutch, minus anything that ranks: category
  browsing (`kind`: bank / transfer / broker, assigned from how each provider describes
  itself), faceted filters with counts, provider cards with logos (or monogram tiles where there is none),
  side-by-side comparison at `/compare/providers/` (facts only, each row names its source),
  profile pages with a key-facts panel, "On this page" and similar providers. Sorts are
  alphabetical or by a recorded date only. **No stars, reviews, "top"/"best"/"leader"
  badges, scores or paid placement.** Filtered views are `noindex`.
- Logos: `scripts/import-logos.ts` saves the icon each provider's own site publishes to
  `public/logos/{slug}.*` (permanent per-slug URLs), weekly; tiny or wrong icons are rejected
  (`REJECTED`). Shown only to identify; the footer notes trade marks; removal on request via
  `/for-providers/`.
- It may look like a public-interest body; it must **never** pass for an official one.
  No crowns, crests or coats of arms, no GOV.UK or FCA styling, fonts or colours, no
  "official" wording. Keep the "Not a government website, and not part of the FCA"
  strip and the footer disclaimer on every page.

## Structured data (schema.org)
- All JSON-LD is built in `lib/schema.ts`. The root layout emits the site graph
  (`Organization` with logo, founder and policy links, `WebSite` with `SearchAction`); every
  page passes `schema` to `PageFrame`, which emits one connected graph: the `WebPage` (or
  `ProfilePage`, `AboutPage`, `CollectionPage`), its `BreadcrumbList` built from the same
  trail as the visible breadcrumb, and any main-entity nodes. Stable `@id`s; absolute,
  trailing-slash URLs; `inLanguage: en-GB`; description = the meta description.
- Provider profiles: `ProfilePage` whose `mainEntity` is the provider `Organization`.
  Companies House facts (legal name, company number, incorporation date, registered office,
  CH page in `sameAs`) appear only when the strict match passed and the record is fresh.
  FCA numbers a provider states about itself are never asserted.
- Never mark up ratings, reviews, rankings, `dateModified` we do not genuinely know, or
  anything the page does not visibly show. The 404 carries no structured data.
  `lib/schema.test.ts` checks that every `@id` reference resolves.

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
