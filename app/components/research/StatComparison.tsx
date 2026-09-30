"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function useCountUp(target: number, duration = 1.8) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(id);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [isInView, target, duration]);

  return { count, ref };
}

export default function StatComparison({ className = "" }: { className?: string }) {
  const { count: focusedCount, ref: focusedRef } = useCountUp(5, 1.2);
  const { count: traditionalCount, ref: traditionalRef } = useCountUp(24, 1.8);
  const barRef = useRef(null);
  const barInView = useInView(barRef, { once: true, amount: 0.5 });

  return (
    <div ref={barRef} className={`flex flex-col md:flex-row items-stretch gap-8 md:gap-16 ${className}`}>
      <motion.div
        ref={focusedRef}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="flex-1"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-3" style={{ fontFamily: "var(--font-geist), sans-serif" }}>
          Focused study
        </p>
        <span className="text-5xl md:text-6xl font-bold tracking-tight text-accent" style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}>
          {focusedCount > 0 ? `4–${focusedCount}` : "0"}
        </span>
        <span className="text-lg text-neutral-400 ml-2">months</span>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">to finish CBSE syllabus through 11th</p>
        <div className="mt-4 h-1.5 w-full rounded-full bg-neutral-200/60 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={barInView ? { width: "22%" } : { width: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.div>

      <div className="hidden md:block w-px bg-neutral-200/80 self-stretch" />

      <motion.div
        ref={traditionalRef}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="flex-1"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-3" style={{ fontFamily: "var(--font-geist), sans-serif" }}>
          Traditional school
        </p>
        <span className="text-5xl md:text-6xl font-bold tracking-tight text-neutral-300" style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}>
          {traditionalCount}
        </span>
        <span className="text-lg text-neutral-400 ml-2">months</span>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">standard school timeline for the same content</p>
        <div className="mt-4 h-1.5 w-full rounded-full bg-neutral-200/60 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-neutral-300"
            initial={{ width: 0 }}
            animate={barInView ? { width: "100%" } : { width: 0 }}
            transition={{ duration: 1.2, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.div>
    </div>
  );
}
