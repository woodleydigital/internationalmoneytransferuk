import type { Entry } from "./directory.ts";
import { isReceivingQuote, type Topic } from "./service-facts.ts";

/** Compare exact statements, without treating different routes as equivalent. */
export function comparisonEvidence(entry: Entry, topic: Topic) {
  const all = (entry.service?.quotes ?? []).filter((q) => q.topic === topic);
  const quotes = topic === "availability" ? all : all.filter((q) => !isReceivingQuote(q));
  return { quotes, receivingOnly: all.length > 0 && quotes.length === 0 };
}

/** An unpublished number must never become a zero-complaints claim. */
export function complaintCount(value?: number): string {
  return value === undefined ? "Not stated in published data" : new Intl.NumberFormat("en-GB").format(value);
}
