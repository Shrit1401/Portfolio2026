"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const monthData = [
  { month: "Jan", value: 55 },
  { month: "Feb", value: 65 },
  { month: "Mar", value: 90 },
  { month: "Apr", value: 60 },
  { month: "May", value: 50 },
  { month: "Jun", value: 45 },
  { month: "Jul", value: 55 },
  { month: "Aug", value: 95 },
  { month: "Sep", value: 70 },
  { month: "Oct", value: 50 },
  { month: "Nov", value: 40 },
  { month: "Dec", value: 20 },
];

function getBarColor(month: string) {
  if (month === "Aug" || month === "Mar") return "var(--color-accent)";
  if (month === "Dec") return "#c9726a";
  return "var(--color-chart-muted)";
}

export default function MonthlyActivityChart({ className = "" }: { className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [hovered, setHovered] = useState<number | null>(null);
  const maxValue = Math.max(...monthData.map((d) => d.value));

  return (
    <div ref={ref} className={className}>
      <p
        className="mb-1 text-xs font-medium uppercase tracking-widest text-neutral-400"
        style={{ fontFamily: "var(--font-geist), sans-serif" }}
      >
        Google Trends
      </p>
      <p className="mb-6 text-neutral-600 text-sm" style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontStyle: "italic" }}>
        Homeschooling search interest by month
      </p>

      <div className="flex items-end gap-[6px] md:gap-2" style={{ height: 180 }}>
        {monthData.map((d, i) => {
          const heightPx = (d.value / maxValue) * 160;
          const isHighlight = d.month === "Aug" || d.month === "Mar";
          const isLow = d.month === "Dec";

          return (
            <div
              key={d.month}
              className="relative flex flex-1 flex-col items-center justify-end h-full"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {hovered === i && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-8 rounded bg-neutral-800 px-2 py-1 text-[11px] text-white whitespace-nowrap z-10"
                >
                  {d.month} — {isHighlight ? "Peak" : isLow ? "Lowest" : `${d.value}%`}
                </motion.div>
              )}
              <motion.div
                className="w-full rounded-t cursor-pointer"
                style={{ backgroundColor: getBarColor(d.month) }}
                initial={{ height: 0, opacity: 0 }}
                animate={
                  inView
                    ? { height: heightPx, opacity: hovered === i ? 1 : isHighlight ? 0.85 : 0.5 }
                    : { height: 0, opacity: 0 }
                }
                transition={{
                  height: { duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.3 },
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-[6px] md:gap-2">
        {monthData.map((d) => (
          <div key={d.month} className="flex-1 text-center">
            <span className="text-[10px] text-neutral-400">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
