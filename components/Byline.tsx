import Link from "next/link";
import type { ReviewMeta } from "@/lib/people";
import { personUrl } from "@/lib/people";
import { longDate } from "@/lib/site";

/**
 * Visible authorship and review dates. Standard §1 rule 7 and §8: schema may
 * never assert a reviewer the page does not show, and a date is only bumped by a
 * real review.
 */
export function Byline({ meta }: { meta: ReviewMeta }) {
  const { reviewer, published, reviewed } = meta;
  return (
    <p className="mt-4 text-sm text-muted">
      {"Reviewed by "}
      <Link href={personUrl(reviewer)} className="text-brand-600 underline">
        {reviewer.name}
      </Link>
      {`, ${reviewer.jobTitle}. Published ${longDate(published)}`}
      {reviewed !== published ? `, last reviewed ${longDate(reviewed)}.` : "."}
    </p>
  );
}

/**
 * Shown on pages whose subject falls outside the reviewer's scope. Being explicit
 * about the limits of a review is a trust signal, and the alternative — implying
 * competence we cannot evidence — is a critical failure.
 */
export function ReviewLimit({ children }: { children: React.ReactNode }) {
  return (
    <aside className="mt-6 rounded-lg border border-line-strong bg-wash p-4 text-sm">
      <p>
        <strong className="text-ink">About this page. </strong>
        {children}
      </p>
    </aside>
  );
}
