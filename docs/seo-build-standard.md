# IMT UK — SEO & Content Build Standard

**Status:** v0.2 — business model, stack, positioning and rate source all resolved.
**Owner:** matthew@woodley.digital
**Last substantive update:** 2026-09-02

This document consolidates five source documents into a single operating standard for
building **International Money Transfer UK (IMT UK)** at `https://internationalmoneytransfer.uk`.
It is the build specification, the editorial standard, and the pre-publish gate.

## Source documents

| Ref | Document | Role |
|---|---|---|
| **S1** | *Patent-Informed SEO Website + Content Playbook* (24 Jul 2026) | Master build spec: architecture, templates, scorecard, governance |
| **S2** | *Visual Semantics: The Missing Piece of Topical Authority* — Koray Tuğberk Gübür, Search Engine Land (14 Jul 2026) | Layout, centerpiece annotation, page **function** as a ranking input |
| **S3** | *Query Templates: Expanding the Scope of Topical Authority* — same author (12 Aug 2026) | Topical map shape: core/outer sections, Query Deserves a Page, microsemantics |
| **S4** | *JavaScript Best Practices for SEO* — Joe Hall (11 Mar 2025) | Rendering, indexing signals, discovery, performance QA |
| **S5** | *Exact Match Domain SEO Research Study* — Holistic SEO & Digital | EMD mechanism, brand-identity requirement, failure modes (§4.1) |

**Evidence hierarchy (from S1).** Current Google Search documentation is the operational
baseline. Patents and the case studies in S2/S3 are *design evidence* — durable
information-retrieval principles — not confirmed ranking factors. First-party business
evidence decides what the site actually says. Nothing in this standard may conflict with
current Google Search Essentials or spam policies.

---

## 1. Where the four sources agree

These are settled and non-negotiable. They form the build's foundation.

1. **Primary content must exist in the initial HTML response.** S1 Rule 01, S4 §1.1–1.2.
   Title, meta robots, canonical, H1, body copy, primary image, JSON-LD and internal
   `<a href>` links are server-rendered or statically generated. JavaScript enhances; it
   never supplies the only copy. This is a critical failure if breached — the page does not
   publish.
2. **One route, one purpose, one canonical.** S1 Rule 02, S4 §2.3. Self-referencing
   canonical in static HTML, never rewritten client-side.
3. **Semantic, ordered blocks.** One H1, ordered H2/H3, correct landmarks, DOM order
   matching reading order. Every block has exactly one dominant function: answer,
   evidence, comparison, instruction, navigation, conversion, or disclosure. (S1 §4.5, S2)
4. **Structured data must be static, truthful, and visible.** JSON-LD in the initial HTML
   (S4 §2.2), describing only entities and properties actually rendered on the page (S1
   Rule 07). Inventing ratings, reviews, prices, authorship, or credentials is a critical failure.
5. **Contextual internal links in the main content**, with descriptive anchors, placed next to
   the explanation that creates the need for the destination — not in sitewide keyword blocks.
6. **Information gain is mandatory**, not decorative. Every important page must make a
   defensible contribution beyond the commodity result set (S1 §6.2). Scores below 14/20
   on this dimension block publication.
7. **Real freshness controls.** Store publish date, last *substantive* update, reviewer, owner,
   review interval, change note. Never touch a visible date without a substantive revision.

---

## 2. What S2 and S3 add beyond the playbook

S1 tells you how to build a correct site. S2 and S3 explain why a *correct* site can still
lose to competitors with identical facts — and that gap matters enormously for money
transfer, where every competitor quotes the same mid-market rate.

### 2.1 Page function is a classification signal (S2)

Google appears to classify a source by **what its layout lets a user do** before it weighs
what the text says. The helpful content system is described in S2 as closer to
*functional* than *helpful*: a page that lets a user compare, calculate, filter, quote or
transact is classified differently from a page that merely describes those things.

> "What a page can do, or can't do, is largely determined by its layout and page components."

The corollary is a spam risk, not just an opportunity: Google added **misleading
functionality** to its spam policies. A page that *implies* it can compare or calculate but
does not genuinely do so is worse than one that never claimed it. **We build real
functions or we make no functional claim.**

### 2.2 Centerpiece annotation (S2)

The centerpiece annotation is the primary content block Google extracts to decide what a
page is for — roughly 400 characters, extracted from HTML, and easily corrupted by
boilerplate (share buttons, nav, promo strips) interleaved into the main content flow.

The S2 case study's largest single win across 19 changes was **moving a calculator
component from the bottom of the page to the top**, making it the centerpiece.

**IMT UK translation:** the functional component — the live comparison / quote / cost
calculator — sits above the fold, in the main content, first in DOM order after the H1.
Not a hero image. Not three paragraphs of prose. Not a component that requires
JavaScript to render its shell (S3's QR-code project explicitly ensured its centerpiece
served without JS rendering).

**Build rule:** no boilerplate DOM between the H1 and the first substantive content block.
Share buttons, breadcrumb chrome, promo bars and newsletter modules must not interrupt
the main content stream.

### 2.3 Macro-context and micro-context (S2)

- **Above the fold = macro-context = main content.** Relevance, accuracy, completeness,
  and the primary conversion function.
- **Below the fold = micro-context = supplementary content.** Secondary attributes and
  the majority of internal links.

### 2.4 Four semantic techniques (S2/S3)

Apply all four to every important page:

| Technique | Meaning | IMT UK example |
|---|---|---|
| **Visualisation** | Present content with the right semantic component for the attribute | Rate history as a chart; fee structures as a comparison table, not prose |
| **Verbalisation** | Convert visually-encoded information into text crawlers and LLMs can read | Every chart/table gets an adjacent text summary stating the actual finding |
| **Commercialisation** | Give informational documents genuine conversion function at the top | A guide to sending money to India carries a live corridor comparison, not just links |
| **Contextualisation** | Keep heading order and page segments flowing context toward the target topic | A "cost" page flows toward providers and quotes; a "how-to" page flows toward steps |

### 2.5 Query templates and the topical map's two sections (S3)

A topical map has a **core section** (mostly commercial, holds the central entities) and an
**outer section** (mostly informational, bridges the central entity to adjacent entities).
Internal links flow **outer → core** to transfer ranking signals. Every informational page
that earns clicks strengthens the commercial pages it links to.

Two routes to topical authority, and the hybrid is strongest:
- **Entity–attribute:** cover every entity in a class across the same shared attribute set.
- **Query template:** cover every variation of a query pattern (authority attaches to the
  *format*, e.g. WikiHow and "how to").

### 2.6 Microsemantics (S3)

Sentence-level structure changes relevance. Word order and dependency-tree position
matter: if the query's subject is "international money transfer," that phrase belongs in
the subject position of our declarative sentences — not buried as an object.

> "Financial independence is achieved by families with the help of financial advisors."
> vs. "Financial advisors help families achieve financial independence."

Same fact, materially different relevance depending on the query network targeted. This is
a marginal gain per sentence, multiplied across every variation of a query template.

### 2.7 Cost of retrieval (S2/S3)

> "The cost of ranking a site can't exceed the cost of not ranking a site."

Lower our retrieval cost by: pruning pages that fail Query Deserves a Page, fixing technical
issues that dilute signal per document, keeping HTML lean and DOM small, keeping response
times fast, and **never changing image or media URLs** once published (S3 documents
measurable image-ranking loss from partial image redirects during a migration).

The extended formula from S2:

```
((Historical click data × Topical coverage) ÷ Cost of retrieval) × Right visual annotations
```

### 2.8 Classification, then click data — the ranking latency model

This is the frame the rest of §2 sits inside, and it governs how we sequence the build and
how we read early performance data.

The author's fuller account of the AudioToText.com project: a **single-page** exact-match
domain, **zero backlinks**, total project cost **under $200**, outranking enterprises valued
at $40–60 million. He names two causes, and the EMD is not one of them.

**1. Visual semantics.** It lets Google classify the site into the correct context, recognise
genuine human effort, and — critically — *evaluate click signals with greater confidence*.
Classification is upstream of everything else.

**2. Click data, accumulated over time.**

> "The content and design remained exactly the same whether the site was receiving two
> clicks or 8,000 clicks per day. The difference is that, over time, Google tested the
> website and developed greater confidence in its click signals."

The site that earned 8,000 clicks/day was byte-for-byte the site that earned two. Nothing
about the page improved. What changed was Google's accumulated confidence.

#### The two distinct failure modes

> "Many SEO projects fail to rank not because they lack quality, but because Google has not
> classified the website correctly through its visual semantics. Alternatively, the site may
> not yet have accumulated enough click data or undergone sufficient testing."

These demand opposite responses, and confusing them is expensive:

| Failure mode | Symptom | Correct response |
|---|---|---|
| **Misclassified** | Google has the wrong idea of what this site *is* | Fix layout, centerpiece, page function. Design work. |
| **Untested** | Classification is right; confidence hasn't accumulated yet | **Change nothing.** Wait, and accelerate testing. |

**Operational rule for IMT UK:** get classification right *before* launch, then hold the
design stable through the testing window. Churning layout while waiting for click data
destroys the very signal we are waiting to accumulate, and resets the test. Flat early
performance is the expected shape of this curve, not evidence of a design failure.

The corollary for the pre-launch phase is the opposite and equally strong: because the
design is what gets tested and then held, **the centerpiece and page function must be
correct at launch**, not iterated toward afterwards. There is no cheap second attempt.

#### Where backlinks fit

> "Backlinks and PageRank can accelerate this process by helping a website earn earlier
> testing and collect historical click data more quickly."

Links are an **accelerant on the testing timeline**, not a substitute for classification —
AudioToText.com reached its position with zero. They buy earlier entry into testing and
faster accumulation of historical click data, and act as an additional trust signal. For a
YMYL financial site with no history, that acceleration is worth more than it would be
elsewhere, but it cannot rescue a site Google has classified wrongly.

#### Recovery is not symmetric

> "If your site loses rankings after a Broad Core Algorithm Update, those rankings may not
> return in the same form — or for quite some time."

Accumulated confidence is expensive to build and is not automatically restored by reverting
a change. This is the strongest argument in this document for the pre-publish gate in §8:
**it is far cheaper to withhold a weak page than to recover from having published it.**

---

## 3. The one real tension between the sources — and how we resolve it

**S1 prohibits** "mass-produced pages that differ only in headings, names or a small data
field," "repetitive city/product substitutions," and city-name-swapped location pages.
It calls this a critical failure.

**S3 advocates** covering thousands of query-template variations, and describes
programmatic builds running to 100,000+ URLs.

These are not actually contradictory, but the gap between them is exactly where a money
transfer site goes wrong. "Send money to [country]" × 200 is the single most tempting and
most dangerous pattern available to us.

### Resolution — the IMT UK page-creation gate

A templated page may be created **only** when it clears all four tests:

1. **Demand threshold.** Real, evidenced search demand for that specific variation —
   read as **demand × transaction value**, not raw volume (§4.2.2).
2. **Semantic distinctness (S3's Query Deserves a Page).** The variation involves a
   *different entity*, or a *different predicate set* with low semantic similarity to
   existing pages. If the predicates are the same and the entity is the same, it is a
   section, not a page. If predicates differ, or the entity differs, it earns a page.
3. **Genuine differential data (S1 Rule 09).** The page carries information that is
   materially different for *that* variation, not the same paragraph with a swapped noun —
   e.g. real corridor-specific transfer costs, delivery times, payout methods, receiving-
   country regulations, currency controls, provider availability.
4. **Genuine function (S2).** The page performs a real action for that variation — a live
   comparison or calculation for that corridor — not a described one.

**If a variation fails any test, it becomes a section on a parent page, or it is pruned.**
S3 is explicit that a full topical map can legitimately be a *single page*, and that pruning
increases PageRank concentration and relevance per document. Fewer, denser, genuinely
differentiated pages beat a corridor matrix.

---

## 4. IMT UK entity record (source of truth)

Reused verbatim by the footer, contact page, about page, and `Organization` JSON-LD.
Nothing on the site may state these facts differently.

```yaml
name:        International Money Transfer UK
alternate:   IMT UK
url:         https://internationalmoneytransfer.uk
address:
  street:    Harley House, 29 Cambray Pl
  locality:  Cheltenham
  region:    Gloucestershire
  postcode:  GL50 1JN
  country:   GB
legal_name:  TBC          # confirm registered company name + number
company_no:  TBC
fca_status:  TBC          # see §5 — blocking for content
telephone:   TBC
email:       TBC
profiles:    TBC          # authoritative social/business profiles
```

### 4.1 The exact-match domain

`internationalmoneytransfer.uk` is an exact-match domain (EMD) on a `.uk` ccTLD. This is a
strategic fact about the project, not a footnote, so it gets its own treatment.

**S5:** *Exact Match Domain SEO Research Study* — Holistic SEO & Digital
(`holisticseo.digital/seo-research-study/exact-matching-domain`).

#### The mechanism is real, but multiplicative

The 2012 EMD update reduced the advantage rather than removing it. Google's Gary Illyes:
*"People were exploiting the exact match domains, and we decreased their advantage for
rankings."* S5's argument is that the relevance threshold was raised, not that EMDs stopped
working — and that the mechanism is a **query-classification effect**:

> "Exact Match Domains bend the query search needs, and change the query context with
> navigational query classifications."

An EMD can convert a generic query into a branded, navigational one. That is a genuine and
valuable effect for us — but S5 is blunt that **99% of EMDs fail**, and that the effect only
fires in the presence of brand identity and topical authority.

**Reconciling S5 with §2.8.** These are not in conflict once the EMD is read as a
*multiplier* rather than an additive advantage. AudioToText.com's two named causes were
visual semantics and click data; the EMD amplified them once they were in place. A
multiplier applied to zero classification and zero click history is still zero. So:

> The domain amplifies brand and topical authority. It does not substitute for them, and it
> confers nothing on its own.

#### What S5's case study actually did

A Turkish EMD outranked competitors with 8.1M backlinks and 7.5M monthly traffic while
holding **96 referring domains and 453 backlinks** (Ahrefs DR 4.1, Semrush AS 23): 80+ pages
indexed by day 3, 100+ daily clicks by day 7, 5,000+ organic clicks in month one, 377
top-3 queries within six months.

What it invested in was **brand identity resolution across channels**, not links:

- Social profiles (LinkedIn, Facebook, Instagram, YouTube)
- Google Business Profile
- Structured data explicitly defining the brand entity
- Citations in 50+ business directories
- **Interactive web applications** — which is §2.1's page-function requirement arriving from
  a second, independent direction

Alignment matters too: rankings improve faster when *"the central entity in the brand name
and central entity in the semantic content network align."* Site-wide n-grams from the
domain and brand help identify the macro-context.

#### Our specific exposure

Our brand name is a maximally generic phrase, which puts us squarely in S5's named
disadvantage: **brand identity resolution** — multiple entities sharing a name create
confusion — and consequently **higher marketing cost to differentiate**. Two consequences:

1. **The brand-signal work is load-bearing, not garnish.** Consistent NAP, a Google Business
   Profile against the real Cheltenham address, `Organization` schema with a stable `@id`,
   and directory citations are what let the domain function as a brand rather than a
   keyword string. This moves up the build order, not down.
2. **Bing is a live risk.** S5 reports Bing *removing* the case-study domain from results
   entirely rather than demoting it — a harsher posture than Google's. Monitor Bing
   Webmaster Tools separately from GSC from day one; do not assume GSC health implies Bing
   health.

#### The line we must not cross

S5 distinguishes an EMD from a **"misleading exact match domain"** — one that cannot rank
because it fails to satisfy the user need its name promises. A domain called
*international money transfer* that does not let a visitor actually resolve an international
money transfer question is exactly that failure, and it converges with §2.1's misleading
functionality and §6.2's mid-market boundary. Three independent sources point at the same
requirement: **the site must genuinely do the thing its name claims.**

### 4.2 Positioning — large-value transfers, not remittance

**Decided 2026-09-02.** IMT UK targets **large-value international transfers**, not
remittance. Working threshold: **£10,000+**, with the archetypal transfer in the
**£50,000–£500,000** range.

Archetypal use cases: overseas property purchase (deposit and completion), emigration and
moving savings, inheritance and probate distribution, repatriating the proceeds of an
overseas property sale, business and supplier payments, school and university fees, pension
transfers, and divorce settlements crossing borders.

Corridors follow the use cases, not remittance flows: **EUR** (France, Spain, Portugal,
Ireland, Italy, Greece, Cyprus), **AUD**, **NZD**, **CAD**, **USD**, **AED**, **CHF**,
**ZAR**, **SGD**, **HKD** — plus **inbound to GBP**, which is a real and often-ignored
segment (overseas buyers of UK property, returning expatriates).

This decision propagates. Four consequences, each of which changes a rule elsewhere in this
document:

#### 4.2.1 The competitive set is not who you would assume

We are not competing with the Wise/Remitly remittance content machine. The competitors are
**FCA-authorised currency brokers** — Currencies Direct, TorFX, OFX, Smart Currency
Exchange, Key Currency, Lumon, Clear Currency, Halo Financial and similar.

Their pricing model matters enormously to us: **they typically charge no explicit fee and
take their entire revenue from the spread.** For a zero-fee broker, total cost *is* the
margin. Our checker's fee-versus-margin decomposition (build-spec §1.3) is therefore aimed
precisely at the dominant pricing model in this market — and it makes the point vividly,
because the tool resolves a "free transfer" into a real number.

#### 4.2.2 The demand threshold in §3 is value-weighted, not volume-weighted

§3 test 1 asks for evidenced search demand. **Read it as demand × value, not raw volume.**
A query with a hundred searches a month can comfortably deserve a page when the transaction
behind it is £250,000. Applying a remittance-scale volume threshold here would prune exactly
the pages worth having. The other three tests are unchanged and still bind.

#### 4.2.3 YMYL intensity goes up, not down

Property completions, emigration and life savings. The consequence of getting a fact wrong
is materially worse than in remittance, so the named-reviewer requirement (decision #6)
becomes more important, not less. No regulatory or cost claim ships without one.

#### 4.2.4 Safeguarding is not FSCS — our strongest information-gain opportunity

Authorised payment institutions **safeguard** customer funds under the Payment Services
Regulations 2017. They are **not** covered by the Financial Services Compensation Scheme.
These are different protections with different consequences in an insolvency.

Someone moving £300,000 through a currency broker very often assumes FSCS protection
applies. It does not. This is poorly explained across the entire competitive set, it is
precisely the fact our audience most needs before committing a life-changing sum, and it is
the clearest information-gain opportunity available to us (§1 rule 6).

It is also a regulatory claim about a regulatory regime, so it ships only with primary
sourcing (FCA Handbook, PSR 2017, FSCS's own material) and a named reviewer. **Verify before
writing — do not draft this from memory.**

Adjacent opportunities with the same profile: **forward contracts and limit orders** (which
brokers offer for property completions, and which are genuinely complex and badly
explained), **source-of-funds documentation** requirements for large sums, and **exchange
rate risk against a fixed completion date**.

---

## 5. Business model and regulatory constraint

**Decided 2026-09-02: introducer model.** IMT UK is an independent tool and information
site that introduces users to FCA-authorised currency brokers, earning commission per
funded client. We do not execute transfers and we are not a provider.

International money transfer is a **regulated activity in the UK** under the Payment
Services Regulations 2017, supervised by the FCA. This is squarely YMYL territory, and S1
makes "unsupported financial claims" an **automatic no-publish critical failure**.

### 5.1 What the decision settles

- The **core section is commercial**: the margin checker leads to a broker introduction.
  This matters beyond revenue — S2's affiliate-to-ecommerce case shows identical content
  ranking better once the surrounding source type became functional and commercial. A site
  with no conversion function is at a *classification* disadvantage, not only a business one.
- Schema stays `Organization` + `WebApplication`. **Not** `FinancialService`, and not
  `FinancialProduct` — we provide neither.
- Commercial relationships **must be disclosed** (S1 §5.4). `/how-we-make-money` is a
  required page, not an optional one.

### 5.2 The independence rule — non-negotiable

**The margin checker's output must never be influenced by a commercial relationship.**
The tool computes arithmetic against a public reference rate; that computation is identical
whether or not a broker pays us, and no partner may alter, suppress or weight a result.

This is not only ethics. The tool's entire value — and the reason anyone links to or trusts
it — is that it is independent. A checker suspected of being a sales funnel is worth nothing
to a user and nothing to us. Any feature request that would make the result depend on a
commercial arrangement is refused.

### 5.3 Still open — needs compliance advice, not our inference

The introducer model raises specific questions we must not answer from first principles.
Flagged for a qualified compliance or legal review:

- **Whether introducing to payment service providers is itself regulated**, and on what
  terms. Money remittance sits under the PSRs rather than the RAO, so the analysis differs
  from an investment introducer — but that is a question for advice, not an assumption.
- **FX forward contracts are the sharp edge.** A currency forward can be a MiFID financial
  instrument rather than a spot contract, depending on settlement period and commercial
  purpose. Content and introductions touching forwards may fall under a different regime
  than those touching spot transfers. `/forward-contracts` is planned, so this needs
  resolving before it publishes.
- **Financial promotion status** of the site's copy and of any introduction journey.
- **Appointed representative or introducer agreement terms** with each broker.
- ASA/CAP advertising rules apply to all of it regardless of FCA status.

Nothing that states or implies a rate, fee, delivery time, or regulatory status ships
without a verified first-party source and a named reviewer.

---

## 6. Exchange rate data — Frankfurter API

**Source:** `https://api.frankfurter.dev/v2` — Frankfurter v2.1.1, MIT licensed, open source,
no API key. Verified against the live API on 2026-09-02.

### 6.1 What it provides

| | |
|---|---|
| Providers | **84** central banks and monetary authorities, blended |
| Currencies | **165** (active; `?scope=all` adds legacy) |
| History | Full daily history, in some cases back to the 1980s–90s |
| Cadence | Daily. Observed `cache-control: public, max-age=69365, stale-if-error=86400` |
| UK-relevant | **BOE** — Bank of England, *spot rate*, GBP pivot. **ECB** — *reference rate*, EUR pivot |

Endpoints:

| Endpoint | Use |
|---|---|
| `GET /rates` | Latest or historical, `date` or `from`/`to`, `base`, `quotes`, `providers`, `group=week\|month`, `expand=providers` |
| `GET /rate/{base}/{quote}` | Single pair, optional `date`, `providers` |
| `GET /currencies` | Currency list with names, symbols, date ranges |
| `GET /currency/{code}` | One currency, incl. provider info / peg metadata |
| `GET /providers` | Provider list: key, name, country, `rate_type`, pivot, cadence, coverage, terms URL |

Corridor coverage is good. Of the currencies that matter for UK remittance, all of
INR, PKR, NGN, PHP, PLN, RON, EUR, USD, AUD, ZAR, KES, GHS, BDT, LKR, NPR, TRY, THB,
VND, UGX, TZS, ZMW, JMD, CAD, NZD, AED, HUF, CZK, MAD, EGP, SOS, ETB, ALL and UAH are
present. **BGN is absent** — handle Bulgaria explicitly rather than failing silently.

Constraint to design around: requests using `providers` or `expand=providers` recompute the
blend per date and return **422 for daily ranges longer than 5 years**. For long history,
use `group=week`/`group=month`, name providers, or split the range.

### 6.2 The boundary that matters — mid-market is not the customer rate

**These are central bank reference, spot and mid rates.** The `rate_type` values across the
84 providers are "reference rate," "official rate," "indicative rate," "spot rate," "middle
rate," "FIX," and similar. **No consumer receives these rates.**

The gap between the mid-market rate and the rate a provider actually gives a customer *is
the provider's margin* — and it is the single most important consumer-protection fact in
this market, routinely larger than the advertised transfer fee.

This makes Frankfurter both our best asset and our sharpest risk. Under §2.1 and Google's
**misleading functionality** spam policy, and under §8's critical-failure list for
unsupported financial claims:

| Frankfurter **can** legitimately power | Frankfurter **must never** power |
|---|---|
| The mid-market benchmark — "the real exchange rate," sourced and dated | "The rate you will get" |
| Historical rate charts and trend analysis | A quote, or anything transactable |
| A margin/markup calculator: user enters a provider's quote, we show the hidden spread | A comparison of what providers actually charge |
| Currency reference and corridor context | Any implied provider rate |

A centerpiece calculator that renders "send £1,000 → receive ₹128,750" from BOE/ECB rates
is a **critical failure under our own gate**, because nobody receives that amount. It is a
misleading functional claim, not a rounding error.

### 6.3 Recommended centerpiece function

The honest, differentiated function this data genuinely supports — and which needs no
provider-rate licensing and no FCA permission to compute:

> **A mid-market rate reference and margin calculator.** Show the true mid-market rate,
> live and dated. Let the user enter the rate or total a provider quoted them, and show the
> spread in pounds and as a percentage — the cost that provider's marketing does not name.

This satisfies §2.1 (a real function, not an implied one), §2.4 commercialisation, and the
information-gain requirement, because most competitors either hide the mid-market
comparison or bury it. It works regardless of how open decision #1 resolves.

**Decided.** This is the site's centerpiece. Full functional specification — inputs,
computation, edge cases, tone constraints and rendering contract — is in
[`build-spec.md`](build-spec.md) §1. Note the property that makes it safe: the provider's
numbers are supplied by the *user*, so we assert only arithmetic against a dated,
attributed reference rate, and never claim anyone's rate.

### 6.4 Implementation rules

- **Fetch server-side.** Rates render into the static HTML per §1 rule 1. Never client-fetch the
  centerpiece's numbers.
- **Revalidate daily**, aligned to the ~19h cache TTL. Rate data is volatile; the *page* is
  not — do not let a rate refresh rewrite the visible "last updated" date (§1 rule 7).
- **Always render source and timestamp adjacent to the number**: which provider, which
  rate type, which date. S1 §6.6 requires publication/effective dates for volatile facts.
- **Verbalise every chart** (§2.4) — a rate chart carries an adjacent sentence stating the
  actual movement, not just an axis.
- **Attribute the data.** Frankfurter is MIT, but the underlying data carries the providers'
  own terms — BOE (`bankofengland.co.uk/legal`) and ECB both publish terms; `/providers`
  exposes a `terms_url` per provider. Review before launch.
- **Degrade honestly.** On a 422/503 or stale data, show the last known rate *with its real
  date*. Never interpolate, never show a stale figure as current.
- **Never expose an unbounded date range** to a user-controllable parameter — it is both a
  422 risk and a crawl trap. Range pages, if any, must clear §3's four tests.

---

## 7. Rendering and technical baseline (S1 §4.3, S4)

- **SSR or SSG** for every indexable route. Title, canonical, meta robots, H1, body,
  primary image, JSON-LD and internal links present in the raw document response.
- **History-based routing**, never hash routing. Every route returns a real 200.
- **Real `<a href>` anchors** for all navigation and discovery. No `onclick`-only paths.
- **Never block** `/js/`, `/css/`, `/images/` in robots.txt. Robots.txt controls crawling;
  meta robots / `X-Robots-Tag` control indexing.
- **Tabs and accordions** ship their content in the initial HTML, hidden with CSS — never
  injected on interaction.
- **Pagination** exists as real URLs alongside any lazy loading. `loading="lazy"` on
  below-fold media only; never on the LCP image.
- **Hashed asset filenames** with long-lived immutable cache headers. Content URLs
  (pages, images) stay stable forever.
- **Core Web Vitals targets:** LCP ≤ 2.5s, INP < 200ms, CLS ≤ 0.1 at the 75th percentile,
  field data.
- **Keep HTML lean.** S2 notes Google reduced its HTML file size limit to 2MB and
  deindexed at scale after the December 2025 core update. Small DOM, few third-party
  scripts.

### Rendering QA — run on every indexable template

1. `view-source:` contains the H1, the primary copy, the canonical, the meta robots, the
   JSON-LD, and the main internal links.
2. Page renders its core content and navigation with JavaScript disabled.
3. Rendered DOM has not rewritten the canonical or robots directive.
4. GSC URL Inspection → View Crawled Page → HTML matches the visible page.
5. Automated per-template test asserting 1–3 in CI.

---

## 8. Pre-publish gate

From S1 §9. **Threshold: 85/100, and no critical failure.**

| Category | Points | Minimum |
|---|---:|---|
| Technical accessibility | 20 | |
| Architecture and internal links | 15 | |
| Intent completion | 15 | |
| **Information gain** | **20** | **must score ≥ 14** |
| Answer and passage quality | 10 | |
| Entities and structured data | 8 | |
| Visual and image semantics | 5 | |
| Trust, sources and freshness | 7 | |

### Critical failures — automatic no-publish

- Main content, H1, or priority links absent from rendered HTML
- Incorrect canonical, accidental noindex, blocked rendering resources, soft 404
- Substantial duplication, or a corridor/location permutation with no distinct value
- Structured data contradicting visible content, or inventing facts
- **Unsupported financial claims** — rates, fees, delivery times, regulatory status
- Fabricated author, reviewer, credentials, testing, reviews, or first-hand experience
- Information gain below 14/20
- No meaningful internal path to the page

### IMT UK additions to the gate

- **Centerpiece check.** Is the functional component the first substantive block in DOM
  order, above the fold, and does it render without JavaScript?
- **Misleading functionality check.** Does every function the page implies actually work?
- **Mid-market boundary check (§6.2).** Is every rate on the page labelled for what it is —
  a central bank mid/reference rate — with its provider and date adjacent? Does the page
  anywhere imply a customer would receive it?
- **Verbalisation check.** Does every chart, table, and rate display have adjacent text
  stating the actual finding?
- **Anchor diversity.** No anchor text repeated more than three times within main content
  across the site (S3).
- **Media URL stability.** No image or media URL changes without a documented migration.

---

## 9. Open decisions

| # | Decision | Blocks |
|---|---|---|
| 1 | ~~Business model~~ — **resolved: introducer to FCA-authorised brokers (§5)** | — |
| 2 | Legal entity, company number, and compliance advice on the §5.3 questions — introducer status, FX forwards as MiFID instruments, financial promotion status | `/forward-contracts`, any introduction journey |
| 3 | ~~Mid-market rate data source~~ — **resolved: Frankfurter (§6)** | — |
| 3b | **Provider fee/rate data** — do we have a licensed source for what providers actually charge? Frankfurter cannot supply this (§6.2) | Any true provider comparison |
| 4 | ~~Tech stack~~ — **resolved: Next.js (App Router) on Vercel, Tailwind, SSG + daily revalidation** | — |
| 5 | ~~Corridor scope~~ — **resolved: large-value transfers, corridors per §4.2** | — |
| 6 | ~~Named reviewer~~ — **resolved: Matt Woodley, Founder, BCom Finance & Economics (Auckland). Records and `ProfilePage` built.** Scope limits at site-plan §8.1 | — |
| 7 | Whether to invest in earning links to accelerate click testing (§2.8) | Launch timeline expectations, not the build |
| 8 | Brand-signal assets: Google Business Profile, social profiles, directory citations (§4.1) | Whether the EMD functions as a brand — load-bearing, needs owner and start date |

---

## 10. Governance

- Page brief approved before drafting; information-gain statement recorded before writing.
- Source log with dates mapped to individual claims.
- Writer, subject reviewer, final editor named per page.
- Scorecard completed pre-publish; review interval and owner assigned at publish.
- Volatile financial facts get short review intervals.
- Quarterly cannibalisation review; consolidate pages competing for the same purpose.
- Do not respond to a ranking decline by adding text, FAQs, schema or links
  indiscriminately. Diagnose crawl/indexing, intent mismatch, information deficit, source
  quality, competition, UX and commercial fit separately.
- **Hold the design stable through the testing window (§2.8).** Before changing layout in
  response to flat performance, establish which failure mode we are in: *misclassified*
  (fix the design) or *untested* (change nothing and wait). Redesigning an untested site
  resets the click-data accumulation we are waiting on. Record the diagnosis and the date
  before acting.
