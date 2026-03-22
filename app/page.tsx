import HomeClient from "./HomeClient";
import { getBuildProofEntries } from "@/app/lib/buildLogServer";

export default async function Home() {
  const buildProofEntries = await getBuildProofEntries();
  return <HomeClient buildProofEntries={buildProofEntries} />;
}
