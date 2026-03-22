import HomeClient from "./HomeClient";
import { getBuildProofEntries } from "@/app/lib/buildLogServer";
import { getRopePolaroidGalleryItems } from "@/app/lib/ropePolaroidGalleryServer";

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
