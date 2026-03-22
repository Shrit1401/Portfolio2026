import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { ROPE_POLAROID_GALLERY_ID } from "@/sanity/constants";
import { groq } from "next-sanity";
import { unstable_noStore as noStore } from "next/cache";
import {
  workGalleryItems,
  type WorkGalleryItem,
} from "@/app/lib/workGallery";

const ropeGalleryQuery = groq`
  *[_id == $id][0]{
    "frames": frames[]{
      _key,
      subtitle,
      href,
      image
    }
  }.frames
`;

type SanityPolaroidFrame = {
  _key?: string;
  subtitle?: string | null;
  href?: string | null;
  image?: Parameters<typeof urlFor>[0] | null;
};

function mapFrame(row: SanityPolaroidFrame): WorkGalleryItem | null {
  const subtitle = row.subtitle?.trim();
  const href = row.href?.trim();
  if (!subtitle || !row.image) return null;
  try {
    const img = urlFor(row.image).width(900).quality(85).url();
    return href ? { img, subtitle, href } : { img, subtitle };
  } catch {
    return null;
  }
}

export async function getRopePolaroidGalleryItems(): Promise<WorkGalleryItem[]> {
  noStore();
  try {
    const rows = await client.fetch<SanityPolaroidFrame[] | null>(
      ropeGalleryQuery,
      { id: ROPE_POLAROID_GALLERY_ID },
    );
    const mapped = (rows ?? [])
      .map(mapFrame)
      .filter((item): item is WorkGalleryItem => item != null);
    if (mapped.length > 0) return mapped;
  } catch (e) {
    console.error(e);
  }
  return [...workGalleryItems];
}
