/**
 * Structured data (schema.org JSON-LD), built in one place.
 *
 * Rules:
 * - Describe only what the page visibly shows, and only facts that come from
 *   our records by plain code (Companies House, our own site). Never a rating,
 *   review, ranking, or a claim the page does not make.
 * - Every node has a stable @id, so the site-wide Organization and WebSite are
 *   referenced, never redefined, and each page is one connected graph.
 * - URLs are absolute and use the canonical trailing-slash form.
 * - FCA numbers a provider states about itself are unverified: they are never
 *   asserted here.
 */
import { SITE, ID } from "./site.ts";
import { MATT_WOODLEY, personId, personUrl } from "./people.ts";
import { KIND_LABEL, providerUrl } from "./providers.ts";
import type { Entry } from "./directory.ts";

export const LANG = "en-GB";

/** Absolute URL for a site path ("/about/" → "https://…/about/"). */
export const abs = (path: string) => (/^https?:/.test(path) ? path : `${SITE.url}${path}`);

export const ref = (id: string) => ({ "@id": id });

const LOGO_ID = `${SITE.url}/#logo`;

export interface Crumb {
  name: string;
  href?: string;
}

/** The publisher: who runs the site and the policies it publishes. */
export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ID.organization,
    name: SITE.name,
    alternateName: SITE.alternateName,
    url: `${SITE.url}/`,
    description:
      "An independent directory of UK international money transfer providers, compiled by software from public records and providers' own published statements.",
    logo: {
      "@type": "ImageObject",
      "@id": LOGO_ID,
      url: abs("/brand/logo-512.png"),
      contentUrl: abs("/brand/logo-512.png"),
      width: 512,
      height: 512,
      caption: SITE.name,
      inLanguage: LANG,
    },
    image: ref(LOGO_ID),
    address: { "@type": "PostalAddress", ...SITE.address },
    email: SITE.email,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SITE.email,
      areaServed: "GB",
      availableLanguage: "en-GB",
    },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    founder: {
      "@type": "Person",
      "@id": personId(MATT_WOODLEY),
      name: MATT_WOODLEY.name,
      url: abs(personUrl(MATT_WOODLEY)),
    },
    publishingPrinciples: abs("/methodology/"),
    ethicsPolicy: abs("/code-of-ethics/"),
    correctionsPolicy: abs("/corrections/"),
    ownershipFundingInfo: abs("/how-we-get-paid/"),
    actionableFeedbackPolicy: abs("/for-providers/"),
    knowsAbout: ["International money transfer", "Money remittance", "Foreign exchange", "Companies House records"],
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    url: `${SITE.url}/`,
    name: SITE.name,
    alternateName: SITE.alternateName,
    description: "A searchable A–Z directory of UK international money transfer providers.",
    inLanguage: LANG,
    publisher: ref(ID.organization),
    // The directory search is a real GET form at /?q=.
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Site-wide graph, emitted once in the root layout. */
export function siteGraph() {
  return { "@context": "https://schema.org", "@graph": [organizationNode(), websiteNode()] };
}

/** BreadcrumbList matching the visible breadcrumb (Home first, this page last). */
export function breadcrumbNode(path: string, trail: Crumb[]) {
  const all = [{ name: "Home", href: "/" }, ...trail];
  return {
    "@type": "BreadcrumbList",
    "@id": `${abs(path)}#breadcrumb`,
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(i === all.length - 1 ? path : (c.href ?? path)),
    })),
  };
}

export interface PageSchema {
  /** Canonical path with trailing slash, e.g. "/about/". */
  path: string;
  /** The page's visible title. */
  name: string;
  /** The same text as the meta description. */
  description: string;
  /** WebPage subtype: AboutPage, ProfilePage, CollectionPage, ContactPage… */
  type?: string;
  mainEntity?: object;
  hasPart?: object;
  about?: object;
  /** ISO date the page's data last changed (only when we genuinely know it). */
  dateModified?: string;
  datePublished?: string;
  primaryImage?: string;
  /** Further nodes in this page's graph (the main entity, an Article, a tool…). */
  nodes?: object[];
}

export const pageId = (path: string) => `${abs(path)}#page`;

/** One connected graph for a page: WebPage + BreadcrumbList + any further nodes. */
export function pageGraph(s: PageSchema, trail?: Crumb[]) {
  const url = abs(s.path);
  const page = {
    "@type": s.type ?? "WebPage",
    "@id": pageId(s.path),
    url,
    name: s.name,
    description: s.description,
    inLanguage: LANG,
    isPartOf: ref(ID.website),
    publisher: ref(ID.organization),
    ...(trail ? { breadcrumb: ref(`${url}#breadcrumb`) } : {}),
    ...(s.mainEntity ? { mainEntity: s.mainEntity } : {}),
    ...(s.hasPart ? { hasPart: s.hasPart } : {}),
    ...(s.about ? { about: s.about } : {}),
    ...(s.datePublished ? { datePublished: s.datePublished } : {}),
    ...(s.dateModified ? { dateModified: s.dateModified } : {}),
    ...(s.primaryImage
      ? { primaryImageOfPage: { "@type": "ImageObject", url: abs(s.primaryImage), contentUrl: abs(s.primaryImage) } }
      : {}),
  };
  return {
    "@context": "https://schema.org",
    "@graph": [page, ...(trail ? [breadcrumbNode(s.path, trail)] : []), ...(s.nodes ?? [])],
  };
}

/** Latest of the dates our records were fetched, as an ISO timestamp. */
export function latest(dates: (string | undefined)[]): string | undefined {
  const ds = dates.filter((d): d is string => Boolean(d)).sort();
  return ds.length ? ds[ds.length - 1] : undefined;
}

export const providerId = (slug: string) => `${SITE.url}/providers/${slug}/#organization`;

/**
 * A provider as an Organization. Company facts are included only when the
 * Companies House match passed the strict rules and the record is fresh; the
 * provider's own FCA claims are never asserted.
 */
export function providerNode(entry: Entry, logo?: string | null) {
  const { provider: p, company } = entry;
  const c = company?.company;
  // sameAs: other authoritative pages about the same entity (the website itself is `url`).
  const sameAs = c?.url ? [c.url] : [];
  return {
    "@type": "Organization",
    "@id": providerId(p.slug),
    name: p.name,
    description: `${KIND_LABEL[p.kind]} listed in the ${SITE.alternateName} directory.`,
    ...(p.website ? { url: p.website } : {}),
    ...(logo ? { logo: abs(logo) } : {}),
    ...(c
      ? {
          legalName: c.name,
          identifier: {
            "@type": "PropertyValue",
            propertyID: "Companies House company number",
            value: c.number,
            url: c.url,
          },
          ...(c.incorporated ? { foundingDate: c.incorporated } : {}),
          ...(c.registeredOffice ? { address: c.registeredOffice } : {}),
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    mainEntityOfPage: ref(pageId(providerUrl(p))),
  };
}

/** ItemList of providers, in the order shown, each pointing at its profile. */
export function providerList(
  entries: Entry[],
  id: string,
  name: string,
  order: "Ascending" | "Descending" | "Unordered" = "Unordered",
) {
  return {
    "@type": "ItemList",
    "@id": id,
    name,
    numberOfItems: entries.length,
    itemListOrder: `https://schema.org/ItemList${order === "Unordered" ? "Unordered" : `Order${order}`}`,
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: abs(providerUrl(e.provider)),
      name: e.provider.name,
    })),
  };
}

/**
 * The questions answered visibly on a page, as an FAQPage that is part of that
 * page (the page keeps its own type and main entity).
 */
export function faqNode(items: { q: string; a: string }[], id: string, partOf: string) {
  return {
    "@type": "FAQPage",
    "@id": id,
    inLanguage: LANG,
    isPartOf: ref(partOf),
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

/** The daily reference-rate table, as a Dataset that names its source and date. */
export function rateDatasetNode(table: { date: string; rows: { code: string }[] }, path: string) {
  return {
    "@type": "Dataset",
    "@id": `${abs(path)}#reference-rates`,
    name: "Mid-market reference rates against the pound",
    description: `Daily mid-market reference rates for the British pound against ${table.rows.length} currencies, blended from central bank publications by the Frankfurter API, with 7-day and 30-day changes. Reference rates only: not rates any provider offers.`,
    url: `${abs(path)}#rates`,
    inLanguage: LANG,
    temporalCoverage: table.date,
    dateModified: table.date,
    variableMeasured: table.rows.map((r) => `GBP/${r.code} exchange rate`),
    isAccessibleForFree: true,
    publisher: ref(ID.organization),
    isBasedOn: "https://frankfurter.dev/",
    creditText: "Frankfurter (frankfurter.dev), blending central bank reference rates",
  };
}
