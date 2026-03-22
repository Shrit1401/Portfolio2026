import PastArchiveClient from "./PastArchiveClient";
import { getPastTimelineRows } from "@/app/lib/pastTimelineServer";
import { getBuildProofEntries } from "@/app/lib/buildLogServer";

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
