import Link from "next/link";
import Navbar from "../Navbar";
import Footer from "../Footer";
import SectionHeading from "../SectionHeading";
import PostCards from "../PostCards";
import PostList from "../PostList";
import PoseGif from "./PoseGif";
import Character from "./Character";
import VideoCarousel from "./VideoCarousel";
import Gallery from "./Gallery";
import StoryText from "./StoryText";
import SubscribeForm from "../SubscribeForm";
import NowPlaying from "../NowPlaying";
import { FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiSubstack } from "react-icons/si";
import { Reveal } from "../motion";
import { STORY_PARAGRAPHS } from "../../lib/story";
import { getAllResearch } from "../../lib/researchData";
import { getSubstackPosts } from "../../lib/substackFeed";
import { getYouTubeVideos } from "../../lib/youtube";
import { getGalleryItems } from "../../lib/gallery";
import { EMAIL, SUBSTACK_URL, TWITTER_URL, YOUTUBE_SUBSCRIBE_URL, YOUTUBE_URL } from "../../lib/links";

/** The homepage body, shared by `/` and the dark variant at `/e`. */
export default async function HomePage() {
  const [letters, videos, gallery] = await Promise.all([
    getSubstackPosts(5),
    getYouTubeVideos(),
    getGalleryItems(),
  ]);
  const posts = getAllResearch();

  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-8">
        {/* Welcome: me on the left, my story on the right, contact rail on wide screens. */}
        <section className="grid grid-cols-1 gap-8 pt-8 md:grid-cols-[240px_1fr] md:gap-14 lg:grid-cols-[260px_1fr_320px] xl:gap-16">
          <div className="mx-auto w-56 md:sticky md:top-8 md:mx-0 md:w-full md:self-start">
            <Reveal>
              <PoseGif />
            </Reveal>
            <NowPlaying className="mt-3" />
          </div>

          <div className="text-[18.5px] leading-[1.7] tracking-[-0.008em] text-ink/90">
            <Reveal delay={0.08}>
              <h1 className="mb-3 text-[22px] font-semibold tracking-[-0.01em] text-ink">Welcome!</h1>
              <StoryText paragraphs={STORY_PARAGRAPHS} />
              <SubscribeForm className="mt-5" />
            </Reveal>
          </div>

          <aside className="text-[16.5px] leading-[1.7] text-ink/90 md:col-span-2 lg:col-span-1 lg:border-l lg:border-line lg:pl-8">
            <h2 className="mb-2 font-semibold text-ink">Get in touch</h2>
            <p>
              The quickest way to reach me is a DM on Twitter at{" "}
              <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer" className="link">
                @shrit1401
              </a>
              . Or send an email to{" "}
              <a href={`mailto:${EMAIL}`} className="link">
                {EMAIL}
              </a>
              .
            </p>

            <h2 className="mb-2 mt-6 font-semibold text-ink">Stay in the loop</h2>
            <p>I share what I&apos;m building in three places:</p>
            <ul className="mt-2 space-y-1.5">
              <li>
                <a
                  href={SUBSTACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-accent"
                >
                  <SiSubstack aria-hidden className="mt-[6px] h-3.5 w-3.5 shrink-0 text-[#ff6719]" />
                  <span>a weekly letter on Substack</span>
                </a>
              </li>
              <li>
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-accent"
                >
                  <FaYoutube aria-hidden className="mt-[6px] h-3.5 w-3.5 shrink-0 text-[#ff0033]" />
                  <span>a vlog every couple of weeks on YouTube</span>
                </a>
              </li>
              <li>
                <a
                  href={TWITTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-accent"
                >
                  <FaXTwitter aria-hidden className="mt-[6px] h-3.5 w-3.5 shrink-0 text-ink" />
                  <span>quick updates on Twitter</span>
                </a>
              </li>
            </ul>
          </aside>
        </section>

        <section className="mt-10">
          <Reveal>
            <Character />
          </Reveal>
        </section>

        <section className="mt-20">
          <SectionHeading action={<Link href="/posts">all posts →</Link>}>Posts</SectionHeading>
          <PostCards posts={posts} />
        </section>

        <section className="mt-20">
          <SectionHeading>
            gallery of <span className="font-instrument text-[1.1em] italic">things</span>
          </SectionHeading>
          <Gallery items={gallery} />
        </section>

        <section className="mt-20">
          <SectionHeading
            action={
              <a href={YOUTUBE_SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                <FaYoutube aria-hidden className="h-4 w-4 text-[#ff0033]" /> subscribe on YouTube ↗
              </a>
            }
          >
            Shipping, on video
          </SectionHeading>
          <div className="pt-5">
            <Reveal>
              <VideoCarousel videos={videos} />
            </Reveal>
          </div>
        </section>

        {letters.length > 0 && (
          <section className="mt-20">
            <SectionHeading
              action={
                <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                  <SiSubstack aria-hidden className="h-3.5 w-3.5 text-[#ff6719]" /> all issues on Substack ↗
                </a>
              }
            >
              The weekly letter
            </SectionHeading>
            <PostList
              items={letters.map((l) => ({
                href: l.link,
                title: l.title,
                description: l.description,
                date: l.pubDate,
                image: l.image,
                external: true,
              }))}
            />
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
