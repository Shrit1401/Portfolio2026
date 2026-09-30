import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { GALLERY_ID } from "@/sanity/constants";
import { groq } from "next-sanity";
import { unstable_noStore as noStore } from "next/cache";

export type GalleryItem = {
  id: string;
  img: string;
  caption: string;
  /** e.g. "Bangalore · 12 Mar 2026". */
  meta?: string;
  story?: string;
  href?: string;
};

const galleryQuery = groq`
  *[_id == $id][0].items[]{ _key, image, caption, place, date, story, link }
`;

type Row = {
  _key: string;
  image?: Parameters<typeof urlFor>[0] | null;
  caption?: string | null;
  place?: string | null;
  date?: string | null;
  story?: string | null;
  link?: string | null;
};

function toItem(row: Row): GalleryItem | null {
  const caption = row.caption?.trim();
  if (!caption || !row.image) return null;
  const meta = [row.place?.trim(), row.date?.trim()].filter(Boolean).join(" · ");
  return {
    id: row._key,
    img: urlFor(row.image).height(560).quality(80).auto("format").url(),
    caption,
    ...(meta ? { meta } : {}),
    ...(row.story?.trim() ? { story: row.story.trim() } : {}),
    ...(row.link?.trim() ? { href: row.link.trim() } : {}),
  };
}

/** Gallery of things, in the order set in Sanity Studio. */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  noStore();
  try {
    const rows = await client.fetch<Row[] | null>(galleryQuery, { id: GALLERY_ID });
    return (rows ?? []).map(toItem).filter((i): i is GalleryItem => i != null);
  } catch (e) {
    console.error(e);
    return [];
  }
}
