import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import RetroTV from "./RetroTV";
import "./retro.css";
import { getHostCopy } from "./host";
import { getRepos } from "./github";
import { STORY_PARAGRAPHS } from "../lib/story";
import { getAllResearch } from "../lib/researchData";
import { getSubstackExcerpts } from "../lib/substackFeed";
import { getYouTubeVideos } from "../lib/youtube";
import { getGalleryItems } from "../lib/gallery";
import { getPastTimelineRows } from "../lib/pastTimelineServer";
import { getInspirationPins } from "../lib/inspiration";
import drawings from "../lib/pastDrawings.json";

const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-vt323", display: "swap" });

export const metadata: Metadata = {
  title: "Shrit TV",
  description: "Everything about Shrit, on one old CRT. Turn it on.",
  alternates: { canonical: "/retro" },
};

// Static page, rebuilt in the background at most every 10 minutes (that's also the only time OpenAI is called).
export const revalidate = 600;

const plain = (html: string) => html.replace(/<[^>]*>/g, "");

export default async function RetroPage() {
  const posts = getAllResearch();
  const [letters, videos, gallery, repos, past, pins] = await Promise.all([
    getSubstackExcerpts(6),
    getYouTubeVideos(),
    getGalleryItems(),
    getRepos(),
    getPastTimelineRows(),
    getInspirationPins(),
  ]);
  const doodles = drawings as Record<string, string>;
  const life = past.map(({ chapter, event }) => ({
    chapter: chapter.title,
    date: event.date,
    title: event.title,
    story: event.story,
    img: doodles[`${event.date.trim()}|${event.title.trim()}`] ?? event.image,
  }));

  const host = await getHostCopy(
    [
      STORY_PARAGRAPHS.map(plain).join(" "),
      `Life timeline (his own words): ${life.map((e) => `${e.date} — ${e.title}: ${e.story}`).join(" | ")}`,
      "Currently building HeyTappr (Tappr): a private in-product voice assistant.",
      "Taste and inspirations: Studio Ghibli (Totoro, Spirited Away, Howl, Kiki, Whisper of the Heart, The Wind Rises), Karpathy's 'build GPT from scratch', Shoe Dog. Draws his past in MS Paint doodles. Films weekly vlogs. Writes a weekly letter.",
      `Posts: ${posts.map((p) => p.title).join("; ")}`,
      `Newsletter letters: ${letters.map((l) => l.title).join("; ")}`,
      `YouTube vlogs: ${videos.slice(0, 10).map((v) => v.title).join("; ")}`,
      `GitHub repos: ${repos.slice(0, 40).map((r) => (r.description ? `${r.name} (${r.description})` : r.name)).join("; ")}`,
    ].join("\n"),
  );

  return (
    <RetroTV
      className={vt323.variable}
      story={STORY_PARAGRAPHS}
      posts={posts.map((p) => ({ href: `/posts/${p.slug.current}`, title: p.title, description: p.description, date: p.date }))}
      letters={letters.map((l) => ({ href: l.link, title: l.title, date: l.pubDate, excerpt: l.excerpt }))}
      videos={videos.slice(0, 12)}
      gallery={gallery.slice(0, 14).map(({ id, img, caption, meta }) => ({ id, img, caption, meta }))}
      repos={repos}
      life={life}
      dreams={pins.flatMap((p) => (p.type === "image" ? [{ src: p.src, line: p.caption }] : []))}
      host={host}
    />
  );
}
