"use client";

import React, { useCallback, useEffect, useState, type FC } from "react";

type Result = {
  artist: string;
  isPlaying: boolean;
  songUrl: string;
  title: string;
  albumImageUrl: string;
  progressMs: number;
  durationMs: number;
  albumName: string;
};

type NowPlayingProps = {
  className?: string;
};

const NowPlaying: FC<NowPlayingProps> = ({ className }) => {
  const [result, setResult] = useState<Result | null>(null);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await fetch("/api/spotify/now-playing");
      if (!res.ok) return;
      const data: Result | null = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching now playing item:", error);
    }
  }, []);

  useEffect(() => {
    void fetchNowPlaying();
    const interval = setInterval(() => void fetchNowPlaying(), 10000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  if (!result?.isPlaying) return null;

  return (
    <>
      <style>{`
        @keyframes hero-now-playing-bar {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        .hero-now-playing-icon {
          display: inline-flex;
          align-items: flex-end;
          gap: 2px;
          height: 12px;
          color: rgba(23, 23, 23, 0.75);
        }
        .hero-now-playing-icon span {
          display: block;
          width: 3px;
          height: 12px;
          background: currentColor;
          border-radius: 1px;
          transform-origin: bottom;
          animation: hero-now-playing-bar 0.75s ease-in-out infinite;
        }
        .hero-now-playing-icon span:nth-child(2) { animation-delay: 0.2s; }
        .hero-now-playing-icon span:nth-child(3) { animation-delay: 0.4s; }
        .hero-spotify-card {
          box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
        }
      `}</style>
      <span
        className={`relative inline-flex flex-col items-end group/spotify ${className ?? ""}`}
      >
        <span className="flex items-center gap-2 text-gray-600 min-w-0">
          <span className="hero-now-playing-icon shrink-0" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="min-w-0 text-right">
            Now listening to{" "}
            <a
              href={result.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/80 underline decoration-black/20 underline-offset-2 hover:decoration-black/40 truncate inline-block max-w-[200px] md:max-w-[260px] align-bottom rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
            >
              {result.title}
            </a>
          </span>
        </span>
        <div
          className="absolute right-0 bottom-full z-[60] flex flex-col items-end pb-2 opacity-0 invisible translate-y-1 pointer-events-none transition-all duration-200 ease-out group-hover/spotify:opacity-100 group-hover/spotify:visible group-hover/spotify:translate-y-0 group-hover/spotify:pointer-events-auto group-focus-within/spotify:opacity-100 group-focus-within/spotify:visible group-focus-within/spotify:translate-y-0 group-focus-within/spotify:pointer-events-auto"
          role="presentation"
        >
          <a
            href={result.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${result.title} by ${result.artist} — open in Spotify`}
            className="hero-spotify-card flex w-[min(90vw,268px)] gap-3 rounded-xl border border-black/[0.08] bg-background/95 p-3 text-left backdrop-blur-md no-underline transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
            style={{ fontFamily: "inherit" }}
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/[0.06] shadow-inner">
              {result.albumImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.albumImageUrl}
                  alt=""
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-black/35">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3h12M9 10l12-2"
                    />
                  </svg>
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <p className="text-sm font-medium leading-snug text-black/90 line-clamp-2">
                {result.title}
              </p>
              <p className="mt-1 text-xs text-black/55 line-clamp-2">
                {result.artist}
              </p>
              {result.albumName ? (
                <p className="mt-1.5 text-[11px] uppercase tracking-[0.12em] text-black/40 line-clamp-1">
                  {result.albumName}
                </p>
              ) : null}
              <p className="mt-2 text-[11px] text-black/35">Spotify →</p>
            </div>
          </a>
        </div>
      </span>
    </>
  );
};

export default NowPlaying;
