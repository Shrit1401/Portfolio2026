"use client";

import BuildProofArchive from "../components/BuildProofArchive";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PastTell from "../components/PastTell";
import PastText from "../components/Pasttext";
import { Revealer } from "../components/Revealer";
import type { PastTimelineRow } from "@/app/lib/pastTimeline";

export default function PastArchiveClient({
  timelineRows,
}: {
  timelineRows: PastTimelineRow[];
}) {
  return (
    <div className="relative w-full  past">
      <Revealer />

      <div className="flex min-h-screen flex-col">
        <Navbar active="past" />
        <PastText />
      </div>
      <BuildProofArchive />
      <PastTell timelineRows={timelineRows} />
      <Footer />
    </div>
  );
}
