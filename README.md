# International Money Transfer UK (IMT UK)

Next.js site for **internationalmoneytransfer.uk**. The centerpiece is the **FX Margin
Checker**: enter what a provider quoted you on a large transfer and it reports the total
cost, split into the stated fee and the margin built into the exchange rate.

Read [`docs/seo-build-standard.md`](docs/seo-build-standard.md) and
[`docs/build-spec.md`](docs/build-spec.md) before changing routes, templates or copy.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # margin computation
npm run typecheck
npm run build
```

## Design constraints that are not negotiable

- **The margin checker renders and works without JavaScript.** It is a plain `GET` form;
  the server computes and renders the result. There is no client component.
- **Rates are mid-market central bank references, never consumer rates.** Nothing may
  present one as a rate a user would be given (build standard §6.2).
- **The centerpiece carries real text in the initial HTML** — a pre-computed worked
  example, because an empty form gives the centerpiece annotation nothing to extract.
- **Parameterised results are `noindex, follow`** with a canonical to `/`, so the tool
  cannot become a crawl trap.
