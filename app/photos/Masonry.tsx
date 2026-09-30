"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Column count for a board width: 2 on phones, up to 5 on wide screens. */
const columnsFor = (width: number) => Math.max(2, Math.min(5, Math.floor(width / 250)));

/**
 * Masonry that fills columns in reading order, always dropping the next pin into the shortest column.
 * (CSS columns balance by height instead, which leaves empty or near-empty columns when a few pins are tall.)
 * `weights` are each pin's height relative to its width, estimated on the server.
 */
export default function Masonry({ items, weights }: { items: ReactNode[]; weights: number[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCols(columnsFor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Before the first measurement (server render), fall back to CSS columns so nothing jumps without JS.
  if (cols === null) {
    return (
      <div ref={ref} className="columns-2 gap-3.5 sm:gap-4 md:columns-3 lg:columns-4 2xl:columns-5">
        {items.map((item, i) => (
          <div key={i} className="mb-6 break-inside-avoid">{item}</div>
        ))}
      </div>
    );
  }

  const heights = Array(cols).fill(0);
  const columns: ReactNode[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => {
    const c = heights.indexOf(Math.min(...heights));
    columns[c].push(<div key={i} className="mb-6">{item}</div>);
    heights[c] += weights[i] + 0.12; // + gap
  });

  return (
    <div ref={ref} className="flex items-start gap-3.5 sm:gap-4">
      {columns.map((col, c) => (
        <div key={c} className="min-w-0 flex-1">{col}</div>
      ))}
    </div>
  );
}
