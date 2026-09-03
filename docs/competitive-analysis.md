# Portfolio and competitive analysis

**Reviewed:** 2026-09-02. Live fetch plus raw-HTML inspection.

| Site | Ownership |
|---|---|
| **internationalmoneytransfer.com** | **Ours** — confirmed |
| **currencybrokers.uk** | **Ours** — implied by GSC access; confirm |
| topmoneycompare.co.uk | Third party — the only true competitor of the three |

Two of the three are our own properties, so most of what follows is portfolio analysis, not
competitive analysis. That is a more useful position to be in and a more dangerous one: the
overlap risk is now internal.

---

## 0. The portfolio problem — now the most important open question

**Confirmed: internationalmoneytransfer.com is ours.** GSC access to currencybrokers.uk
implies that is ours too. We are therefore building a **third** site into a niche where we
already hold two — and the overlaps are severe.

### 0.1 Two specific collisions

**Brand collision.** `internationalmoneytransfer.com` and `internationalmoneytransfer.uk`
are the same brand name on two TLDs. S5 makes brand-identity resolution the thing an EMD
lives or dies by, and two sites presenting the same brand name is the worst case for it.
This is workable only if they are explicitly one brand serving two markets — shared
`Organization` identity, `sameAs`, hreflang, cross-linked — and unworkable if they present
as independent brands competing for the same queries.

**Positioning collision.** currencybrokers.uk already occupies what we chose in §4.2. Its
H1 is *"Compare the Best Currency Brokers in the UK"*, it segments margin by transfer size
including £100k+, and its guides cover forward contracts, hedging and large transfers. That
is the large-value broker-introduction position, already built and already ranking.

**Until the relationship is decided, Phase 1 should not publish.** Building a third site
that competes with our own two for the same query network splits signal three ways and is
the most expensive mistake available here.

### 0.2 The identity question, still open

That site carries **"Matt Woodley, Founder & Editor — University of Auckland, Finance,
Economics"**, with the bio *"I started InternationalMoneyTransfer.com in 2016 after losing
thousands to hidden bank fees on my own transfers."*

Our reviewer was given as **Matt Boyd, Founder, BCom Finance & Economics, University of
Auckland**. Same role, same institution, same discipline, different surname — and the
project owner's address is `matthew@woodley.digital`.

**Still to confirm.**

1. **Is this the same person?** If so, `lib/people.ts` currently records a name that
   conflicts with the one already published in this niche. Entity consistency is a build
   rule (S1 Rule 06) and the EMD depends on the brand entity resolving cleanly (§4.1); the
   same individual appearing under two surnames across two money-transfer sites undermines
   exactly the signal we are trying to build. If they are different people, no issue — but
   it needs saying explicitly.
2. See §0.1 for the domain relationship, which is now the larger question.

**Our centerpiece already exists there.** Under the H2 *"Check your quote for hidden fees"*:
*"Enter what your bank or broker quoted you. We'll compare it to the real mid-market rate to
reveal any hidden markup."* That is the FX Margin Checker. What differs is placement — see
§3.1, which is the whole argument.

One inconsistency worth fixing there regardless: the footer says **"Est. 2023 / Trusted
Since 2023"** while the founder bio says the site started in **2016**.

---

## 1. Scorecard

| | currencybrokers.uk | internationalmoneytransfer.com | topmoneycompare.co.uk |
|---|---|---|---|
| Words (home) | 5,618 | 6,208 | **1,693** |
| H2 sections | 21 | 20 | 8 |
| JSON-LD blocks | 4 | 5 | 1 (FAQPage only) |
| H1 | "Compare the Best Currency Brokers in the UK" | "Compare international money transfer rates" | **"International Money Transfer Comparison V3.0"** |
| Centerpiece | Live rates + calculator | Hero claim, then calculator | Comparison calculator |
| Methodology page | In main nav | In main nav | No |
| Compensation disclosure | Explicit + Code of Ethics + TPI Code | Explicit + "How We Get Paid" | **None visible** |
| FCA numbers shown | Per broker | Per provider | No |
| **FSCS mentioned** | **0** | **0** | **0** |

topmoneycompare is the weakest on every axis, and its H1 contains a **version number**.

---

## 2. What they do well — worth taking

1. **Margin expectations segmented by transfer size.** currencybrokers.uk publishes typical
   margin bands for £1k–£5k separately from £100k+. That segmentation is exactly our
   positioning, and it is the single most useful thing on any of the three. We cannot copy
   the figures — we hold no licensed pricing (decision #3b) — but it is a strong argument
   for producing our own observed-spread research, which would be genuine information gain.
2. **Methodology in the primary navigation**, on both serious sites. Validates
   `/how-we-calculate` and argues for promoting it out of the header's right-hand corner.
3. **Glossary with `DefinedTermSet` schema** (internationalmoneytransfer.com). Cheap, real
   topical coverage that maps directly onto our entity-attribute matrix (site-plan §2.1).
   Worth adding.
4. **FCA numbers displayed per provider.** Validates the FCA Register lookup component.
5. **An explicit "How We Get Paid" page** on both serious sites. Validates
   `/how-we-make-money` as a Phase 1 requirement rather than a footer link.
6. **Historical rate charts.** Validates the timing-cost tool — though ours goes further by
   pricing a slipped completion date rather than just plotting a line.
   *Note:* items 1, 4 and 5 are comparison-site features. Under the tool positioning
   (site-plan §1.2) they belong on the sister properties, not here. What transfers to IMT UK
   is the glossary, the methodology placement, and the disclosure page.
7. **Three-layer rate presentation** — mid-market, typical bank, typical broker. Good
   pedagogy, and it is how we already frame the checker's output.

---

## 3. Where we can beat them

### 3.1 Placement of the checker

internationalmoneytransfer.com puts the quote checker under an H2 partway down the page,
beneath a hero reading *"Save up to 90% vs banks"* and a featured provider card. Ours is the
H1 plus the first block in `<main>`.

Per S2 that difference is not cosmetic — the centerpiece annotation is extracted from the
primary content block, and the S2 case study's largest single win across nineteen changes
was moving a calculator from the bottom of a page to the top. **The same tool, placed
differently, is a different page to a classifier.**

### 3.2 Nobody explains that safeguarding is not FSCS

Across all three sites, **"FSCS" appears zero times.** "Safeguarding" appears four times,
once, and never; "ombudsman" once across all three.

This is the clearest validation in the analysis. Someone moving £300,000 through an
authorised payment institution is not FSCS-covered, and the entire competitive set is silent
on it. `/safeguarding-vs-fscs` remains our strongest information-gain opportunity, and it is
unserved rather than merely under-served.

### 3.3 Claims we will not make

All three lead on unsourced superlatives — *"Save up to 90%"*, *"£1,847 average customer
savings"*, *"Trusted by 50,000+ customers"*, *"hands-on testing with real transfers"*.

Our gate forbids these without evidence (§8, and S1 §6.7 on unsupported superlatives). That
is a constraint, but for an audience moving six figures it is also a differentiator:
scepticism is the default posture of someone about to wire £250,000, and a site that refuses
to overclaim reads differently from one promising 90%.

### 3.4 Schema we will not copy

Two live risks on currencybrokers.uk, both of which we have already avoided:

- It types itself `["LocalBusiness","FinancialService"]`. It is not a financial service —
  the same error corrected in build-spec §4.
- It emits `AggregateRating` nodes for third-party brokers it merely `mentions`, including
  `ratingValue: 5, reviewCount: 70000`. Review markup is meant to describe the entity the
  page is about, with the reviews genuinely present. This is the sort of thing that attracts
  a manual action, and inventing ratings is a critical failure under §8.

### 3.5 Positioning

All three serve remittance and large transfers together. None is built solely for the
£50k–£500k audience, and their copy shows it — "send money to India" sits beside "buying
property in Spain". Our §4.2 positioning is genuinely unoccupied.

---

## 4. Actions

| # | Action | Where |
|---|---|---|
| 1 | **Decide the three-domain relationship** (§0.1) — one brand two markets, or distinct positions | **Blocks Phase 1** |
| 1b | Confirm the Matt Woodley / Matt Boyd identity question (§0.2) | Blocks reviewer records |
| 1c | Ingest GSC query and page data for both owned sites — replaces assumed demand with real (§5) | Blocks route selection |
| 2 | Add a glossary with `DefinedTermSet` schema, built from the entity-attribute matrix | Phase 2 |
| 3 | Promote methodology into primary navigation | Now |
| 4 | Keep `/safeguarding-vs-fscs` as the flagship — confirmed unserved | Phase 1 |
| 5 | Plan first-party observed-spread research to replace unsourceable margin bands | Phase 3 |
| 6 | ~~Homepage needs more words~~ — **withdrawn.** That benchmark came from comparison sites. IMT UK is a tool property (site-plan §1.2), and S3 attributes part of its single-page case study's advantage to *fewer* words on the page. Add sections only where they carry a function or real evidence | — |


---

## 5. GSC data — what to export and what it settles

Offered for both owned sites. This replaces the weakest part of the site plan: every demand
judgement in §4 is currently an assumption.

**Export from Search Console, last 12 months, CSV:**

1. **Queries** — clicks, impressions, CTR, position. Both sites.
2. **Pages** — same metrics, so we can see which *page types* actually earn clicks. This
   settles empirically whether corridor pages work for us, which §4.4 currently defers on.
3. **Queries filtered to contain "international money transfer"** — what the .com already
   owns on the head term. Directly answers the cannibalisation question in §0.1.
4. **Countries** — the UK share of .com traffic, which tells us how much of the .uk's target
   market the .com already serves.
5. **Crawl stats**, if available — S3's crawl-versus-clicks comparison shows where crawl
   budget is being spent on URLs that earn nothing.

**What it changes:**

- The **value-weighted demand threshold** (§4.2.2) becomes measurable rather than asserted.
- **Query templates** (§3) can be validated against templates already earning clicks, rather
  than proposed from first principles.
- **Route selection** for Phase 1 can be evidenced.
- Any query the .com already ranks well for becomes a **cannibalisation candidate**, not an
  opportunity.

**Caveat worth knowing:** S3 notes Search Console loses roughly 40% of query-level click and
impression data to k-anonymisation. If a BigQuery bulk export exists for either property, it
is materially better than the UI export.
