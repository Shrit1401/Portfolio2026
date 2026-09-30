"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type MouseEvent } from "react";

type Preview = { src: string; poster?: string; caption?: string; x: number; y: number };

/** Renders the story paragraphs; links with data-preview pop an image (or muted .mp4) card next to the cursor. */
export default function StoryText({ paragraphs }: { paragraphs: string[] }) {
  const [preview, setPreview] = useState<Preview | null>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-preview]");
    if (!a) return setPreview(null);
    setPreview({
      src: a.dataset.preview!,
      poster: a.dataset.poster,
      caption: a.dataset.caption,
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div onMouseMove={onMove} onMouseLeave={() => setPreview(null)}>
      {paragraphs.map((html, i) => (
        <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: html }} />
      ))}

      <AnimatePresence>
        {preview && (
          <motion.figure
            key={preview.src}
            className="pointer-events-none fixed z-50 hidden w-72 rounded-md bg-card p-1.5 shadow-xl md:block"
            style={{ left: preview.x + 18, top: preview.y - 90 }}
            initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
          >
            {preview.src.endsWith(".mp4") ? (
              <video
                src={preview.src}
                poster={preview.poster}
                autoPlay
                muted
                loop
                playsInline
                className="w-full rounded-sm"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.src} alt="" className="max-h-72 w-full rounded-sm object-cover object-top" />
            )}
            {preview.caption && (
              <figcaption className="px-1 pb-0.5 pt-1.5 text-[11px] text-muted">{preview.caption}</figcaption>
            )}
          </motion.figure>
        )}
      </AnimatePresence>
    </div>
  );
}
