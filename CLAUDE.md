# International Money Transfer UK (internationalmoneytransfer.uk)

IMT UK is a **directory of UK money transfer providers**, with an
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
- `/check-a-provider/` (FCA status tool). `/register-changes/` is shelved (it would be the
  FCA data feed their terms forbid) and 307s to `/check-a-provider/`; `/tracker/` removed
  (301 to `/methodology/`).
- Trust: `/methodology/`, `/how-we-get-paid/`, `/code-of-ethics/`, `/corrections/`, `/about/`, `/for-providers/`, `/entitymap.html` + `/entitymap.json` (EntityMap v1.0)

## Profile status
- **Verified:** FCA Register + Companies House + FOS data complete, product data extracted
  with source quotes. Indexable if the topical map says so.
- **FCA status: use live lookup:** anything less. Shown with that label. Indexable only when the
  topical map marks the profile for indexing **and** it holds a fresh Companies House
  identity or provider regulatory statement, plus sending-service quotations spanning at
  least three of countries, payout, fees, limits and speed — `isIndexableEntry` in
  `lib/directory.ts`. Incoming-only terms, a generic checklist or an availability sentence
  cannot satisfy this gate. Everything else stays `noindex`. This is our publishing rule,
  not a Google quality score. (Strengthened 2026-10-08.)
- Indexing aids: sitemap with record dates; `GOOGLE_SITE_VERIFICATION` /
  `BING_SITE_VERIFICATION` env vars render the ownership meta tags; IndexNow key file in
  `public/`, `npm run indexnow` (also run by the weekly workflow after deploy).
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
- Companies House extras: `scripts/import-company-extras.ts` (weekly, after the main import)
  writes `data/company-extras/{slug}.json`: previous names, a filing timeline (no officer
  filings), charges summary, corporate owner chain (single UK-registered owner per level, up
  to four, followed only when CH's name for the number matches, stops before a repeat;
  individuals never stored), and headline iXBRL accounts figures for the latest
  period (`parseIxbrl`, entity-level contexts only, scale/sign honoured). Shown only when the
  company number still matches and the record is fresh.
- Change log: `scripts/record-changes.ts` runs before the workflow commit, diffs each record
  against `HEAD` (`lib/changes.ts`) and appends to `data/changes/{slug}.json` (max 50).
  Companies House fields and new FOS periods only — website wording is too noisy to log.
  Values copied, never described; a re-match to a different company is not a change.
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
- **Provider service details:** `scripts/import-service-facts.ts` (weekly, same workflow)
  reads up to twelve of its official product/help sources (HTML and selectable-text PDF terms), using `lib/provider-sources.ts`
  plus focused discovered links, including help subdomains. It keeps sentences on eight
  topics (availability, countries, payout, speed, fees, limits, safeguarding, identity),
  verbatim, with the source URL, parent headings and table columns when needed, in `data/services/`. Rules in
  `lib/service-facts.ts`: must be about transfers; drops superlatives, promotions, other
  products (cards, loans, savings), claims about other firms, US-only terms, fragments and
  near-duplicates; `REJECTED_QUOTES` for context-wrong rows. Shown as "What {provider} says
  about its service", always as the provider's own words. Plain pattern matching — no AI.
- **Financial Ombudsman Service complaints:** `scripts/import-fos.ts` (weekly, after the
  Companies House step) reads the two latest half-yearly "Business complaints data" workbooks
  found via the FOS sitemap (`lib/xlsx.ts`, `lib/fos.ts`), and links a business only when its
  published name normalises to exactly the Companies House name we hold. Figures are copied
  under FOS's own headings (total new cases, total % upheld, proactive settled), with period,
  workbook link and OGL attribution; never graded or characterised. Figures cover the whole
  company and every brand sharing it (the block names those brands). Unlisted companies get
  the FOS publication-threshold sentence. Licence: FOS publications state OGL v3.0; its
  website legal policy is stricter ("must not reproduce our copyright material … without our
  prior permission"). The owner chose to publish with full attribution (2026-10-02); if FOS
  objects, remove `FosBlock` and the compare rows.
- **Reference exchange rates:** Frankfurter API (`lib/rate-table.ts`, `lib/rates.ts`), a
  free blend of central bank publications, updated once per working day. Always labelled
  "mid-market reference rates, published {date}" with the source; never "live", never a
  rate a provider offers, never beside a provider's name. Shown on `/compare/#rates` (GBP
  table, 7/30-day change, `Dataset` markup) and as one line on the homepage. A currency
  needs ≥3 contributing central banks; the table is withdrawn if the latest publication is
  over 5 days old or the API fails. No currency-pair or corridor pages (CBUK owns those).
- **FCA Register.** The FCA replied (2026-10-03): commercial use is permitted subject to
  the Register Terms of Use; no marketing use; never imply FCA endorsement (credit optional);
  the API is a rate-limited beta for "controlled, user level access", "not intended for high
  volume usage or full dataset ingestion"; and the email "should not be taken as approval,
  authorisation or written consent for any particular use". The terms still bar using Register
  data "to provide a data feed to any comparison table or any other website without written
  permission". So:
  - **Allowed (live since 2026-10-03):** `/check-a-provider/` look-ups — one API search per
    visitor search, results shown verbatim to that visitor, cached ≤1 hour, never stored or
    copied into profiles. Limits in `lib/fca.ts`: 10 calls/10 s per instance (FCA limit 50),
    6 searches/minute per visitor; robots.txt disallows `/check-a-provider/?`; results pages
    are `noindex`. Needs `FCA_API_EMAIL` and `FCA_API_KEY` in Vercel.
  - **Still not allowed:** importing Register data into profiles, the directory, comparison
    tables or the sitemap, or any bulk/scheduled pulls. That needs explicit written permission
    or a display licence (the Register Extract Service's standard licence forbids sharing).
    Revisit when the FCA's supported API arrives (promised for 2027).

## Data pipeline rules (critical — YMYL and defamation risk)
- Facts (FRN, status, permissions, company number, dates) flow from the **FCA Register API** and **Companies House API** into the database via plain code. The LLM never generates or "remembers" these values.
- Provider statements and service quotations are extracted by plain pattern matching, not an LLM. Preserve the exact source wording, URL and fetch date; reapply current filters when loading saved quotations.
- Anything negative or status-related (cancellation, restriction, requirement, complaints) is
  published only as the source's own wording, verbatim, with a link and date. The AI never
  describes, summarises, characterises or draws conclusions from it.
- If a source is unreachable or a validation fails, show nothing for that block — never a
  stale or estimated value.
- Every data block shows a source fetch date, not a claim of verification. A fetch date alone is never a profile/homepage `dateModified` or sitemap `lastmod`; omit those unless a substantive change date is known.
- No model produces provider facts, scores or commentary. Software-generated transfer questions and shared-company-number joins are allowed when clearly identified as prompts and sourced arithmetic/joins, rather than tests or recommendations.

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

## Helpful content (Google's people-first guidance)
- Every page must exist for visitors, not search engines: no placeholder or "coming soon"
  page in navigation or the sitemap; thin pages stay `noindex` (see Profile status).
- Say who, how and why: `/about/` (owner, why the site exists), `/methodology/` (how every
  block is collected; where AI was and was not used), "About this profile" on each profile.
  AI helped build the software and draft explanatory pages; it never produces provider data.
- Copy must match what the site actually does. When a data source is added or dropped,
  update methodology, about, code of ethics, FAQ, entity map and meta descriptions together.
- No scaled pages: one profile per provider, no templated variants per keyword, country or
  fee; filtered and search views `noindex`.
- Contact: `SITE.email` (team@internationalmoneytransfer.uk) and the postal address render
  through `ContactAddress` on About, Corrections, For providers, Privacy and the footer, and
  in the Organization schema. The mailbox must keep working.

## Editorial
- British English, plain English, data-driven claims, no jargon without explanation.
- No named authors or reviewers (see "Fully automated"); methodology and affiliate
  disclosure linked from every profile. Matt Woodley appears as owner only.
- Listing is free; no provider can pay for data fields or ranking. Commercial elements are clearly labelled and kept separate from factual fields.
- No links to CBUK. Common ownership is disclosed on `/about/` only.
- All external HTTP(S) anchor links must include `rel="noopener nofollow"`, including provider, regulator, source and licence links. Internal navigation and same-site source links remain followable.

- **Brand notices:** `scripts/import-provider-notices.ts` reads configured primary company pages for explicit statements naming a listed brand and an acquisition/rebrand. It writes `data/notices/`, with verbatim wording, publisher and actual fetch date. Never copy a successor's product facts onto an old brand.

## Automated information gain (2026-10-08)
- Every profile includes category-specific transfer questions. Links to service-topic evidence
  appear only when a fresh quotation exists. Missing evidence describes our import, not the firm.
- Group brands only by the same fresh, matched Companies House company number. Do not infer
  identical products, rates or protections from that relationship.
- Keep business, destination-specific and starting-price context attached to quotations.
  Different amounts, percentages and named destinations are not duplicate facts.
- Remove regulation statements about unrelated insurance, investment, prepaid or credit-card
  products; keep the remaining wording exact and never assert FCA verification.
- The calculator estimates a difference against a dated reference. Include a fee charged on
  top in total customer spend, and never call a daily reference gap a proven hidden fee.
  A provider can use a mid-market rate with a separate fee; the reference is not a quote.
- Preserve the topical-map indexing verdict and minimum evidence gate. A generic checklist
  does not make a sparse profile indexable. No bulk FCA imports, test transfers or ratings.

## Current maintenance priorities
1. Improve robots-respecting extraction and correct failed imports without guessing identities.
2. Keep methodology, terminology, entity-map text and calculations consistent with actual code.
3. Resolve provider/source conditions before treating headline statements as comparable data.
4. Collect fresh public records through the existing authorised workflow; retain its audit trail.
5. Expand indexing only when the publishing plan and evidence requirements are met.

## Profile completion safeguards (2026-10-08)
- Read official HTML and PDF sources with robots checks and actual fetch dates. Do not use a successor’s product data to fill a former brand.
- Keep complete table rows and adjacent timing conditions; classify cost brackets as fees, not limits. A heading cannot supply a fact missing from a quotation.
- FCA coverage rows say live lookup only; provider-stated FRNs are sourced to the provider, never asserted as FCA-verified.
- Both profile robots metadata and the sitemap must use the same substantive-evidence gate, with no legacy verification bypass.

## Quality assessment (2026-10-08)
- Google does not provide a pre-launch quality certificate or a published numeric quality threshold. Our publishing checks are our own safeguards; never label them Google approval.
- Provider comparisons must show exact source quotations, their context, route/product qualifications and fetch dates. Keep receiving-only evidence out of sending comparisons. No inferred cheapest or fastest rankings.
- A missing complaint count is missing, never zero. Absence from a published dataset does not establish a business's complaint volume or why it is absent.
- Record substantive extraction and display corrections publicly at `/corrections/`.
- Privacy copy must describe actual collection, profile suppression, audit-history retention, request logging and temporary lookup caching accurately.
- The registered operator's name and company number still need confirmation from the owner. Do not copy a company identity from another website just because it has common ownership.
