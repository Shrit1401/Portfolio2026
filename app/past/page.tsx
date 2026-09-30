import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import { RevealText } from "@/app/components/motion";
import Footer from "../components/Footer";
import { getPastTimelineRows } from "@/app/lib/pastTimelineServer";
import PastTimeline, { type ChapterGroup } from "./PastTimeline";

export const metadata: Metadata = {
  title: "Past",
  description: "How I got here, from editing youtube videos as a kid to researching AI in college.",
  openGraph: {
    title: "Past | Shrit",
    description: "How I got here, from editing youtube videos as a kid to researching AI in college.",
  },
};

export default async function PastPage() {
  const rows = await getPastTimelineRows();

  const chapters: ChapterGroup[] = [];
  for (const row of rows) {
    const last = chapters.at(-1);
    if (last?.chapter.id === row.chapter.id) last.events.push(row.event);
    else chapters.push({ chapter: row.chapter, events: [row.event] });
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 pt-12 sm:px-6">
        <h1 className="text-[32px] leading-tight tracking-[-0.01em] text-ink"><RevealText>Past</RevealText></h1>
        <p className="mt-1 text-sm text-muted">
          the short version of how i got here, drawn in ms paint. oldest first.
        </p>

        <PastTimeline chapters={chapters} />
      </main>
      <Footer />
    </>
  );
}
