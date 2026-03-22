import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects and work — product, creative coding, and experiments by Shrit.",
  openGraph: {
    title: "Work | Shrit",
    description:
      "Selected projects and work — product, creative coding, and experiments.",
  },
};

export default function WorkLayout({ children }: { children: ReactNode }) {
  return children;
}
