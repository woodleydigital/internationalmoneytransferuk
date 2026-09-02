/**
 * Author and reviewer records — source of truth.
 *
 * Standard §1 rule 4 and S1 §6.5: identify people by their *actual* contribution.
 * Every field here is something we have been told. Nothing is inferred, rounded
 * up, or filled in to look better. Fabricated credentials are a critical failure
 * (standard §8), and a decorative expert profile is the specific anti-pattern
 * S1 §5.7 names.
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
  /** What this person is actually competent to sign off — see §competence below. */
  reviewScope: string[];
  /** What they are explicitly *not* signing off, and why. Rendered on the profile. */
  outOfScope: string[];
}

export const MATT_BOYD: Person = {
  slug: "matt-boyd",
  name: "Matt Boyd",
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
};

export const PEOPLE: Person[] = [MATT_BOYD];

export const personId = (p: Person) => `${SITE.url}/about/${p.slug}#person`;
export const personUrl = (p: Person) => `/about/${p.slug}`;

/** Person node for JSON-LD. Only properties we can evidence. */
export function personSchema(p: Person) {
  return {
    "@type": "Person",
    "@id": personId(p),
    name: p.name,
    jobTitle: p.jobTitle,
    url: `${SITE.url}${personUrl(p)}`,
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
 * dates — never bumped without a real review (standard §1 rule 7).
 */
export interface ReviewMeta {
  reviewer: Person;
  published: string;
  reviewed: string;
  /** Shorter for volatile financial facts (S1 §4.10). */
  reviewIntervalMonths: number;
}
