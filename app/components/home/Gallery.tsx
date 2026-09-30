"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { GalleryItem } from "@/app/lib/gallery";

function Tile({ item, onOpen }: { item: GalleryItem; onOpen: (item: GalleryItem) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group press mr-3 flex shrink-0 flex-col self-start text-left"
    >
      <span className="block h-44 overflow-hidden rounded-lg bg-line sm:h-56">
        {/* Mixed Sanity + local sources; a plain img keeps the strip cheap. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.img}
          alt=""
          decoding="async"
          // One retry covers a request that failed mid-deploy or on a flaky connection.
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.retried) return;
            img.dataset.retried = "1";
            window.setTimeout(() => {
              img.src = `${item.img}${item.img.includes("?") ? "&" : "?"}r=1`;
            }, 800);
          }}
          className="h-full w-auto max-w-none object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </span>
      {/* w-0 + min-w-full: caption wraps to the image's width instead of widening the tile. */}
      <span className="mt-2 w-0 min-w-full text-[13px] leading-snug text-ink/75 group-hover:text-ink">
        {item.caption}
      </span>
      {item.meta && (
        <span className="mt-0.5 w-0 min-w-full text-[11px] text-accent">{item.meta}</span>
      )}
    </button>
  );
}

function Row({
  items,
  reverse,
  onOpen,
}: {
  items: GalleryItem[];
  reverse?: boolean;
  onOpen: (item: GalleryItem) => void;
}) {
  return (
    <div className="group/marquee overflow-hidden">
      <div
        className="flex w-max group-hover/marquee:[animation-play-state:paused] motion-safe:animate-[marquee_var(--dur)_linear_infinite] motion-reduce:overflow-x-auto"
        style={{
          ["--dur" as string]: `${items.length * 7}s`,
          animationDirection: reverse ? "reverse" : undefined,
        }}
      >
        {[0, 1].map((copy) =>
          items.map((item) => (
            <div key={`${copy}-${item.id}`} aria-hidden={copy === 1 || undefined} className={copy === 1 ? "flex motion-reduce:hidden" : "flex"}>
              <Tile item={item} onOpen={onOpen} />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

/** "gallery of things": two slow endless rows drifting opposite ways; hover pauses, click opens. */
export default function Gallery({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!items.length) return null;
  const half = Math.ceil(items.length / 2);

  return (
    <>
      <div className="-mx-4 flex flex-col gap-5 py-6 sm:mx-0 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <Row items={items.slice(0, half)} onOpen={setOpen} />
        <Row items={items.slice(half)} reverse onOpen={setOpen} />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={open.caption}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-paper p-3 pb-5 shadow-2xl"
              initial={{ y: 16, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 8, scale: 0.98, opacity: 0, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={open.img} alt={open.caption} className="max-h-[65vh] w-full rounded-md object-contain" />
              <div className="px-1 pt-4">
                <p className="text-lg leading-snug text-ink">{open.caption}</p>
                {open.meta && <p className="mt-0.5 text-xs text-accent">{open.meta}</p>}
                {open.story && (
                  <p className="mt-3 text-sm leading-relaxed text-ink/80">{open.story}</p>
                )}
                <div className="mt-4 flex items-center justify-between text-sm">
                  {open.href ? (
                    <a
                      href={open.href}
                      target={open.href.startsWith("/") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="link"
                    >
                      learn more
                    </a>
                  ) : (
                    <span />
                  )}
                  <button type="button" onClick={() => setOpen(null)} className="press text-muted hover:text-ink">
                    close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
