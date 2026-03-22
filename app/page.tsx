import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getBuildProofEntries } from "@/app/lib/buildLogServer";
import { getRopePolaroidGalleryItems } from "@/app/lib/ropePolaroidGalleryServer";

export const metadata: Metadata = {
  title: { absolute: "Shrit" },
  description:
    "Home — Shrit’s portfolio: projects, research, experiments, and what’s shipping now.",
  openGraph: {
    title: "Shrit",
    description:
      "Portfolio and research — projects, experiments, and writing by Shrit.",
  },
};

export default async function Home() {
  const [buildProofEntries, ropeGalleryItems] = await Promise.all([
    getBuildProofEntries(),
    getRopePolaroidGalleryItems(),
  ]);
  return (
    <HomeClient
      buildProofEntries={buildProofEntries}
      ropeGalleryItems={ropeGalleryItems}
    />
  );
}
