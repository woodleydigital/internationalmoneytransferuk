/**
 * Homepage questions and answers. Shown on the page and marked up as FAQPage
 * from this one list, so the two cannot differ. General answers only: nothing
 * here states a fact about a particular provider.
 */

export interface Faq {
  q: string;
  /** Plain text: used for the markup and rendered as the visible answer. */
  a: string;
  link?: { href: string; label: string };
}

export const HOME_FAQ: Faq[] = [
  {
    q: "How do I check that a money transfer provider is regulated?",
    a: "Search the FCA Register for the firm’s name or its firm reference number (FRN), and check that the website you are using matches the one the Register lists. Each profile here quotes what the provider says about its own regulation and links straight to a Register search.",
    link: { href: "/check-a-provider/", label: "Check a provider" },
  },
  {
    q: "Why does a profile say “Register data pending”?",
    a: "We do not yet republish data from the FCA Register. Until we do, each profile shows the provider’s Companies House record and its own published regulatory statement, and is marked “Register data pending” so it never looks more complete than it is.",
    link: { href: "/methodology/", label: "Our methodology" },
  },
  {
    q: "Where does the information come from?",
    a: "From Companies House and the Financial Ombudsman Service, under the Open Government Licence, and from each provider’s own website, quoted word for word. Software collects both every week, and every block on a profile shows its source and the date it was fetched.",
    link: { href: "/status/", label: "Data status" },
  },
  {
    q: "Why is there no Companies House record for some providers?",
    a: "We only link a provider to a company when the match is certain, for example because the provider’s own website states the company number, or exactly one active payments company carries its name. Where it does not, or more than one company could fit, we show nothing rather than guess. Building societies are not companies, so they have no Companies House record.",
  },
  {
    q: "Can providers pay to be listed or to appear higher?",
    a: "No. Listing is free, providers are shown alphabetically or by a recorded date, and nobody can pay to change what a profile says or where it appears.",
    link: { href: "/how-we-get-paid/", label: "How we get paid" },
  },
  {
    q: "Does anyone check the profiles by hand?",
    a: "No. The directory is compiled entirely by software, and nobody tests providers or reviews profiles. If you spot an error, tell us and we will correct it in public.",
    link: { href: "/corrections/", label: "Report an error" },
  },
];
