# International Money Transfer UK (IMT UK)

Website for the brand **International Money Transfer UK**, also known as **IMT UK**.

- **Domain:** https://internationalmoneytransfer.uk
- **Address:** Harley House, 29 Cambray Pl, Cheltenham GL50 1JN, United Kingdom

## Read this first

**[`docs/seo-build-standard.md`](docs/seo-build-standard.md)** is the operating standard for
this project — build spec, editorial standard, and pre-publish gate. It synthesises four
source documents supplied by the client. Read it before writing routes, templates,
components, or content.

## Non-negotiables

1. **Server-render or statically generate every indexable route.** Title, canonical, meta
   robots, H1, body copy, primary image, JSON-LD and internal `<a href>` links must be in
   the raw HTML response. JavaScript enhances; it never supplies the only copy.
2. **The functional component is the centerpiece.** The comparison/quote/calculator sits
   above the fold, first in DOM order after the H1, and renders without JavaScript. No
   boilerplate DOM between the H1 and the first substantive content block.
3. **Build real functions, never implied ones.** "Misleading functionality" is a Google spam
   policy. If the page suggests it can compare, calculate or quote, it must actually do so.
4. **Every page must earn its existence.** Before creating a templated page, clear all four
   tests in `docs/seo-build-standard.md` §3. Corridor/country pages that differ only by a
   swapped noun are a critical failure, not a strategy.
5. **Financial claims are YMYL.** No rate, fee, delivery time, or regulatory statement ships
   without a verified first-party source and a named reviewer. Never invent one.
6. **Structured data must be static, truthful and visible.** JSON-LD in the initial HTML,
   describing only what the page actually renders. Never invent ratings, reviews, prices,
   authorship or credentials.
7. **URLs and media URLs are permanent.** Changing image or media URLs measurably costs
   rankings. Do not rename or move published assets without a documented migration.
8. **Get the design right at launch, then hold it stable.** Classification comes from
   layout; confidence in click signals then accumulates over time against that fixed
   design. Churning layout while waiting for rankings resets the accumulation. Before
   changing anything in response to flat performance, diagnose whether the site is
   *misclassified* (fix the design) or merely *untested* (change nothing) —
   `docs/seo-build-standard.md` §2.8.

## Pre-publish gate

85/100 on the scorecard in `docs/seo-build-standard.md` §7, information gain ≥ 14/20, and
zero critical failures. No page publishes otherwise.

## Blocked

The business model (comparison/introducer vs. FCA-authorised provider) and FCA status are
unresolved — see `docs/seo-build-standard.md` §5 and §8. Do not draft money-related content
until these are settled.
