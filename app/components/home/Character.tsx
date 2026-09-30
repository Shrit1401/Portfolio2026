"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const StatueModel = dynamic(() => import("../StatueModel"), { ssr: false });

/** The 3D me. Three.js only loads once this scrolls near the viewport. */
export default function Character() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="mx-auto h-[400px] w-full max-w-lg cursor-grab active:cursor-grabbing sm:h-[520px]">
          {near && <StatueModel />}
        </div>
      </div>
      <p className="mt-1 font-serif text-2xl text-ink">Shrit Shrivastava</p>
      <p className="font-instrument text-lg italic text-muted">yep that&apos;s me</p>
    </div>
  );
}
