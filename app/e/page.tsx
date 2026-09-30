import type { Metadata } from "next";
import HomePage from "../components/home/HomePage";

export const metadata: Metadata = {
  title: { absolute: "Shrit" },
  description: "The homepage, after dark.",
  // Same content as `/`, so keep it out of search results.
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export const revalidate = 600;

export default function DarkHome() {
  return (
    <div className="theme-dark min-h-screen bg-paper text-ink">
      <HomePage />
    </div>
  );
}
