import { XMLParser } from "fast-xml-parser";

const CHANNEL_ID = "UC27DNskYBcRe2jMObazbh6g";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export type YouTubeVideo = {
  id: string;
  title: string;
  published?: string;
};

/** Used when the RSS feed is unreachable (newest first). */
const FALLBACK: YouTubeVideo[] = [
  { id: "JuzzIh1_5YU", title: "Juggling Startup & College | Week 10 11" },
  { id: "YURAZ1427BE", title: "Doing Something from College | Week 7 8 9" },
  { id: "Egmm45OZoE4", title: "week 6 of doing something" },
  { id: "xODaWU6WL1g", title: "Week 5 of building something" },
  { id: "xoUodlgqqT4", title: "Week 4 of doing something" },
  { id: "syxsmGRQqfw", title: "Week 3 of doing something" },
  { id: "RCtvMJptbpI", title: "Week 2 of doing something" },
  { id: "Dr900Fobc5s", title: "Week 1 of Starting Something" },
  { id: "qms6_xhNe2E", title: "I Made A Website To Predict Your 2026" },
  { id: "UTGZ7uIjmW4", title: "I Made An App To Journal With Voice" },
  { id: "e_k0r1YSK3A", title: "what does cool even mean?" },
  { id: "2jZE0fQ-Sj0", title: "I Turned Chrome into a Full OS!" },
];

export const youtubeThumb = (id: string) =>
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** YouTube's three auto-captured frames (~25%, 50%, 75% through the video). */
export const youtubeFrames = (id: string) =>
  [1, 2, 3].map((n) => `https://i.ytimg.com/vi/${id}/hq${n}.jpg`);

export const youtubeUrl = (id: string) =>
  `https://www.youtube.com/watch?v=${id}`;

export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: 600 } });
    if (!res.ok) return FALLBACK;
    const doc = new XMLParser().parse(await res.text());
    const raw = doc?.feed?.entry;
    const entries: Record<string, unknown>[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const videos = entries
      .map((e) => ({
        id: String(e["yt:videoId"] ?? ""),
        title: String(e.title ?? ""),
        published: typeof e.published === "string" ? e.published : undefined,
      }))
      // Shorts show up in the feed too; the carousel is for the vlogs.
      .filter((v) => v.id && !/#shorts/i.test(v.title));
    return videos.length ? videos : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
