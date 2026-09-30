"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { NowPlaying as Track } from "@/app/lib/spotify";

const POLL_MS = 15000;

/** "now listening to …" with bouncing bars; renders nothing unless something is playing. */
export default function NowPlaying({ className = "" }: { className?: string }) {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/spotify/now-playing");
        if (res.ok && alive) setTrack(await res.json());
      } catch {
        /* offline: keep the last value */
      }
    };
    void load();
    const id = window.setInterval(load, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <AnimatePresence>
      {track?.isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`group/spotify relative text-[13px] text-muted ${className}`}
        >
          <a
            href={track.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-start gap-2 leading-snug"
          >
            <span aria-hidden className="mt-[3px] flex h-3 shrink-0 items-end gap-[2px] text-[#1db954]">
              {[0, 0.2, 0.4].map((d) => (
                <span
                  key={d}
                  className="block h-3 w-[3px] origin-bottom rounded-[1px] bg-current motion-safe:animate-[eq_0.8s_ease-in-out_infinite]"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </span>
            <span className="min-w-0">
              now listening to{" "}
              <span className="text-ink underline decoration-line underline-offset-2 group-hover/spotify:decoration-ink/40">
                {track.title}
              </span>
            </span>
          </a>

          {/* Album card on hover */}
          <div className="pointer-events-none invisible absolute bottom-full left-0 z-40 origin-bottom-left translate-y-1 scale-[0.97] pb-2 opacity-0 transition-[opacity,translate,scale,visibility] duration-200 ease-out group-hover/spotify:visible group-hover/spotify:translate-y-0 group-hover/spotify:scale-100 group-hover/spotify:opacity-100">
            <div className="flex w-64 gap-3 rounded-xl border border-line bg-paper p-3 shadow-lg">
              {track.albumImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={track.albumImageUrl} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
              )}
              <div className="min-w-0">
                <p className="text-sm leading-snug text-ink">{track.title}</p>
                <p className="mt-0.5 text-xs text-muted">{track.artist}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted/80">{track.albumName}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
