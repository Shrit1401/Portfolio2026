import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { INSPIRATION_ID } from "@/sanity/constants";
import { tweetIdFromUrl } from "@/sanity/lib/tweet";
import { groq } from "next-sanity";
import { unstable_noStore as noStore } from "next/cache";

/** A pin on the /photos board. Edited in Sanity Studio → "Inspiration board". */
export type Pin =
  | { type: "image"; key: string; src: string; w: number; h: number; caption: string; href?: string }
  | { type: "video"; key: string; src: string; poster?: string; w?: number; h?: number; caption: string; href?: string }
  | { type: "words"; key: string; text: string; by: string; href?: string }
  | { type: "tweet"; key: string; id: string };

const boardQuery = groq`
  *[_id == $id][0].pins[]{
    _key,
    _type,
    caption,
    text,
    by,
    link,
    url,
    image,
    "dims": image.asset->metadata.dimensions{ width, height },
    "videoUrl": video.asset->url,
    poster,
    "posterDims": poster.asset->metadata.dimensions{ width, height }
  }
`;

type Row = {
  _key: string;
  _type: "imagePin" | "videoPin" | "quotePin" | "tweetPin";
  caption?: string | null;
  text?: string | null;
  by?: string | null;
  link?: string | null;
  url?: string | null;
  image?: Parameters<typeof urlFor>[0] | null;
  dims?: { width: number; height: number } | null;
  videoUrl?: string | null;
  poster?: Parameters<typeof urlFor>[0] | null;
  posterDims?: { width: number; height: number } | null;
};

const IMAGE_WIDTH = 900;

function toPin(row: Row): Pin | null {
  const key = row._key;
  const href = row.link ?? undefined;
  switch (row._type) {
    case "imagePin": {
      if (!row.image || !row.dims || !row.caption) return null;
      const w = Math.min(IMAGE_WIDTH, row.dims.width);
      return {
        type: "image",
        key,
        src: urlFor(row.image).width(w).quality(85).auto("format").url(),
        w,
        h: Math.round((w * row.dims.height) / row.dims.width),
        caption: row.caption,
        href,
      };
    }
    case "videoPin": {
      if (!row.videoUrl || !row.caption) return null;
      const d = row.posterDims;
      return {
        type: "video",
        key,
        src: row.videoUrl,
        poster: row.poster ? urlFor(row.poster).width(IMAGE_WIDTH).quality(80).auto("format").url() : undefined,
        w: d?.width,
        h: d?.height,
        caption: row.caption,
        href,
      };
    }
    case "quotePin":
      if (!row.text || !row.by) return null;
      return { type: "words", key, text: row.text, by: row.by, href };
    case "tweetPin": {
      const id = tweetIdFromUrl(row.url ?? undefined);
      return id ? { type: "tweet", key, id } : null;
    }
    default:
      return null;
  }
}

export async function getInspirationPins(): Promise<Pin[]> {
  noStore();
  try {
    const rows = await client.fetch<Row[] | null>(boardQuery, { id: INSPIRATION_ID });
    return (rows ?? []).map(toPin).filter((p): p is Pin => p != null);
  } catch (e) {
    console.error(e);
    return [];
  }
}
