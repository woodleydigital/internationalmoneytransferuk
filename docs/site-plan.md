# IMT UK — Site Plan

**Status:** v0.2 — business model resolved; topical map built on entity-attribute and page-function axes.
**Last substantive update:** 2026-09-02
**Goal:** rank for *international money transfer* and *international money transfer uk*.
**Governed by:** [`seo-build-standard.md`](seo-build-standard.md) (the gate) and
[`build-spec.md`](build-spec.md) (the centerpiece). Neither is overridden here.

---

## 1. The head term is an outcome, not a target

No page on this site targets *international money transfer uk* directly, and that is the
plan working as intended rather than a gap in it.

Every source points the same way:

- **S3:** internal links flow **outer → core**. Ranking signal is accumulated by
  informational pages and transferred to the commercial page. The head term sits on the
  core page and is *fed*, not chased.
- **Standard §2.8:** classification comes first, then click confidence accumulates against
  an unchanged design. A brand-new site pointed at a head term has neither.
- **S5:** an EMD converts a generic query into a navigational one — but only once brand
  identity and topical authority exist. 99% of EMDs fail precisely by skipping that step.

So the sequence is: **be classified correctly → win a network of specific, winnable queries
→ accumulate click data → the head term arrives at the core page.** Trying to shortcut
this is the single most likely way for this project to fail.

What we *do* control today: the homepage is unambiguously the core page for the head term,
it carries a real function, and every outer page links into it.

### 1.1 Microsemantics for the head term (S3 §2.6)

Because the target phrase is a noun phrase, it must appear in **subject position** in our
declarative sentences, not buried as an object. Concretely:

| Weak | Strong |
|---|---|
| "Check the margin on your transfer" | "**International money transfer** costs more than the fee you were quoted" |
| "We compare rates for you" | "**An international money transfer** carries two costs: the fee you are shown and the margin you are not" |

**Immediate change to the homepage H1**, which currently omits the phrase entirely:

> **Check the margin on your international money transfer**

Natural English, states the outcome, and contains the exact phrase. The title element takes
the brand suffix, so the EMD reinforces it without the H1 opening on a brand token
(S1 §6.8).

---

## 1.2 What this site is — decided 2026-09-02

We own three properties in this niche. Their roles are now separated:

| Property | Role |
|---|---|
| internationalmoneytransfer.com | Global provider comparison and reviews |
| currencybrokers.uk | UK currency broker comparison and directory |
| **internationalmoneytransfer.uk** | **The tool site.** Diagnosis, not directory. |

**IMT UK is a tool property, not a comparison site.** It carries the margin checker, the
timing-cost tool, the FCA Register lookup and the protection comparator. It does **not**
carry a provider directory, provider reviews, or listings — those live on the sister sites
and duplicating them would put three of our own properties in competition (portfolio
analysis §0.1).

This is the AudioToText model the build has been pointing at since standard §2.8: a
single-purpose, exact-match-domain tool site that is classified by what it *does*.

**Three consequences.**

1. **The conversion is a quote request, not a comparison table.** The tool identifies the
   problem; the introduction resolves it. Users who want to compare providers are linked to
   the sister sites, which is a genuine service rather than a leak.
2. **Fewer words, not more.** S3 on the single-page case study: part of its advantage came
   from *"the higher relevance weight that comes from having fewer words on the page."* A
   tool site is not judged by the word counts of comparison sites — see the correction in
   portfolio analysis §4 action 6.
3. **Corridor pages face a higher bar.** On a tool site a corridor page must offer a
   corridor-specific *function*, not just corridor content. Most candidates in §4.4 will
   fail that and should become presets of the existing tools instead of routes.

**Entity relationship.** One organisation operates all three, so the `Organization` node
should carry `sameAs` for the sister properties once the legal entity is confirmed
(standard decision #2). Cross-linking is deliberate: it is what makes the shared brand name
resolve as one entity rather than two competing ones (S5, standard §4.1).

---

## 2. Topical map

Per S3, two sections. **Core** is commercial and holds the central entity. **Outer** is
informational and bridges to adjacent entities. All internal links flow inward.

```
                          OUTER SECTION (informational)
   ┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
   │  A. Cost &   │ B. Protection│ C. Currency  │ D. Process & │ E. Use cases │
   │    margin    │   & risk     │  instruments │  compliance  │              │
   └──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘
          │              │              │              │              │
          └──────────────┴──────►  CORE  ◄─────────────┴──────────────┘
                                    │
                    /  — International money transfer UK
                        + FX Margin Checker (the centerpiece)
                                    │
                         F. Corridor pages (phase 3)
```

**Why these five outer clusters and not others.** Each bridges the central entity to a
different adjacent entity class — cost, regulation, financial instruments, process, and
life events. That is the entity-attribute axis. The query templates in §3 are the
query-template axis. Covering both is S3's hybrid method, which it identifies as the
strongest of the three approaches.

### 2.1 The entity-attribute matrix

Clusters are not a topical map. S3: *"Processing an entire entity class through its shared
attributes signals comprehensive coverage of the topic to the search engine."* The map is
the cross-product below, filtered by Query Deserves a Page (§4.4 and standard §3).

| Entity class | Members | Shared attributes to cover for every member |
|---|---|---|
| **Corridors** | GBP→EUR, AUD, USD, NZD, CAD, AED, CHF, ZAR, SGD, HKD; inbound→GBP | mid-market rate, margin range, speed, receiving-country rules, tax/reporting, payment methods, cut-offs and holidays |
| **Provider types** | high-street bank, currency broker, fintech/neobank, private bank | pricing model, typical margin, regulatory status, **protection regime**, min/max, service model, speed |
| **Instruments** | spot, forward, limit order, stop-loss, regular payment plan | what it is, when used, cost, risk, who offers it, commitment and margin calls |
| **Life events** | property purchase, emigration, inheritance, business payment, school fees, pension transfer | typical amount, timing risk, documentation, tax, step sequence, common mistakes |
| **Protection regimes** | safeguarding (PSR 2017), FSCS, FOS, client money | what it covers, what it does not, who it applies to, insolvency outcome |

Two things this makes visible that the cluster list hid:

1. **The attribute set is the page outline.** A corridor page that does not cover all seven
   corridor attributes is incomplete; one that covers them with real receiving-country
   content clears standard §3 test 3 automatically.
2. **Provider types, not named providers.** We hold no licensed provider pricing data
   (decision #3b). Covering the *class* — how a currency broker's pricing model differs
   structurally from a bank's — is both defensible and more useful than a rate table we
   cannot source.

### 2.2 Page function per query type — the half that is usually missed

S2's air-conditioner example: each query type demands a different **layout and function**,
not one template with different words. A topical map "should also define the page type and
functional layout needed to satisfy both relevance and responsiveness."

So the answer to "we need more than a calculator" is **more functions**, not merely more
pages. One tool classifies one route.

| Query type | Required function | Status |
|---|---|---|
| cost / margin | Tool over live data | **Built** — FX Margin Checker |
| "is X safe" / verification | **FCA Register lookup** — real authorisation check | To build |
| protection comparison | **Protection comparator** — safeguarding vs FSCS vs FOS by provider type, as a structured information card | To build |
| timing / rate risk | **Timing-cost tool** — what a slipped completion date costs (§5) | To build |
| which instrument | **Decision tool** — spot vs forward vs limit for a given situation | To build |
| documentation | **Requirements checklist** by amount, corridor and use case | To build |
| corridor data | Live rate, history and corridor specifics, verbalised | To build |
| instructional | Guide layout, minimal commercial furniture | Content |

Seven functional components. Each widens what the site *is* to a classifier, and each is
buildable from data we already hold or public sources — none requires licensed provider
pricing.

### 2.3 The commercial core (introducer model)

Standard §5 settles this: the checker leads to an introduction to FCA-authorised brokers.

- **The conversion is the natural next step from the tool's own output.** A user who has
  just seen £6,941 of undisclosed margin has the problem; the introduction is the resolution.
  This is S3's commercialisation technique applied to a tool rather than an article.
- **`/how-we-make-money` is a required page** (S1 §5.4), not a footer link. Disclosed
  plainly, it is also information gain — most comparison sites bury this, and saying it
  first is a trust signal for a YMYL audience moving life savings.
- **The independence rule (standard §5.2) binds the build:** no commercial relationship may
  alter a checker result. The tool's credibility is the entire asset.
- Every outer-section page carries the conversion element near the top, per S3 Example 4 —
  informational documents are commercialised rather than left as pure content.

---

## 3. Query templates (S3)

Authority attaches to the *format* as well as the topic. Six templates, each with real
variation and each feeding the core:

| # | Template | Example variations |
|---|---|---|
| T1 | `[cost/fees] of transferring [amount] to [country]` | cost of transferring £250,000 to Spain |
| T2 | `how to transfer [large amount] to [country]` | how to send £100,000 to Australia |
| T3 | `is [provider type] safe / what if [provider] fails` | are currency brokers safe; is my money protected |
| T4 | `[option A] vs [option B]` | currency broker vs bank; forward vs spot contract |
| T5 | `what is [instrument/concept]` | what is a forward contract; what is the mid-market rate |
| T6 | `[life event] currency transfer` | buying property in France; emigrating to Australia |

**T3 is the priority template.** It is a Boolean/explicit-question network, which S3 flags
as the best kind to convert into pages — it earns featured snippets, People Also Ask, and
the first LLM groundings, and those are the cheapest early clicks available to a site with
no history.

---

## 4. Route map

Every route states its intent, its unique contribution, and its status against the four
tests in standard §3. **Nothing publishes without clearing the §8 gate.**

### 4.1 Core

| Route | Intent | Unique contribution | Status |
|---|---|---|---|
| `/` | Commercial + tool | The FX Margin Checker. Head-term core page. | **Built** |
| `/how-we-calculate` | Trust / methodology | Formulas, source, limitations. Makes the tool citable. | **Built** |

### 4.2 Phase 1 launch set — the classification set

Ten routes, chosen so the site is classified correctly and each page carries genuine
information gain. **Deliberately small.** AudioToText.com (standard §2.8) reached its
position on a single page; the failure mode here is publishing forty mediocre pages and
being classified as a content farm before any of them earn a click.

| Route | Intent | Unique contribution | Template |
|---|---|---|---|
| `/safeguarding-vs-fscs` | Verification | **Flagship.** Safeguarding under PSR 2017 is not FSCS cover. Badly explained everywhere; the single most consequential fact for someone moving £300k. | T3 |
| `/exchange-rate-margin` | Informational | What a margin is, how to find it on your own quote, worked examples at scale. Links directly into the checker. | T5 |
| `/mid-market-rate` | Informational | What it is, who publishes it, why nobody is offered it. Uses our own live data. | T5 |
| `/fee-free-transfers` | Informational | Why a zero-fee transfer is not free, with the arithmetic. Aimed at the dominant broker pricing model (standard §4.2.1). | T5 |
| `/currency-broker-vs-bank` | Comparison | Decision framework with explicit trade-offs — not a provider ranking. Criteria stated before conclusions (S1 §5.4). | T4 |
| `/forward-contracts` | Informational | Locking a rate against a property completion date. Complex, poorly covered, exactly our audience. | T5 |
| `/transferring-large-sums` | Instructional | Source-of-funds documentation, AML checks, timing, what changes above £100k. | T2 |
| `/is-my-provider-authorised` | Verification | How to check the FCA Register, what permissions mean, what to look for. | T3 |
| `/transfer-timing-cost` | **Tool** | Second functional component — see §5. | T1 |
| `/how-we-make-money` | Trust / disclosure | **Required** by S1 §5.4 under the introducer model. Stated plainly and early, it is itself information gain — competitors bury it. | — |
| `/about` + `/contact` | Trust | NAP, entity, real address. Load-bearing for the EMD (standard §4.1). | — |

### 4.3 Phase 2 — use cases (commercialised informational)

Per S3 Example 4, informational pages carry conversion function at the top. Each embeds the
margin checker preset to the relevant corridor.

`/buying-property-abroad` · `/emigrating-moving-savings` · `/overseas-inheritance` ·
`/selling-overseas-property` · `/overseas-school-fees`

### 4.4 Phase 3 — corridors, only where they clear the gate

Corridor pages are where this project would most easily commit the critical failure in
standard §3. A corridor page publishes **only** with genuine receiving-country content:
local process, tax and reporting obligations, payout mechanics, documentation, typical
timing. A swapped country name is a critical failure, not a page.

Candidates, in likely order of merit: **Australia, France, Spain, USA, Portugal, UAE,
New Zealand, Canada.**

Test each against §3 before writing. Expect some to fail and become sections of a use-case
page instead. **That is the gate working.**

---

## 5. A second functional component: the timing-cost tool

Standard §2.1 says page function is a classification signal, and one tool on one route
classifies one route. A second genuine function widens what the site *is*.

**`/transfer-timing-cost` — what a moving completion date costs.**

Enter an amount and a corridor; the tool shows what that same transfer would have cost at
each point over the past 12 months, and the spread between best and worst. For someone with
a property completion that might slip by a month on £250,000, this quantifies a risk they
currently cannot see.

- Buildable now: Frankfurter serves full daily history (standard §6.1), with `group=week`
  or `group=month` for longer ranges.
- Genuine information gain: it is our own computation over public data, not a restatement.
- It motivates `/forward-contracts` — the instrument that exists to solve exactly this
  problem — creating a real contextual link rather than a manufactured one.
- Same constraints as the checker: mid-market only, labelled and dated, server-rendered,
  verbalised chart (standard §2.4).

---

## 6. Build sequence

Phases are gated by *classification and click accumulation*, not by calendar.

**Phase 0 — brand signals. Starts now, runs in parallel.**
This is load-bearing, not marketing garnish (standard §4.1). Our brand name is a generic
phrase, so these are what let the domain function as a brand rather than a keyword string:
consistent NAP everywhere, Google Business Profile against the Cheltenham address,
`Organization` schema with stable `@id` (done), directory citations, real social profiles.
Also: **register Bing Webmaster Tools separately** — S5 reports Bing removing EMDs outright
rather than demoting them.

**Phase 1 — launch the classification set (§4.2).** Ten routes, each clearing 85/100.
Then **stop and hold the design stable** (standard §2.8). Flat early performance is the
expected shape of the curve, not evidence of failure.

**Phase 2 — use cases (§4.3).** Expand the outer section, keep feeding the core.

**Phase 3 — corridors (§4.4).** Only after the outer section proves it earns clicks, and
only for corridors that clear §3.

**Phase 4 — measure and diagnose.** Before changing anything in response to flat results,
establish which failure mode applies: *misclassified* (fix the design) or *untested*
(change nothing). See §7.

---

## 7. Measurement

| Signal | What it tells us |
|---|---|
| Indexation speed and crawl requests per URL | Whether classification is landing (S3) |
| First clicks on T3 question pages | Earliest evidence of testing beginning (standard §2.8) |
| Rankings on outer pages *before* core | Expected order. Core moving first would be surprising. |
| Head-term impressions on `/` | The lagging indicator. Do not read it early. |
| Bing, separately from Google | S5's EMD removal risk |
| Checker completions | Task completion, not clicks (S1 §2.10) |

**The diagnosis rule.** A ranking decline or a flat curve is not a prompt to add text, FAQs,
schema or links. Diagnose crawl/indexing, intent mismatch, information deficit, source
quality, competition and UX separately (S1 §10.3), and distinguish misclassified from
untested before touching the layout.

---

## 8. What is blocked, and what is not

The business model is now settled (standard §5: introducer to FCA-authorised brokers) and a
reviewer has been identified. What remains blocked is narrower than before.

**Not blocked** — factual explanation of a regulatory regime, sourced primarily and reviewed:
safeguarding vs FSCS, how to check the FCA Register, what forward contracts are, AML and
source-of-funds process, the arithmetic of margins. This is most of Phase 1.

**Blocked pending the compliance advice in standard §5.3:**
- The introduction journey itself, and any copy that constitutes a financial promotion
- `/forward-contracts` — a currency forward may be a MiFID financial instrument rather than
  a spot contract, which changes the regime. Resolve before publishing.
- Any statement of our own regulatory status

**Blocked on data (decision #3b):**
- Commercial comparison tables of named provider pricing. Cover *provider types* and their
  structural pricing models instead (§2.1) — defensible, and more useful than a rate table
  we cannot source.

**Never:** any implication that we arrange, quote or execute a transfer.

### 8.1 Reviewer and the limits of that review

**Matt Boyd, Founder.** BCom, Finance and Economics, University of Auckland. Records are in
`lib/people.ts`; the profile with `ProfilePage` and `Person` schema is at `/about/matt-boyd`.

His review covers the parts of Phase 1 that turn on finance and market structure — which is
most of it:

| Route | Reviewer |
|---|---|
| `/how-we-calculate` | Matt — **live** |
| `/exchange-rate-margin` | Matt |
| `/mid-market-rate` | Matt |
| `/fee-free-transfers` | Matt |
| `/currency-broker-vs-bank` | Matt |
| `/transfer-timing-cost` | Matt |
| `/how-we-make-money` | Matt |
| `/transferring-large-sums` | Matt, provided AML and source-of-funds content stays a sourced summary of primary material rather than interpretation |
| `/is-my-provider-authorised` | Matt, for the procedural content — how to search the FCA Register and read a result |
| **`/safeguarding-vs-fscs`** | **Not Matt.** Needs separate qualified review — see below |
| **`/forward-contracts`** | **Not Matt.** Also blocked on the MiFID question in standard §5.3 |

**Why two pages sit outside it.** A degree in finance and economics is a real and relevant
credential, and it comfortably covers spreads, pricing models, market structure and our own
arithmetic. It is not, on its own, evidence of competence in *UK financial regulation* — and
those two pages turn entirely on that: what safeguarding covers in an insolvency, how it
differs from FSCS eligibility, and whether a currency forward is a spot contract or a MiFID
instrument.

Getting either wrong would be a critical failure under §8, and this is the same discipline
we apply to everything else on the site. Two acceptable routes:

1. A reviewer qualified in UK financial regulation signs those pages, or
2. They are written strictly as a sourced summary of primary material — FCA Handbook, PSR
   2017, FSCS's own publications — with each source named and dated, no interpretation, and
   no advice. This is publishable, but it caps how far the flagship page can go, which is a
   real cost given `/safeguarding-vs-fscs` is our strongest information-gain opportunity.

**The profile states these limits publicly.** Declaring what a review does not cover is a
trust signal for a YMYL audience; implying competence we cannot evidence is the opposite.
