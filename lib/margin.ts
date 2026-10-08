/**
 * FX margin computation.
 *
 * Pure functions — no I/O, no
 * formatting, no framework. The provider's figures always arrive from the user;
 * we assert only arithmetic against a dated reference rate.
 */

/** Above this, treat the inputs as mistyped rather than render an absurd figure. */
export const IMPLAUSIBLE_TOTAL_PCT = 25;

export type FeeTreatment = "deducted" | "added";
export type Mode = "payout" | "rate";

export interface MarginInput {
  /** S — transfer amount before an added fee, or including a deducted fee. */
  sendAmount: number;
  /** R_m — mid-market reference, target units per 1 send unit. */
  midRate: number;
  /** T — what the recipient receives. Mode "payout". */
  receiveAmount?: number;
  /** R_q — the rate the provider quoted. Mode "rate". */
  quotedRate?: number;
  /** F — the fee the provider stated, in the send currency. */
  fee?: number;
  /** Whether F comes off before conversion or is charged on top. Never assumed. */
  feeTreatment?: FeeTreatment;
  /** Set when both currencies are the same, so we can say so plainly. */
  sameCurrency?: boolean;
}

export type MarginStatus =
  | "ok"
  | "beats-reference"
  | "implausible"
  | "identity"
  | "invalid";

export interface MarginResult {
  status: MarginStatus;
  /** Present for every non-"ok" status; explains what to tell the user. */
  note?: string;
  sendAmount: number;
  /** Transfer amount plus a fee charged on top; the customer's total outlay. */
  totalSpend: number;
  midRate: number;
  /** T — supplied in payout mode, derived in rate mode. */
  receiveAmount: number;
  /** T_mid — what mid-market with zero cost would deliver. */
  midMarketReceive: number;
  /** T_mid − T, in the target currency. */
  shortfall: number;
  /** Total cost of the transfer, in the send currency. */
  totalCost: number;
  totalPct: number;
  statedFee: number;
  /** The part of the cost that was not disclosed as a fee. */
  fxMargin: number;
  fxMarginPct: number;
  /** Payout divided by total customer spend — the all-in effective rate. */
  effectiveRate: number;
  /** Only meaningful when a rate was quoted; otherwise derived from effectiveRate. */
  rateSpreadPct: number;
}

const isPositive = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n > 0;

const isNonNegative = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n >= 0;

function empty(status: MarginStatus, note: string): MarginResult {
  return {
    status,
    note,
    sendAmount: 0,
    totalSpend: 0,
    midRate: 0,
    receiveAmount: 0,
    midMarketReceive: 0,
    shortfall: 0,
    totalCost: 0,
    totalPct: 0,
    statedFee: 0,
    fxMargin: 0,
    fxMarginPct: 0,
    effectiveRate: 0,
    rateSpreadPct: 0,
  };
}

/**
 * Derive the payout in "rate" mode. The fee treatment genuinely changes the
 * answer, which is why we ask rather than assuming.
 */
export function derivePayout(
  sendAmount: number,
  quotedRate: number,
  fee: number,
  treatment: FeeTreatment,
): number {
  return treatment === "deducted"
    ? (sendAmount - fee) * quotedRate
    : sendAmount * quotedRate;
}

export function computeMargin(input: MarginInput): MarginResult {
  const { sendAmount, midRate, quotedRate, receiveAmount } = input;
  if (input.fee !== undefined && !isNonNegative(input.fee)) {
    return empty("invalid", "Enter a fee of zero or more.");
  }
  const fee = input.fee ?? 0;
  const feeTreatment: FeeTreatment = input.feeTreatment ?? "deducted";

  if (input.sameCurrency) {
    return empty(
      "identity",
      "The send and receive currencies are the same, so there is no exchange rate to compare against.",
    );
  }
  if (!isPositive(sendAmount) || !isPositive(midRate)) {
    return empty("invalid", "Enter a transfer amount to compare.");
  }
  if (fee >= sendAmount) {
    return empty("invalid", "The stated fee cannot be larger than the transfer itself.");
  }

  let payout: number;
  if (isPositive(receiveAmount)) {
    payout = receiveAmount;
  } else if (isPositive(quotedRate)) {
    payout = derivePayout(sendAmount, quotedRate, fee, feeTreatment);
  } else {
    return empty(
      "invalid",
      "Enter either the amount your recipient receives or the exchange rate you were quoted.",
    );
  }

  const totalSpend = sendAmount + (feeTreatment === "added" ? fee : 0);
  const midMarketReceive = totalSpend * midRate;
  const shortfall = midMarketReceive - payout;
  const totalCost = shortfall / midRate;
  const totalPct = (shortfall / midMarketReceive) * 100;
  const fxMargin = totalCost - fee;
  const effectiveRate = payout / totalSpend;
  const rateSpreadPct = ((midRate - effectiveRate) / midRate) * 100;

  const result: MarginResult = {
    status: "ok",
    sendAmount,
    totalSpend,
    midRate,
    receiveAmount: payout,
    midMarketReceive,
    shortfall,
    totalCost,
    totalPct,
    statedFee: fee,
    fxMargin,
    fxMarginPct: (fxMargin / totalSpend) * 100,
    effectiveRate,
    rateSpreadPct,
  };

  if (Math.abs(totalPct) > IMPLAUSIBLE_TOTAL_PCT) {
    return {
      ...result,
      status: "implausible",
      note: "Those figures give an unusually large difference. Please check the amounts and the currencies.",
    };
  }

  // A quoted conversion rate can beat the daily reference even if fees make
  // the total cost positive. Never label a negative estimated margin as profit.
  if (fxMargin < -1e-8) {
    return {
      ...result,
      status: "beats-reference",
      note:
        "The exchange-rate portion of this quote is better than the reference rate published for that date. That can happen because the reference rate is a once-daily figure and your provider priced at a different moment, or used a different source. Any stated fee still contributes to your total spend.",
    };
  }

  return result;
}
