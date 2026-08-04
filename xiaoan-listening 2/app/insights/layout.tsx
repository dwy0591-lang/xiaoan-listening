import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "访问小记",
  robots: { index: false, follow: false },
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
