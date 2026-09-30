"use client";

import { motion } from "framer-motion";
import type { PastTimelineChapter, PastTimelineEvent } from "@/app/lib/pastTimeline";
import drawings from "@/app/lib/pastDrawings.json";

const DRAWINGS = drawings as Record<string, string>;

export type ChapterGroup = { chapter: PastTimelineChapter; events: PastTimelineEvent[] };

/** Hand-drawn MS Paint-ish squiggle used as a chapter divider. */
function Squiggle() {
  return (
    <svg viewBox="0 0 120 12" className="h-3 w-24 text-accent" aria-hidden>
      <motion.path
        d="M2 6 C 12 0, 18 12, 28 6 S 44 0, 54 6 S 70 12, 80 6 S 96 0, 106 6 S 116 10, 118 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />
    </svg>
  );
}

function Event({ event, flip }: { event: PastTimelineEvent; flip: boolean }) {
  const drawing = DRAWINGS[`${event.date.trim()}|${event.title.trim()}`];
  const front = drawing ?? event.image;

  return (
    <motion.li
      className={`grid items-center gap-5 py-10 md:grid-cols-2 md:gap-12 ${flip ? "md:[&>*:first-child]:order-2" : ""}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {front ? (
        <motion.div
          className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-white"
          whileHover={{ rotate: flip ? 1 : -1, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={front} alt={event.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          {drawing && event.image && (
            <>
              {/* The real photo sits under the drawing and shows on hover. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.image}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] text-muted transition-opacity group-hover:opacity-0">
                hover for the real one
              </span>
            </>
          )}
        </motion.div>
      ) : (
        <div />
      )}

      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-accent">{event.date}</p>
        <h3 className="mt-1 text-2xl leading-snug tracking-[-0.01em] text-ink">{event.title}</h3>
        <p className="mt-2 text-[15.5px] leading-[1.75] text-ink/80">{event.story}</p>
      </div>
    </motion.li>
  );
}

export default function PastTimeline({ chapters }: { chapters: ChapterGroup[] }) {
  let n = 0;
  return (
    <>
      {chapters.map(({ chapter, events }, ci) => (
        <section key={chapter.id} className="mt-16">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-mono text-xs text-muted">{String(ci + 1).padStart(2, "0")}</span>
            <h2 className="font-instrument text-4xl italic text-ink sm:text-5xl">{chapter.title}</h2>
            <Squiggle />
          </motion.div>
          <ol className="divide-y divide-line">
            {events.map((event) => (
              <Event key={`${event.date}-${event.title}`} event={event} flip={n++ % 2 === 1} />
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
