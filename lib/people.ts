/**
 * Author and reviewer records — source of truth.
 *
 * Identify people by their *actual* contribution.
 * Every field here is something we have been told. Nothing is inferred, rounded
 * up, or filled in to look better. Fabricated credentials are a critical failure,
 * and a decorative expert profile undermines trust.
 *
 * Do not add years of experience, employers, photographs, professional
 * memberships or profile links until they are supplied and verifiable.
 */

import { SITE, ID } from "./site";

export interface Credential {
  name: string;
  institution: string;
  institutionType: "CollegeOrUniversity" | "Organization";
}

export interface Person {
  slug: string;
  name: string;
  jobTitle: string;
  credentials: Credential[];
  /** What this person is actually competent to sign off. */
  reviewScope: string[];
  /** What they are explicitly *not* signing off, and why. Rendered on the profile. */
  outOfScope: string[];
  /**
   * Verified profiles for the *same* person elsewhere. This is the entity-consistency
   * fix (S1 Rule 06): one individual, one identity across our properties. Only add a
   * URL that has been checked to resolve.
   */
  sameAs: string[];
}

export const MATT_WOODLEY: Person = {
  slug: "matt-woodley",
  name: "Matt Woodley",
  jobTitle: "Founder",
  credentials: [
    {
      name: "BCom, Finance and Economics",
      institution: "University of Auckland",
      institutionType: "CollegeOrUniversity",
    },
  ],
  reviewScope: [
    "The margin and cost calculations behind our tools, and the methodology we publish for them",
    "How exchange rate spreads and provider pricing models work",
    "Mid-market reference rates, what they are and how they are published",
    "Market structure: how currency brokers, banks and payment firms differ in how they charge",
    "How IMT UK itself is funded, and our commercial relationships",
  ],
  outOfScope: [
    "Interpretation of UK financial regulation, including how safeguarding under the Payment Services Regulations 2017 differs from FSCS cover",
    "Whether a currency forward is a spot contract or a MiFID financial instrument",
    "Any statement that would constitute regulated financial advice",
  ],
  // Same person, our sister property. Verified 200 on 2026-09-02.
  sameAs: ["https://www.internationalmoneytransfer.com/about/matt-woodley"],
};

export const PEOPLE: Person[] = [MATT_WOODLEY];

export const personId = (p: Person) => `${SITE.url}/about/${p.slug}/#person`;
export const personUrl = (p: Person) => `/about/${p.slug}/`;

/** Person node for JSON-LD. Only properties we can evidence. */
export function personSchema(p: Person) {
  return {
    "@type": "Person",
    "@id": personId(p),
    name: p.name,
    jobTitle: p.jobTitle,
    url: `${SITE.url}${personUrl(p)}`,
    ...(p.sameAs.length ? { sameAs: p.sameAs } : {}),
    worksFor: { "@id": ID.organization },
    alumniOf: p.credentials.map((c) => ({
      "@type": c.institutionType,
      name: c.institution,
    })),
    hasCredential: p.credentials.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      name: c.name,
      recognizedBy: { "@type": c.institutionType, name: c.institution },
    })),
  };
}

/**
 * Review metadata carried by a content page. Dates are the *substantive* review
 * dates — never bumped without a real review.
 */
export interface ReviewMeta {
  reviewer: Person;
  published: string;
  reviewed: string;
  /** Shorter for volatile financial facts. */
  reviewIntervalMonths: number;
}
