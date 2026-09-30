"use client";

import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Swaps text by sliding the old line up and the new one in from below (e.g. Photos → Drawings). */
export function SwapText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-flex overflow-hidden align-bottom ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          className="inline-block"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Hover roll: the label slides up and an identical copy rolls in from below. Parent needs `group`. */
export function RollText({ children }: { children: string }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 inline-block translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

/** Masked slide-up for a single line of text as it scrolls into view. */
export function RevealText({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    // Observe the mask, not the line: the line starts clipped out of view, so it would never intersect.
    <motion.span
      className="inline-block overflow-hidden pb-[0.08em] align-bottom"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-40px" }}
    >
      <motion.span
        className="inline-block"
        variants={{ hidden: { y: "105%" }, shown: { y: "0%" } }}
        transition={{ duration: 0.7, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

/** Soft fade + rise for blocks as they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  ...rest
}: { children: ReactNode; delay?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
