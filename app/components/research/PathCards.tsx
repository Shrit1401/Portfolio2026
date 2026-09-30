"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type PathKey = "1-8" | "9-12";

const paths: Record<PathKey, { title: string; subtitle: string; points: string[]; link?: { label: string; url: string } }> = {
  "1-8": {
    title: "Classes 1–8",
    subtitle: "Self-directed learning",
    points: [
      "No board registration required",
      "Kids can self-learn at home freely",
      "Keep informal records or report cards",
      "No official exams needed",
    ],
  },
  "9-12": {
    title: "Classes 9–12",
    subtitle: "NIOS pathway",
    points: [
      "Register with NIOS (National Institute of Open Schooling)",
      "Study specific board chapters",
      "Show up for practicals and exams",
      "Get an officially recognized certificate",
    ],
    link: { label: "Visit NIOS", url: "https://nios.ac.in/" },
  },
};

export default function PathCards({ className = "" }: { className?: string }) {
  const [active, setActive] = useState<PathKey>("1-8");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <div className="relative flex gap-6 mb-6 border-b border-neutral-200/80">
        {(["1-8", "9-12"] as PathKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              active === key ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
            }`}
            style={{ fontFamily: "var(--font-geist), sans-serif" }}
          >
            {paths[key].title}
            {active === key && (
              <motion.div
                layoutId="path-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-800"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-4" style={{ fontFamily: "var(--font-geist), sans-serif" }}>
            {paths[active].subtitle}
          </p>
          <ul className="space-y-3">
            {paths[active].points.map((point, i) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                className="flex items-start gap-3 text-[0.95rem] text-neutral-700 leading-relaxed"
              >
                <svg className="mt-[5px] h-3.5 w-3.5 shrink-0 text-accent" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {point}
              </motion.li>
            ))}
          </ul>
          {paths[active].link && (
            <a
              href={paths[active].link!.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              style={{ fontFamily: "var(--font-geist), sans-serif" }}
            >
              {paths[active].link!.label}
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
              </svg>
            </a>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
