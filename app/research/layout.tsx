import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Notes and articles on software, systems, and things Shrit is learning — research and writing.",
  openGraph: {
    title: "Research | Shrit",
    description:
      "Notes and articles on software, systems, and learning — research and writing.",
  },
};

export default function ResearchLayout({ children }: { children: ReactNode }) {
  return children;
}
