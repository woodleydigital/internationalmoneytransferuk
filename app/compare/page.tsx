import type { Metadata } from "next";
import Link from "next/link";
import { computeMargin, type FeeTreatment, type MarginResult } from "@/lib/margin";
import { getMidRate, CORRIDOR_CURRENCIES, isSupportedCurrency } from "@/lib/rates";
import { money, percent, rate as fmtRate, longDate, ID } from "@/lib/site";
import { PageFrame, Term } from "@/components/Page";
import { abs, LANG, rateDatasetNode } from "@/lib/schema";
import { getRateTable } from "@/lib/rate-table";
import { RateTableBlock } from "@/components/Rates";

const TITLE = "Compare the cost of an international money transfer";
const DESCRIPTION =
  "Enter what a provider quoted you and see the total cost of the transfer against the mid-market reference rate, split into the stated fee and an estimated exchange rate difference.";

/** The calculator itself, as the page's main entity. */
const checkerSchema = {
  "@type": "WebApplication",
  "@id": ID.marginChecker,
  name: "FX Margin Checker",
  url: abs("/compare/"),
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires a web browser.",
  description:
    "Compares a quoted international transfer against the mid-market reference rate and estimates the exchange rate difference, with stated fees included in total spend.",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  inLanguage: LANG,
  publisher: { "@id": ID.organization },
};

type SearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_SEND = 50_000;
const DEFAULT_BASE = "GBP";
const DEFAULT_QUOTE = "EUR";

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const num = (v: string | string[] | undefined): number | undefined => {
  const s = one(v);
  if (!s) return undefined;
  const n = Number(s.replace(/[,\s£$€]/g, ""));
  return Number.isFinite(n) ? n : undefined;
};

const ccy = (v: string | string[] | undefined, fallback: string): string => {
  const s = one(v)?.toUpperCase();
  return s && isSupportedCurrency(s) ? s : fallback;
};

/**
 * Parameterised results are noindex with a canonical to the clean URL, so the
 * tool cannot become a crawl trap.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasQuery = Object.keys(params).length > 0;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/compare/" },
    robots: hasQuery ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const base = ccy(params.from, DEFAULT_BASE);
  const quote = ccy(params.to, DEFAULT_QUOTE);
  const sendAmount = num(params.send) ?? DEFAULT_SEND;
  const receiveAmount = num(params.receive);
  const quotedRate = num(params.rate);
  const fee = num(params.fee) ?? 0;
  const feeTreatment: FeeTreatment = one(params.feeTreatment) === "added" ? "added" : "deducted";
  const submitted = receiveAmount !== undefined || quotedRate !== undefined;

  const mid = await getMidRate(base, quote);

  const result: MarginResult | null =
    mid && submitted
      ? computeMargin({
          sendAmount,
          midRate: mid.rate,
          receiveAmount,
          quotedRate,
          fee,
          feeTreatment,
          sameCurrency: base === quote,
        })
      : null;

  const table = await getRateTable();

  return (
    <PageFrame
      trail={[{ name: "Compare" }]}
      title={<>{TITLE}</>}
      schema={{
        path: "/compare/",
        name: TITLE,
        description: DESCRIPTION,
        mainEntity: { "@id": ID.marginChecker },
        nodes: [checkerSchema, ...(table ? [rateDatasetNode(table, "/compare/")] : [])],
      }}
    >
      <p className="mt-6 border-l-4 border-brand-600 bg-brand-50 p-4">
        {"Looking to compare the providers themselves? "}
        <Link href="/compare/providers/" className="font-semibold">
          Compare money transfer providers side by side
        </Link>
        .
      </p>

      <section aria-labelledby="checker" className="mt-6">
        <h2 id="checker" className="sr-only">
          FX margin checker
        </h2>

        <p className="max-w-prose text-base">
          Enter what you were quoted. This estimates the total cost against a dated{" "}
          <Term slug="mid-market-rate">mid-market reference rate</Term>, separating any stated
          fee from the <Term slug="exchange-rate-margin">exchange rate difference</Term>.
          The daily benchmark can differ from the rate at the moment of your quote.
        </p>

        {mid ? (
          <p className="mt-3 text-sm">
            {`Mid-market reference for ${base}/${quote} is `}
            <strong className="text-ink">{fmtRate(mid.rate)}</strong>
            {`, published ${longDate(mid.date)}${
              mid.providerCount ? `, blended from ${mid.providerCount} central bank sources` : ""
            }.`}
          </p>
        ) : (
          <p className="mt-3 text-sm">
            The reference rate is unavailable right now, so this transfer cannot be checked. We
            do not show an estimated rate in its place.
          </p>
        )}

        <form method="get" action="/compare/" className="mt-6 rounded-lg border border-line bg-wash p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Transfer amount" name="send" defaultValue={String(sendAmount)} inputMode="decimal" hint="Include a fee deducted from this amount. Exclude a fee charged on top; the checker adds it to total spend." />
            <Select label="From" name="from" value={base} />
            <Select label="To" name="to" value={quote} />
            <Field
              label={`Recipient receives (${quote})`}
              name="receive"
              defaultValue={receiveAmount !== undefined ? String(receiveAmount) : ""}
              inputMode="decimal"
              hint="If you know the payout, enter it here."
            />
            <Field
              label="Or the rate you were quoted"
              name="rate"
              defaultValue={quotedRate !== undefined ? String(quotedRate) : ""}
              inputMode="decimal"
              hint={`${quote} per 1 ${base}`}
            />
            <Field
              label={`Stated fee (${base})`}
              name="fee"
              defaultValue={fee ? String(fee) : ""}
              inputMode="decimal"
              hint="Leave blank if you were not charged one."
            />
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-ink">
              If there was a fee, was it
            </legend>
            <label className="mr-4 text-sm">
              <input type="radio" name="feeTreatment" value="deducted" defaultChecked={feeTreatment === "deducted"} />{" "}
              taken off before conversion
            </label>
            <label className="text-sm">
              <input type="radio" name="feeTreatment" value="added" defaultChecked={feeTreatment === "added"} />{" "}
              charged on top
            </label>
          </fieldset>

          <button
            type="submit"
            className="mt-5 rounded-md bg-brand-700 px-5 py-2.5 font-medium text-white"
          >
            Check the margin
          </button>
        </form>

        <div className="result-slot mt-6">
          {result ? (
            <Result result={result} base={base} quote={quote} />
          ) : (
            <WorkedExample />
          )}
        </div>

        {mid && (
          <p className="mt-4 text-sm">
            The reference rate is published once a day, so a quote taken at a different moment
            will not match it exactly.{" "}
            <Link href="/how-we-calculate/" className="underline">
              How we calculate this
            </Link>
            .
          </p>
        )}
      </section>

      <RateTableBlock table={table} />

      <section aria-labelledby="why" className="mt-14 border-t border-line pt-8">
        <h2 id="why" className="text-xl font-semibold text-ink">
          Compare the fee and the exchange rate together
        </h2>
        <p className="mt-3 max-w-prose">
          {`A zero transfer fee does not tell you whether an exchange rate margin applies. ` +
            `Some providers use a mid-market rate with a separate fee; others include a margin ` +
            `in the rate. For illustration, a 1.5% rate difference on a ${money(250_000, "GBP")} ` +
            `transfer represents ${money(3_750, "GBP")}. Compare the total you pay and the ` +
            `amount your recipient receives for the same route and payout method.`}
        </p>
        <p className="mt-3 max-w-prose">
          This tool does not quote you a rate. It takes the numbers a provider gave you and
          reports what they cost against a published reference, so two quotes can be compared
          on the same basis.
        </p>
      </section>

    </PageFrame>
  );
}

function WorkedExample() {
  // Pre-computed and present in the initial HTML so the tool carries real text
  // before anyone submits it. Illustrative figures only — never a claim about a
  // named provider.
  return (
    <div className="rounded-lg border border-line p-5">
      <h3 className="font-semibold text-ink">
        {`Example: a ${money(50_000, "GBP")} transfer to euros`}
      </h3>
      <p className="mt-2 max-w-prose">
        {`A ${money(50_000, "GBP")} transfer quoted at a rate of 1.1200, when the mid-market ` +
          `rate is 1.1500, gives the recipient ${money(56_000, "EUR")} instead of ` +
          `${money(57_500, "EUR")}. That difference is ${money(1_304.35, "GBP")} of exchange ` +
          `rate difference, with no separately stated fee — ${percent(2.61)} of the ` +
          `amount transferred.`}
      </p>
      <p className="mt-2 text-sm">
        These are illustrative figures chosen to show the arithmetic, not the rates of any
        particular provider.
      </p>
    </div>
  );
}

function Result({
  result,
  base,
  quote,
}: {
  result: MarginResult;
  base: string;
  quote: string;
}) {
  if (result.status !== "ok" && result.status !== "beats-reference") {
    return (
      <div className="rounded-lg border border-line p-5">
        <p>{result.note}</p>
      </div>
    );
  }

  const beats = result.status === "beats-reference";

  return (
    <div className="rounded-lg border border-line p-5">
      {beats && <p className="mb-4 max-w-prose text-sm">{result.note}</p>}
          <h3 className="text-4xl font-bold tracking-tight text-ink">
            {money(result.totalCost, base)}
          </h3>
          <p className="mt-1">
            {`is the ${result.totalCost < 0 ? "difference" : "estimated total cost"} against the daily reference — ${percent(result.totalPct)} of your total spend.`}
          </p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat label="Stated fee" value={money(result.statedFee, base)} />
            <Stat
              label="Estimated exchange rate difference"
              value={money(result.fxMargin, base)}
              accent
              note={
                result.statedFee === 0
                  ? "No fee was stated; this is the difference against the daily reference."
                  : "Difference after separating the stated fee; timing can affect it."
              }
            />
            <Stat label="All-in effective rate" value={fmtRate(result.effectiveRate)} />
            <Stat label="Total customer spend" value={money(result.totalSpend, base)} />
            <Stat label="Mid-market reference" value={fmtRate(result.midRate)} />
          </dl>

          <p className="mt-4 max-w-prose text-sm">
            {`At the mid-market rate your recipient would have received ` +
              `${money(result.midMarketReceive, quote)} rather than ` +
              `${money(result.receiveAmount, quote)}, a difference of ` +
              `${money(result.shortfall, quote)}.`}
          </p>
      <p className="mt-4 text-sm">
        This is an estimate against a daily reference, not a measurement of the provider’s
        exact margin. Quote timing, rate sources and charges not included in your inputs can
        affect the result.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="text-sm">{label}</dt>
      <dd className={accent ? "font-semibold text-accent-700" : "font-semibold text-ink"}>
        {value}
      </dd>
      {note && <p className="text-xs text-muted">{note}</p>}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  hint,
  inputMode,
}: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
  inputMode?: "decimal";
}) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        inputMode={inputMode}
        autoComplete="off"
        className="mt-1 w-full rounded-md border border-line-strong bg-white px-3 py-2"
      />
      {hint && <p className="mt-1 text-xs">{hint}</p>}
    </div>
  );
}

function Select({ label, name, value }: { label: string; name: string; value: string }) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={value}
        className="mt-1 w-full rounded-md border border-line-strong bg-white px-3 py-2"
      >
        {CORRIDOR_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} — {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export const revalidate = 21_600;
