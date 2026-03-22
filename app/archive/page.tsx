import type { Metadata } from "next";
import PastArchiveClient from "./PastArchiveClient";
import { getPastTimelineRows } from "@/app/lib/pastTimelineServer";
import { getBuildProofEntries } from "@/app/lib/buildLogServer";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Archive — timeline, past milestones, and build log entries from Shrit’s site.",
  openGraph: {
    title: "Archive | Shrit",
    description: "Timeline, past milestones, and build log archive.",
  },
};

export default async function PastArchivePage() {
  const [timelineRows, buildProofEntries] = await Promise.all([
    getPastTimelineRows(),
    getBuildProofEntries(),
  ]);
  return (
    <PastArchiveClient
      timelineRows={timelineRows}
      buildProofEntries={buildProofEntries}
    />
  );
}
