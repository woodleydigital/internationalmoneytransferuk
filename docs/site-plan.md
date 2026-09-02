# IMT UK — Site Plan

**Status:** v0.1
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

Standard §5 blocks money-related content pending the business model and FCA status. That
blocks less of this plan than it appears to.

**Not blocked** — factual explanation of a regulatory regime, sourced primarily and reviewed:
safeguarding vs FSCS, how to check the FCA Register, what forward contracts are, AML and
source-of-funds process, the arithmetic of margins. This is most of Phase 1.

**Blocked until §5 resolves:**
- Anything promoting, ranking or recommending a named provider
- Any implication that we can arrange, quote or execute a transfer
- Commercial comparison tables of provider pricing (also blocked on decision #3b — we hold
  no licensed provider data)
- Any statement of our own regulatory status

**Required before Phase 1 publishes** (standard decision #6): a named reviewer with real
financial credentials. Every page in §4.2 makes regulatory or cost claims. Without a
reviewer they fail the gate on trust and on YMYL grounds — this is the binding constraint
on Phase 1, more than the FCA question is.
