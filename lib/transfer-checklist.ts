import type { Entry } from "./directory.ts";
import type { ProviderKind } from "./providers.ts";
import type { Topic } from "./service-facts.ts";

export interface TransferQuestion { topic: Topic; question: string; }

const QUESTIONS: Record<ProviderKind, TransferQuestion[]> = {
  bank: [
    { topic: "countries", question: "Can your particular account send the currency to the destination bank?" },
    { topic: "payout", question: "What beneficiary details and bank-routing information are required?" },
    { topic: "fees", question: "What are the bank's fee, conversion rate and any intermediary or recipient charges?" },
    { topic: "limits", question: "Do online, app, telephone and branch payments have different limits?" },
    { topic: "speed", question: "What cut-off time and working-day schedule apply to this payment?" },
    { topic: "safeguarding", question: "Which entity provides the payment service, and what protection applies to this product?" },
  ],
  broker: [
    { topic: "countries", question: "Does the broker support this route for a UK personal or business customer?" },
    { topic: "payout", question: "How is the recipient paid, and can intermediary charges reduce the payout?" },
    { topic: "fees", question: "What is the total you pay, the recipient payout and the expiry time of the quote?" },
    { topic: "limits", question: "What minimum amount, funding deadline and source-of-funds documents apply?" },
    { topic: "speed", question: "When will cleared funds be sent and when does the recipient bank expect them?" },
    { topic: "safeguarding", question: "Which entity contracts with you and how does it describe protection of your funds?" },
  ],
  transfer: [
    { topic: "countries", question: "Is your destination and currency available to customers sending from the UK?" },
    { topic: "payout", question: "Is bank deposit, cash pickup, card delivery or a mobile wallet available for this route?" },
    { topic: "fees", question: "What are the standard fee and recipient payout for your funding method, without a first-transfer offer?" },
    { topic: "limits", question: "What transfer limit and verification requirements apply to your account and payout method?" },
    { topic: "speed", question: "Which delivery option applies, and when does the quoted delivery time begin?" },
    { topic: "safeguarding", question: "Which entity provides this transfer and what does it say about customer-money protection?" },
  ],
};

/** Questions are prompts, not claims that a product or feature exists. */
export function transferQuestions(entry: Entry) {
  return QUESTIONS[entry.provider.kind].map((q) => ({
    ...q,
    hasQuotation: Boolean(entry.service?.quotes.some((quote) => quote.topic === q.topic)),
  }));
}

/** An original join of sourced company numbers, without inferring product equivalence. */
export function sharedCompanyEntries(entry: Entry, entries: Entry[]): Entry[] {
  const number = entry.company?.company?.number;
  if (!number) return [];
  return entries.filter((e) => e.provider.slug !== entry.provider.slug && e.company?.company?.number === number)
    .sort((a, b) => a.provider.name.localeCompare(b.provider.name, "en-GB"));
}
