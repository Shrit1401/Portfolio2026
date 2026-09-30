"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { youtubeFrames, youtubeThumb, youtubeUrl, type YouTubeVideo } from "@/app/lib/youtube";

export default function VideoCarousel({ videos }: { videos: YouTubeVideo[] }) {
  const track = useRef<HTMLUListElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={track}
        data-lenis-prevent
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
      >
        {videos.map((v) => (
          <li key={v.id} className="w-[86%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/2.4)]">
            <a
              href={youtubeUrl(v.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="group press block"
            >
              <FlipbookThumb id={v.id} />
              <p className="mt-2.5 text-[15px] leading-snug text-ink">{v.title}</p>
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-end gap-2">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => scroll(dir)}
            aria-label={dir < 0 ? "Previous videos" : "Next videos"}
            className="press grid h-9 w-9 place-items-center rounded-full border border-line text-sm text-ink/70 hover:border-ink/30 hover:text-ink"
          >
            {dir < 0 ? "←" : "→"}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Thumbnail that flips through YouTube's auto-captured frames on hover, like a little GIF. */
function FlipbookThumb({ id }: { id: string }) {
  const frames = [youtubeThumb(id), ...youtubeFrames(id)];
  const [playing, setPlaying] = useState(false);
  // Frames only load after the first hover.
  const [warm, setWarm] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!playing) return setFrame(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setFrame(1);
    const t = window.setInterval(() => setFrame((f) => (f % (frames.length - 1)) + 1), 550);
    return () => window.clearInterval(t);
  }, [playing, frames.length]);

  const start = () => {
    setWarm(true);
    setPlaying(true);
  };

  return (
    <div
      className="relative aspect-video overflow-hidden rounded-sm bg-line"
      onPointerEnter={start}
      onPointerLeave={() => setPlaying(false)}
      onFocus={start}
      onBlur={() => setPlaying(false)}
    >
      {frames.map((src, i) =>
        i === 0 || warm ? (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="(min-width: 1024px) 560px, (min-width: 640px) 50vw, 86vw"
            className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
              i === frame ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null,
      )}
      <span className="absolute bottom-2.5 left-2.5 translate-y-1 rounded-sm bg-ink/80 px-2 py-0.5 text-xs text-paper opacity-0 transition-[opacity,translate] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        ▶ watch
      </span>
    </div>
  );
}
