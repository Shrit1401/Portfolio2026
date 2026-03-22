import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { groq } from "next-sanity";
import { unstable_noStore as noStore } from "next/cache";
import {
  buildPastTimelineRows,
  PAST_CHAPTERS,
  type PastTimelineChapter,
  type PastTimelineEvent,
  type PastTimelineEventType,
} from "@/app/lib/pastTimeline";

const pastTimelineQuery = groq`
  *[_id == "pastLifeTimeline"][0]{
    chapters[]{
      "slug": slug,
      title,
      events[]{
        eventType,
        date,
        title,
        story,
        image,
        imageUrl
      }
    }
  }
`;

type SanityPastTimelineDoc = {
  chapters?: Array<{
    slug?: { current?: string };
    title?: string;
    events?: Array<{
      eventType?: string;
      date?: string;
      title?: string;
      story?: string;
      image?: Parameters<typeof urlFor>[0] | null;
      imageUrl?: string | null;
    }>;
  }>;
} | null;

const EVENT_TYPES: PastTimelineEventType[] = [
  "start",
  "thread",
  "breakthrough",
  "turn",
  "experiment",
  "big-moment",
  "shift",
  "first",
];

function isEventType(v: string): v is PastTimelineEventType {
  return EVENT_TYPES.includes(v as PastTimelineEventType);
}

function resolveEventImage(ev: {
  image?: Parameters<typeof urlFor>[0] | null;
  imageUrl?: string | null;
}): string | undefined {
  if (ev.image) {
    try {
      return urlFor(ev.image).width(900).quality(85).url();
    } catch {
      /* invalid image payload */
    }
  }
  const u = ev.imageUrl?.trim();
  return u || undefined;
}

function mapSanityToChapters(doc: SanityPastTimelineDoc): PastTimelineChapter[] {
  if (!doc?.chapters?.length) return PAST_CHAPTERS;

  const chapters = doc.chapters
    .map((ch, i) => {
      const id = ch.slug?.current?.trim() || `chapter-${i}`;
      const title = ch.title?.trim() || id;
      const events: PastTimelineEvent[] = (ch.events ?? [])
        .map((ev) => {
          const typeRaw = ev.eventType ?? "thread";
          const type = isEventType(typeRaw) ? typeRaw : "thread";
          const img = resolveEventImage(ev);
          return {
            type,
            date: ev.date?.trim() ?? "",
            title: ev.title?.trim() ?? "Untitled",
            story: ev.story?.trim() ?? "",
            ...(img ? { image: img } : {}),
          };
        })
        .filter((e) => e.title.length > 0);

      return { id, title, events };
    })
    .filter((c) => c.events.length > 0);

  return chapters.length > 0 ? chapters : PAST_CHAPTERS;
}

export async function getPastTimelineRows() {
  noStore();
  try {
    const doc = await client.fetch<SanityPastTimelineDoc>(pastTimelineQuery);
    const chapters = mapSanityToChapters(doc);
    return buildPastTimelineRows(chapters);
  } catch (e) {
    console.error(e);
    return buildPastTimelineRows(PAST_CHAPTERS);
  }
}
