import type { Metadata } from "next";
import HomePage from "./components/home/HomePage";

export const metadata: Metadata = {
  title: { absolute: "Shrit" },
  description:
    "Shrit Shrivastava — a guy that loves creating things. Posts, a weekly newsletter, vlogs on YouTube, and a gallery of things.",
  openGraph: {
    title: "Shrit",
    description:
      "Posts, a weekly newsletter, vlogs on YouTube, and a gallery of things by Shrit.",
  },
};

// Substack + YouTube feeds refresh every 10 minutes, so new issues/videos show up on their own.
export const revalidate = 600;

export default function Home() {
  return <HomePage />;
}
