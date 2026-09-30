"use client";

import { useEffect, useState } from "react";

const POSES = [
  { name: "happy", label: "happy" },
  { name: "hi", label: "saying hi" },
  { name: "hairflip", label: "hair flip" },
  { name: "thinking", label: "thinking" },
  { name: "shook", label: "shook" },
  { name: "unimpressed", label: "unimpressed" },
  { name: "stressed", label: "deadline tomorrow" },
  { name: "laughing", label: "laughing at my own joke" },
  { name: "peace", label: "peace" },
  { name: "heart", label: "sending love" },
].map((p) => ({ ...p, src: `/me/${p.name}.gif`, poster: `/me/${p.name}.jpg` }));

const CYCLE_MS = 3200;

/** Looping clips of me cut from one video; cycles on its own, hover or click skips ahead. */
export default function PoseGif() {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));

  const show = (i: number) => {
    setLoaded((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
    setIndex(i);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => show((index + 1) % POSES.length), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [index]);

  return (
    <figure className="w-full">
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-line shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
        onMouseEnter={() => show((index + 1) % POSES.length)}
        onClick={() => show((index + 1) % POSES.length)}
      >
        {POSES.map((pose, i) => (
          // GIFs need a plain <img>; next/image would re-encode them to a still frame.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={pose.name}
            src={loaded.has(i) ? pose.src : pose.poster}
            alt={i === index ? `Shrit, ${pose.label}` : ""}
            aria-hidden={i !== index}
            width={300}
            height={375}
            fetchPriority={i === 0 ? "high" : "low"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </figure>
  );
}
