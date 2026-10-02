import type { Metadata } from "next";
import Link from "next/link";
import { P, PageFrame } from "@/components/Page";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <PageFrame trail={[{ name: "Page not found" }]} title={<>Page not found</>}>
      <P>
        {"The page you were looking for is not here. It may have moved, or the provider may no longer be listed. "}
        <Link href="/">Search the A–Z directory</Link>.
      </P>
    </PageFrame>
  );
}
