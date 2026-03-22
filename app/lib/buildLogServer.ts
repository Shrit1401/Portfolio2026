import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { groq } from "next-sanity";
import { unstable_noStore as noStore } from "next/cache";
import {
  BUILD_PROOF_ENTRIES,
  type BuildProofEntry,
} from "@/app/lib/buildProof";
import { BUILD_LOG_LIST_ID } from "@/sanity/constants";

const orderedBuildLogQuery = groq`
  *[_id == $listId][0]{
    "entries": entries[]->{
      _id,
      title,
      icon,
      location,
      date,
      image,
      learnMoreUrl,
      story
    }
  }.entries
`;

const fallbackBuildLogQuery = groq`
  *[_type == "buildLogEntry"] | order(_createdAt asc) {
    _id,
    title,
    icon,
    location,
    date,
    image,
    learnMoreUrl,
    story
  }
`;

type SanityBuildLogRow = {
  _id: string;
  title?: string;
  icon?: string | null;
  location?: string | null;
  date?: string | null;
  image?: Parameters<typeof urlFor>[0] | null;
  learnMoreUrl?: string | null;
  story?: string | null;
};

function mapRow(row: SanityBuildLogRow): BuildProofEntry | null {
  const title = row.title?.trim();
  if (!title || !row.image) return null;
  try {
    const image = urlFor(row.image).width(1200).quality(85).url();
    const learnMoreUrl = row.learnMoreUrl?.trim();
    const story = row.story?.trim();
    return {
      id: row._id,
      title,
      icon: row.icon?.trim() ?? "",
      location: row.location?.trim() ?? "",
      date: row.date?.trim() ?? "",
      image,
      ...(story ? { story } : {}),
      ...(learnMoreUrl ? { learnMoreUrl } : {}),
    };
  } catch {
    return null;
  }
}

function mapRows(rows: SanityBuildLogRow[] | null | undefined): BuildProofEntry[] {
  if (!rows?.length) return [];
  return rows
    .map(mapRow)
    .filter((e): e is BuildProofEntry => e != null);
}

export async function getBuildProofEntries(): Promise<BuildProofEntry[]> {
  noStore();
  try {
    const ordered = await client.fetch<SanityBuildLogRow[] | null>(
      orderedBuildLogQuery,
      { listId: BUILD_LOG_LIST_ID },
    );
    let mapped = mapRows(ordered ?? undefined);
    if (mapped.length === 0) {
      const fallback = await client.fetch<SanityBuildLogRow[]>(
        fallbackBuildLogQuery,
      );
      mapped = mapRows(fallback);
    }
    return mapped.length > 0 ? mapped : BUILD_PROOF_ENTRIES;
  } catch (e) {
    console.error(e);
    return BUILD_PROOF_ENTRIES;
  }
}
