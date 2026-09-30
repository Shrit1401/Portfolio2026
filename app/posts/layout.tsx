import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Posts",
  description:
    "Small posts by Shrit on AI, building things, and whatever is worth writing down.",
  openGraph: {
    title: "Posts | Shrit",
    description:
      "Small posts on AI, building things, and whatever is worth writing down.",
  },
};

export default function ResearchLayout({ children }: { children: ReactNode }) {
  return children;
}
