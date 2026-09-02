/**
 * FX margin computation.
 *
 * Implements docs/build-spec.md §1.3 and §1.4. Pure functions — no I/O, no
 * formatting, no framework. The provider's figures always arrive from the user;
 * we assert only arithmetic against a dated reference rate (build-spec §1.1).
 */

/** Above this, treat the inputs as mistyped rather than render an absurd figure. */
export const IMPLAUSIBLE_TOTAL_PCT = 25;

export type FeeTreatment = "deducted" | "added";
export type Mode = "payout" | "rate";

export interface MarginInput {
  /** S — what leaves the account, in the send currency. */
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
  /** T / S — the rate the customer actually got, all-in. */
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
 * answer, which is why build-spec §1.2 requires asking rather than assuming.
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
  const fee = isNonNegative(input.fee) ? input.fee : 0;
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

  const midMarketReceive = sendAmount * midRate;
  const shortfall = midMarketReceive - payout;
  const totalCost = shortfall / midRate;
  const totalPct = (shortfall / midMarketReceive) * 100;
  const fxMargin = totalCost - fee;
  const effectiveRate = payout / sendAmount;
  const rateSpreadPct = ((midRate - effectiveRate) / midRate) * 100;

  const result: MarginResult = {
    status: "ok",
    sendAmount,
    midRate,
    receiveAmount: payout,
    midMarketReceive,
    shortfall,
    totalCost,
    totalPct,
    statedFee: fee,
    fxMargin,
    fxMarginPct: (fxMargin / sendAmount) * 100,
    effectiveRate,
    rateSpreadPct,
  };

  // A quote can legitimately beat the daily reference — timing, or a different
  // reference source. Never present this as a profit (build-spec §1.4).
  if (shortfall < 0) {
    return {
      ...result,
      status: "beats-reference",
      note:
        "This quote is better than the reference rate published for that date. That can happen because the reference rate is a once-daily figure and your provider priced at a different moment, or used a different source.",
    };
  }

  if (Math.abs(totalPct) > IMPLAUSIBLE_TOTAL_PCT) {
    return {
      ...result,
      status: "implausible",
      note: "Those figures give an unusually large difference. Please check the amounts and the currencies.",
    };
  }

  return result;
}
