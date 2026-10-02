/**
 * Plain-English definitions of the terms the site uses. General explanations
 * only: nothing here states a fact about any particular provider.
 */

export interface Term {
  slug: string;
  term: string;
  /** Other names or abbreviations, shown after the term. */
  also?: string;
  definition: string;
  /** An authoritative page where the reader can find out more. */
  source?: { label: string; url: string };
}

export const GLOSSARY: Term[] = [
  {
    slug: "annual-accounts",
    term: "Annual accounts",
    definition:
      "The financial statements a UK company must file at Companies House each year. Profiles show the date the latest accounts were “made up to” and whether Companies House records them as overdue, exactly as Companies House states it.",
    source: { label: "GOV.UK: prepare annual accounts", url: "https://www.gov.uk/annual-accounts" },
  },
  {
    slug: "authorised-payment-institution",
    term: "Authorised payment institution",
    definition:
      "A firm the FCA has authorised to provide payment services, such as sending money abroad, under the Payment Services Regulations 2017. Smaller firms can instead be registered as a small payment institution, which has lighter requirements and lower limits.",
    source: { label: "FCA: Payment Services and E-Money Regulations", url: "https://www.fca.org.uk/firms/payment-services-regulations-e-money-regulations" },
  },
  {
    slug: "building-society",
    term: "Building society",
    definition:
      "A financial institution owned by its members rather than by shareholders. Building societies are registered with the FCA under their own legislation, not as companies, so they have no Companies House record.",
  },
  {
    slug: "companies-house",
    term: "Companies House",
    definition:
      "The UK government’s register of companies. It records each company’s name, number, status, registered office, filings and the people or companies with significant control over it. Its data is published under the Open Government Licence.",
    source: { label: "Companies House", url: "https://find-and-update.company-information.service.gov.uk/" },
  },
  {
    slug: "company-number",
    term: "Company number",
    definition:
      "The unique number Companies House gives each company when it is incorporated, usually eight digits, sometimes with a letter prefix (for example SC for Scotland or NI for Northern Ireland). It identifies the legal entity, whatever brand name it trades under.",
  },
  {
    slug: "company-status",
    term: "Company status",
    definition:
      "Where a company stands on the Companies House register, for example active, in liquidation or dissolved. We show it in Companies House’s own words and do not interpret it.",
  },
  {
    slug: "electronic-money-institution",
    term: "Electronic money institution",
    also: "EMI",
    definition:
      "A firm authorised by the FCA to issue electronic money: money held in an account or app and used for payments. Many money transfer apps are electronic money institutions rather than banks.",
    source: { label: "FCA: Payment Services and E-Money Regulations", url: "https://www.fca.org.uk/firms/payment-services-regulations-e-money-regulations" },
  },
  {
    slug: "exchange-rate-margin",
    term: "Exchange rate margin",
    also: "Mark-up, spread",
    definition:
      "The difference between the mid-market rate and the rate a provider gives you. It is a cost even when no fee is shown, because you receive less currency than the mid-market rate would give.",
  },
  {
    slug: "fca",
    term: "Financial Conduct Authority",
    also: "FCA",
    definition:
      "The UK regulator for financial services firms, including banks, payment institutions, electronic money institutions and currency brokers. Firms that provide payment services in the UK generally need to be authorised or registered by the FCA.",
    source: { label: "FCA", url: "https://www.fca.org.uk/" },
  },
  {
    slug: "fca-register",
    term: "FCA Register",
    also: "Financial Services Register",
    definition:
      "The FCA’s public record of the firms and individuals it regulates, with each firm’s status and what it is permitted to do. It is the place to check a provider before you send money.",
    source: { label: "FCA Financial Services Register", url: "https://register.fca.org.uk/" },
  },
  {
    slug: "financial-ombudsman-service",
    term: "Financial Ombudsman Service",
    definition:
      "A free, independent service that settles complaints between consumers and financial businesses in the UK. You usually need to complain to the firm first.",
    source: { label: "Financial Ombudsman Service", url: "https://www.financial-ombudsman.org.uk/" },
  },
  {
    slug: "frn",
    term: "Firm reference number",
    also: "FRN",
    definition:
      "The unique number the FCA gives each firm on its Register. A provider’s website usually states its FRN; you can search the Register for that number to confirm who the firm is and what it is allowed to do.",
  },
  {
    slug: "mid-market-rate",
    term: "Mid-market rate",
    also: "Interbank or reference rate",
    definition:
      "The midpoint between the prices at which banks buy and sell a currency on the wholesale market. Consumers are not normally offered it; it is the benchmark for measuring how much a provider’s rate costs you.",
  },
  {
    slug: "money-remittance",
    term: "Money remittance",
    definition:
      "Sending money from one person to another, often abroad, without either of them needing an account with the provider. It is one of the payment services the FCA regulates.",
  },
  {
    slug: "psc",
    term: "Person with significant control",
    also: "PSC",
    definition:
      "Someone, or a company, that owns or controls a company, for example by holding more than 25% of its shares or voting rights. Companies must report them to Companies House. We show corporate owners; we do not yet show individuals’ names.",
    source: {
      label: "GOV.UK: people with significant control",
      url: "https://www.gov.uk/guidance/people-with-significant-control-pscs",
    },
  },
  {
    slug: "registered-office",
    term: "Registered office",
    definition:
      "The official address of a company, recorded at Companies House, where legal letters can be sent. It is not always where the company works or serves customers.",
  },
  {
    slug: "safeguarding",
    term: "Safeguarding",
    definition:
      "The rules that require payment and electronic money institutions to protect customers’ money, usually by keeping it separate from their own funds, so it can be returned if the firm fails. It is not the same as Financial Services Compensation Scheme protection, which covers bank deposits.",
    source: { label: "FCA: safeguarding", url: "https://www.fca.org.uk/firms/emi-payment-institutions-safeguarding-requirements" },
  },
  {
    slug: "sic-code",
    term: "SIC code",
    also: "Standard Industrial Classification",
    definition:
      "A five-digit code a company gives Companies House to describe its main business, for example 64999, “financial intermediation not elsewhere classified”. Companies choose their own codes.",
  },
  {
    slug: "trading-name",
    term: "Trading name",
    also: "Brand",
    definition:
      "The name a firm uses with customers, which can differ from the legal name of the company behind it. Profiles show the brand and, where we can identify it, the registered company.",
  },
];

export const glossaryUrl = (slug: string) => `/glossary/#${slug}`;

export function getTerm(slug: string): Term | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}
