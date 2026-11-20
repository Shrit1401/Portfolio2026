import type { Metadata } from "next";
import { profile } from "./lib/profile";
import HomePage from "./components/home/HomePage";

export const metadata: Metadata = {
  title: { absolute: "Shrit Shrivastava | Developer, maker, and writer" },
  description: profile.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Shrit Shrivastava | Developer, maker, and writer",
    description: profile.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shrit Shrivastava | Developer, maker, and writer",
    description: profile.description,
  },
};

// Substack + YouTube feeds refresh every 10 minutes, so new issues/videos show up on their own.
export const revalidate = 600;

export default function Home() {
  return <HomePage />;
}
