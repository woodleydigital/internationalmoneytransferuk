/**
 * Entity source of truth.
 *
 * Every visible mention and every JSON-LD node reads from here. Nothing on the
 * site may state these facts differently.
 *
 * legalName and company fields are deliberately absent: they are unconfirmed,
 * and inventing them would be a critical failure.
 */

export const SITE = {
  name: "International Money Transfer UK",
  /** Short brand used in page titles and copy everywhere except the homepage title. */
  alternateName: "IMTUK",
  url: "https://internationalmoneytransfer.uk",
  address: {
    streetAddress: "Harley House, 29 Cambray Pl",
    addressLocality: "Cheltenham",
    addressRegion: "Gloucestershire",
    postalCode: "GL50 1JN",
    addressCountry: "GB",
  },
} as const;

/**
 * Individuals' names from public registers are shown only once the privacy
 * notice names the legal entity, a contact email and the ICO registration.
 */
export const PRIVACY_NOTICE_COMPLETE = false;

export const ID = {
  organization: `${SITE.url}/#organization`,
  website: `${SITE.url}/#website`,
  marginChecker: `${SITE.url}/compare/#margin-checker`,
} as const;

/** Formatting helpers — kept with the entity record so money renders consistently. */
export function money(amount: number, currency: string): string {
  // Whole amounts read better without ".00" in prose; part-amounts keep both
  // decimals because they are money.
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function percent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function rate(value: number): string {
  return value.toFixed(4);
}

export function longDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
