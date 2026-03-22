import PastArchiveClient from "./PastArchiveClient";
import { getPastTimelineRows } from "@/app/lib/pastTimelineServer";

export default async function PastArchivePage() {
  const timelineRows = await getPastTimelineRows();
  return <PastArchiveClient timelineRows={timelineRows} />;
}
