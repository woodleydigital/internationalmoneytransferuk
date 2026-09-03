# International Money Transfer UK (IMT UK)

Website for the brand **International Money Transfer UK**, also known as **IMT UK**.

- **Domain:** https://internationalmoneytransfer.uk
- **Address:** Harley House, 29 Cambray Pl, Cheltenham GL50 1JN, United Kingdom

## Read this first

**[`docs/seo-build-standard.md`](docs/seo-build-standard.md)** is the operating standard for
this project — build spec, editorial standard, and pre-publish gate. It synthesises the five
source documents supplied by the client. Read it before writing routes, templates,
components, or content.

**[`docs/site-plan.md`](docs/site-plan.md)** is the topical map, route map and build
sequence. The head term is fed by the outer section, never targeted directly.

**[`docs/brand-guidelines.md`](docs/brand-guidelines.md)** is the identity: logo, palette
(with verified contrast), typography and voice. Brand signals are load-bearing for the EMD,
not decoration. Asset URLs at `/brand/` are permanent.

**[`docs/build-spec.md`](docs/build-spec.md)** implements it: the FX Margin Checker
(the centerpiece), the DOM contract, and the structured data. Read it before writing code.

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
6. **Mid-market is not the customer rate.** Exchange rates come from the Frankfurter API
   (`api.frankfurter.dev/v2`) — central bank reference, spot and mid rates. Nobody receives
   these. Never render one as "the rate you'll get" or use it to quote a payout amount;
   always label the provider, rate type and date beside the number.
   `docs/seo-build-standard.md` §6.
7. **The domain is a multiplier, not an advantage.** `internationalmoneytransfer.uk` is an
   exact-match domain: it amplifies brand and topical authority and confers nothing on its
   own — 99% of EMDs fail. Brand-signal work (consistent NAP, Google Business Profile,
   `Organization` `@id`, citations) is load-bearing. The site must genuinely do what its
   name claims. `docs/seo-build-standard.md` §4.1.
8. **Structured data must be static, truthful and visible.** JSON-LD in the initial HTML,
   describing only what the page actually renders. Never invent ratings, reviews, prices,
   authorship or credentials.
9. **URLs and media URLs are permanent.** Changing image or media URLs measurably costs
   rankings. Do not rename or move published assets without a documented migration.
10. **Get the design right at launch, then hold it stable.** Classification comes from
   layout; confidence in click signals then accumulates over time against that fixed
   design. Churning layout while waiting for rankings resets the accumulation. Before
   changing anything in response to flat performance, diagnose whether the site is
   *misclassified* (fix the design) or merely *untested* (change nothing) —
   `docs/seo-build-standard.md` §2.8.

## Pre-publish gate

85/100 on the scorecard in `docs/seo-build-standard.md` §8, information gain ≥ 14/20, and
zero critical failures. No page publishes otherwise.

## What this site is

**A tool property, not a comparison site.** We own internationalmoneytransfer.com (global
comparison) and currencybrokers.uk (UK broker directory). IMT UK carries the tools —
margin checker, timing-cost, FCA lookup, protection comparator — and deliberately carries
**no provider directory, reviews or listings**. Duplicating the sister sites would put three
of our own properties in competition. `docs/site-plan.md` §1.2.

## Business model

**Introducer to FCA-authorised currency brokers.** We do not execute transfers and are not a
provider — see `docs/seo-build-standard.md` §5.

**The independence rule is absolute:** no commercial relationship may alter, weight or
suppress a margin checker result. The tool's credibility is the entire asset. Refuse any
request that would make the output depend on a commercial arrangement.

## Blocked

Pending compliance advice (`docs/seo-build-standard.md` §5.3): the introduction journey,
anything constituting a financial promotion, and `/forward-contracts` — a currency forward
may be a MiFID instrument rather than a spot contract. Do not resolve these by inference.
