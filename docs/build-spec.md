# IMT UK — Build Specification: Margin Checker, DOM, and Structured Data

**Status:** v0.1
**Last substantive update:** 2026-09-02
**Parent standard:** [`seo-build-standard.md`](seo-build-standard.md) — this document
implements it and never overrides it. Where the two disagree, the standard wins.

This is the layer below the standard: the actual build instructions for the centerpiece
component, the DOM contract, and the structured data.

---

## 1. The FX Margin Checker — the centerpiece

### 1.1 What it does

The user has been quoted a transfer by a bank or provider. The checker tells them the
**total cost of that transfer**, split into the fee they were shown and the exchange rate
margin they were not.

**Why this function and not a rate comparison.** Frankfurter supplies central bank
mid-market rates only — never a customer rate (standard §6.2). A tool that displayed "the
rate you'll get" would be a misleading functional claim and a critical failure. This design
inverts the problem: **the provider's numbers are supplied by the user.** We assert only
arithmetic against a dated, attributed reference rate. That makes the tool honest,
genuinely differentiated, and buildable today with no provider-rate licence and no
dependency on the unresolved FCA question (standard §5).

### 1.2 Inputs

Two modes. Mode B is the default because it matches what providers actually show people.

**Mode A — the rate was quoted**
| Field | Notes |
|---|---|
| Send amount `S` | Send currency, default GBP |
| Send / receive currency | From `/currencies`; default GBP → EUR |
| Quoted rate `R_q` | Target units per 1 send unit |
| Stated fee `F` | Optional, send currency |
| Fee treatment | Deducted before conversion, or charged on top — **ask; do not assume** |

**Mode B — only the payout is known**
| Field | Notes |
|---|---|
| Send amount `S` | What leaves the account, send currency |
| Receive amount `T` | What lands, target currency |
| Stated fee `F` | Optional |

Mode B derives everything from `S` and `T`, which sidesteps the fee-ordering ambiguity
that most calculators get silently wrong.

### 1.3 Computation

Let `R_m` be the mid-market reference rate (target per 1 send unit) from provider `P` on
date `D`.

```
T_mid       = S × R_m                    # payout at mid-market, zero cost
shortfall   = T_mid − T                  # target currency
total_cost  = shortfall / R_m            # send currency
total_pct   = shortfall / T_mid × 100    # ≡ total_cost / S × 100
```

Decomposition, when the stated fee `F` is known:

```
fx_margin     = total_cost − F           # send currency — the part not disclosed
fx_margin_pct = fx_margin / S × 100
```

And when the quoted rate `R_q` is known:

```
rate_spread_pct = (R_m − R_q) / R_m × 100
```

In Mode A, derive `T` first — using the fee treatment the user selected:

```
T = (S − F) × R_q     # fee deducted before conversion
T = S × R_q           # fee charged on top
```

### 1.4 Edge cases — all of these must be handled explicitly

| Case | Behaviour |
|---|---|
| `T > T_mid` (negative cost) | Never say "you profited." State that the quote beats the reference rate for date `D`, and explain why that happens: timing differences, and a different reference source than the provider used. |
| Weekend / bank holiday | Central banks do not publish. Frankfurter returns the last published rate — **display the date actually returned**, never "today." |
| `total_pct` implausible (> ~25%) | Do not render an absurd figure. Prompt the user to check their inputs. |
| Same send and receive currency | Identity rate 1; the tool is meaningless. Say so plainly. |
| Rate or API unavailable (422/503) | Show the last known rate *with its real date*, or degrade to an explanatory message. Never interpolate, never present stale data as current. |
| Fee currency ≠ send currency | Out of scope for v1. Say so rather than converting silently. |

### 1.5 Output and tone — a legal constraint, not a style preference

The result names three numbers: **total cost**, **stated fee**, **exchange rate margin** —
in the send currency and as a percentage of the transfer.

Rules:

- **Report, do not accuse.** A margin is normal and legitimate; providers are entitled to
  charge one. We state the figure and let the user judge. This tool must never read as an
  allegation against a named firm.
- **Do not state "typical" or "average" margins** without a cited, dated source. If we later
  publish our own research on observed spreads, that becomes genuine information gain
  (standard §1 rule 6) — but it must be our data, sourced and dated.
- **Always render the reference rate's provenance adjacent to the result**: provider name,
  rate type, and date. Bank of England (spot rate, GBP pivot) is the natural default for a
  UK site; ECB (reference rate) is the alternative.
- **State the timing caveat once, visibly:** the reference rate is a daily published figure,
  so a quote taken at a different moment will not match exactly.
- **Do not transmit the user's figures anywhere** without saying so. Calculation is local or
  server-side within our own request cycle; no third-party analytics on input values.

### 1.6 Rendering contract — this is where builds usually fail

Per standard §1 rule 1 and §2.2, and the S3 QR-code precedent (centerpiece served without
JS rendering):

1. **The component shell and the current mid-market rate are server-rendered.** The rate
   appears in `view-source:`. No client fetch supplies the centerpiece's numbers.
2. **A worked example is pre-computed and visible in the initial HTML.** This is the part
   that is easy to miss and important: Google extracts roughly 400 characters for the
   centerpiece annotation, and *an empty form has no text to extract*. The default state
   must contain real prose and real numbers.

   Use a clearly-labelled illustration, never a claim about a named provider:

   > *Example: a £50,000 transfer quoted at 1.1200 when the mid-market rate is 1.1500 gives
   > the recipient €56,000 instead of €57,500 — £1,304.35 of exchange rate margin, on top of
   > any stated fee.*

   **Defaults are set for the large-transfer audience** (standard §4.2): default amount
   **£50,000**, default pair **GBP → EUR**. Lead the result with the **absolute cost in
   pounds**, not the percentage — £1,304 is the number that lands; 2.61% is not. Show both.

   This also lands the §4.2.1 point: most currency brokers in this market charge no explicit
   fee, so for them the total cost *is* the margin. The tool resolves a "fee-free" transfer
   into a real figure.

3. **It works without JavaScript.** The form submits as a `GET` to the same route; the
   server renders the result. JavaScript upgrades this to instant recalculation without a
   reload — it does not enable the feature.
4. **Parameterised results must not become a crawl trap** (standard §3, §6.4). When query
   parameters are present: `<meta name="robots" content="noindex,follow">` and a canonical
   pointing to the clean URL. Only the clean URL is in the sitemap.
5. **Reserve the component's dimensions** so a rate refresh cannot shift layout (CLS).
6. **Revalidate the rate daily**, aligned to Frankfurter's ~19h cache TTL. A rate refresh
   must **not** rewrite the page's visible "last updated" date (standard §1 rule 7).

### 1.7 Placement

- **Homepage** carries the checker as its centerpiece. The homepage is the canonical home
  of the tool — do not split it onto a second URL and create two routes with one purpose
  (standard §1 rule 2). The AudioToText precedent (standard §2.8) is a single page.
- **`/how-we-calculate/`** — methodology page: the formulas above, the data source, the
  timing caveat, the limitations. This is standard practice for YMYL, gives the tool a
  citable methodology, and is real information gain.
- **Corridor pages**, once any exist, embed the same component pre-set to that pair
  (standard §2.4, commercialisation). The embedded tool satisfies §3 test 4 only —
  tests 1–3 still require corridor-specific demand, distinctness and data.

---

## 2. DOM architecture

### 2.1 Centerpiece extraction rules

Google derives the centerpiece annotation from the main content container. Boilerplate
interleaved into that flow corrupts the extraction (standard §2.2).

- **Nothing precedes `<main>`** except `<header>` with the site's nav. No floating banners,
  no share widgets, no promo strips, no cookie interstitial in the content flow.
- **No boilerplate between the `<h1>` and the first substantive block.**
- **The tool is first in DOM order** inside `<main>`, above the fold.
- Below-the-fold content is the micro-context: supplementary detail, disclosures, and the
  majority of internal links (standard §2.3).

Naming a container `centerpiece` does not create a centerpiece annotation — position and
extractable text do. Class names below are for styling only; they carry no semantics.

### 2.2 Skeleton

```html
<main id="main">
  <h1>Check the exchange rate margin on your money transfer</h1>

  <section aria-labelledby="checker-heading">
    <h2 id="checker-heading">FX margin checker</h2>

    <p>Enter what you were quoted. We compare it with the mid-market rate published by
       the Bank of England on 2 September 2026 and show the margin built into the rate.</p>

    <form method="get" action="/">
      <!-- server-rendered inputs; no JS required to submit -->
    </form>

    <!-- Server-rendered worked example or result. Real text, real numbers. -->
    <p>Example: a £10,000 transfer quoted at 1.1200 …</p>

    <p><small>Mid-market reference: Bank of England spot rate, GBP/EUR, 2 September 2026.
       Published daily — a quote taken at a different time will not match exactly.</small></p>
  </section>

  <!-- micro-context begins here -->
</main>
```

**H1 rule.** The H1 states the subject and outcome, not the brand. `IMT UK | …` wastes the
most weighted position on a token that is not the query (S1 §6.8). Brand reinforcement
belongs in the header, the logo, and `Organization` schema — the domain already carries it.

**Also required in `<head>`, server-rendered** (standard §1 rules 1–2): title, meta
description, self-referencing canonical, meta robots, and `BreadcrumbList` on any page
below the root.

---

## 3. Query-to-layout matrix

Search intents need distinct page functions, not one template with different words
(standard §2.1). Corridor rows remain **provisional** until they clear the four tests in
standard §3.

| Query type | Intent | Layout | Components | Data dependency |
|---|---|---|---|---|
| GBP exchange rates / margins | Commercial + informational | Hybrid tool | Margin checker, mid-market rate with provenance, rate history chart + verbalised summary | **Ready** — Frankfurter |
| UK → AU / US / EU corridors | Transactional | Directory + comparison | Corridor-preset checker, corridor-specific rules, delivery expectations | **Blocked** on provider data (decision #3b) for any comparison matrix |
| How to transfer large sums | Instructional | Guide | Process steps, compliance and reporting checklist, worked cost example at scale | Ready, subject to named reviewer |
| Is provider X safe? | Verification | Trust | FCA Financial Services Register lookup, permissions and safeguarding status | **Needs sourcing** — FCA Register is public; confirm terms of use before building |

Two rows carry warnings carried over from the review of the source blueprint:

- **No "high-street bank markup grid"** until we hold licensed provider data. Asserting what
  a named bank charges without a verified source is an unsupported financial claim about a
  third party, with comparative-advertising exposure on top of the SEO risk.
- **No "verified user sentiment" module.** A new site has no users. Unattributed or
  synthesised reviews are a critical failure (standard §8), and third-party reviews cannot
  be marked up as our `AggregateRating`.

An FCA Register lookup, by contrast, is high-value and legitimately sourceable — it is
public data — but safeguarding and permissions are precise regulatory concepts, and stating
them wrongly about a named firm is serious. It needs a source-of-truth record and review
before it ships.

---

## 4. Structured data

JSON-LD only, server-rendered in `<head>` (standard §1 rule 4). **No microdata** — do not
duplicate the same entity in both syntaxes.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://internationalmoneytransfer.uk/#organization",
      "name": "International Money Transfer UK",
      "alternateName": "IMT UK",
      "url": "https://internationalmoneytransfer.uk",
      "logo": "https://internationalmoneytransfer.uk/assets/imt-uk-logo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Harley House, 29 Cambray Pl",
        "addressLocality": "Cheltenham",
        "addressRegion": "Gloucestershire",
        "postalCode": "GL50 1JN",
        "addressCountry": "GB"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://internationalmoneytransfer.uk/#website",
      "url": "https://internationalmoneytransfer.uk",
      "name": "International Money Transfer UK",
      "publisher": { "@id": "https://internationalmoneytransfer.uk/#organization" }
    },
    {
      "@type": "WebApplication",
      "@id": "https://internationalmoneytransfer.uk/#margin-checker",
      "name": "FX Margin Checker",
      "applicationCategory": "FinanceApplication",
      "description": "Compares a quoted money transfer against the mid-market reference rate and shows the exchange rate margin applied.",
      "isAccessibleForFree": true,
      "publisher": { "@id": "https://internationalmoneytransfer.uk/#organization" }
    }
  ]
}
```

### Why not `FinancialProduct`

`schema.org/FinancialProduct` describes *a product provided to consumers by a financial
institution*. Declaring it with `provider: IMT UK` is a machine-readable assertion that we
provide financial products — untrue of a calculator, and published while FCA status is
unresolved and blocked (standard §5). `WebApplication` is what the tool actually is, and
costs nothing in discoverability.

### Entity-record rules

- `legalName` is **omitted until the registered company name is confirmed** (standard §4).
  It means the registered entity name; the brand name is `alternateName`.
- `name` carries the **full** name, not "IMT UK". Our brand is a generic phrase, so the
  schema is doing brand-identity disambiguation work (standard §4.1) — the fuller string
  is the one that resolves.
- The `@id` values are permanent. Every page reuses them by reference.
- Add nothing that is not visible on the page. No ratings, no reviews, no credentials, no
  prices.

---

## 5. Stack and implementation rules

- **Next.js (App Router) on Vercel**, static generation with daily revalidation for
  rate-bearing routes.
- **Tailwind CSS.** Cards are fine for legibility; the semantics come from headings and
  landmarks, not from class names.
- **Server-render first, hydrate second.** Client state handles recalculation *after* first
  paint. It never supplies the initial numbers or the component shell.
- **Keep the bundle small.** Standard §7: lean HTML, small DOM, minimal third-party script.
  Retrieval cost is a ranking input (standard §2.7).
- **Do not build for the signal.** "Generates positive interaction signals" is not a design
  goal — click data accrues because the tool is genuinely useful (standard §2.8).
  Engineering the metric directly is how dark patterns get built.
- **Hold the design stable after launch** (standard §2.8). Get the centerpiece right now;
  there is no cheap second attempt.

---

## 6. Carried-forward open questions

| # | Question | Status |
|---|---|---|
| A | ~~Corridor focus~~ | **Resolved: large-value transfers, £10,000+, archetype £50k–£500k. See standard §4.2.** |
| B | Licensed provider fee/rate data (standard decision #3b) | Open — blocks any true comparison matrix |
| C | Business model and FCA status (standard §5) | Blocked |
| D | Named reviewer with real financial credentials (standard decision #6) | Open — required before YMYL content |
| E | FCA Register terms of use for the lookup component | Open |
