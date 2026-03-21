"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FC,
} from "react";
import gsap from "gsap";
import Newsletter from "./Newsletter";
import HeroDiorama from "./HeroDiorama";
import HeroFluidCanvas from "./HeroFluidCanvas";
import {
  LOADER_EXIT_START,
  LOADER_EXIT_FALLBACK_MS,
} from "../lib/loader-events";

// Constants
const COLORS = {
  burgundy: "#7B3737",
  olive: "#3B4F1B",
  ochre: "#B89B2B",
  purple: "#6B46C1",
  teal: "#2C7A7B",
  coral: "#E53E3E",
} as const;

const ANIMATION_DELAYS = {
  shapes: 0.06,
  text: 0.28,
  globe: 0.1,
  bottom: 0.5,
  dontClick: 0.62,
  scrollDown: 0.7,
  newsletter: 0.36,
  subtext: 0.44,
  buttons: 0.52,
} as const;

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

const TimeDisplay: FC = () => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return <div className="text-sm text-gray-600">--:--:--</div>;
  return (
    <div className="text-sm text-gray-600">{time.toLocaleTimeString()}</div>
  );
};

const HeroText: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const shapesRef = useRef<(SVGSVGElement | null)[]>([]);
  const textRef = useRef<(HTMLSpanElement | null)[]>([]);
  const globeRef = useRef<SVGSVGElement>(null);
  const bottomElementsRef = useRef<HTMLDivElement>(null);
  const dontClickRef = useRef<HTMLDivElement>(null);
  const scrollDownRef = useRef<HTMLAnchorElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const forgeRef = useRef<HTMLDivElement>(null);
  const editorialRef = useRef<HTMLDivElement>(null);

  // Parallax on scroll — uses Lenis scroll event when available, falls back to window scroll
  useEffect(() => {
    const handleScroll = ({ scroll }: { scroll: number }) => {
      const y = scroll;
      if (forgeRef.current)
        forgeRef.current.style.transform = `translate(22%, calc(-8% + ${-y * 0.35}px))`;
      if (editorialRef.current)
        editorialRef.current.style.transform = `translateY(calc(-50% + ${-y * 0.18}px)) rotate(-90deg)`;
    };

    const attachLenis = () => {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.on("scroll", handleScroll);
        return () => lenis.off("scroll", handleScroll);
      }
    };

    let cleanup: (() => void) | undefined;
    const tryAttach = () => {
      cleanup = attachLenis();
    };
    tryAttach();
    const retryId = window.setTimeout(() => {
      cleanup = cleanup ?? attachLenis();
    }, 300);

    return () => {
      window.clearTimeout(retryId);
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    const animateShapes = () => {
      shapesRef.current.forEach((shape, index) => {
        if (!shape) return;
        gsap.fromTo(
          shape,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            delay: ANIMATION_DELAYS.shapes + 0.12 + index * 0.08,
          },
        );
      });
    };

    const animateText = () => {
      textRef.current.forEach((text, index) => {
        if (!text) return;
        gsap.fromTo(
          text,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            delay: ANIMATION_DELAYS.text + index * 0.1,
          },
        );
      });
    };

    const animateGlobe = () => {
      // Globe spin removed — was a permanent 60fps GSAP tween with no visual payoff
    };

    const animateBottomElements = () => {
      const elements = [
        { ref: bottomElementsRef, delay: ANIMATION_DELAYS.bottom },
        { ref: dontClickRef, delay: ANIMATION_DELAYS.dontClick },
        { ref: scrollDownRef, delay: ANIMATION_DELAYS.scrollDown },
        { ref: newsletterRef, delay: ANIMATION_DELAYS.newsletter },
        { ref: subtextRef, delay: ANIMATION_DELAYS.subtext },
        { ref: buttonsRef, delay: ANIMATION_DELAYS.buttons },
      ];
      elements.forEach(({ ref, delay }) => {
        if (!ref.current) return;
        gsap.fromTo(
          ref.current,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            delay,
          },
        );
      });
    };

    let ran = false;
    const startEntrance = () => {
      if (ran) return;
      ran = true;
      window.clearTimeout(fallbackId);
      document.removeEventListener(LOADER_EXIT_START, startEntrance);
      setIsVisible(true);
      animateShapes();
      animateText();
      animateGlobe();
      animateBottomElements();
    };

    document.addEventListener(LOADER_EXIT_START, startEntrance, { once: true });
    const fallbackId = window.setTimeout(
      startEntrance,
      LOADER_EXIT_FALLBACK_MS,
    );
    return () => {
      window.clearTimeout(fallbackId);
      document.removeEventListener(LOADER_EXIT_START, startEntrance);
    };
  }, []);

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

  return (
    <>
      <style>{`
        .hero-text { font-family: 'Playfair Display', Georgia, serif; }
        .blackletter { font-family: 'UnifrakturCook', 'IM Fell English SC', serif; }

        .hero-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 24px; background: #171717; color: var(--background);
          border-radius: 999px; font-size: 0.875rem; font-family: inherit;
          letter-spacing: 0.01em; transition: background 0.2s, transform 0.15s;
          border: 1.5px solid #171717; cursor: pointer; text-decoration: none;
        }
        .hero-btn-primary:hover { background: #2e2e2e; transform: translateY(-1px); }

        .hero-btn-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 24px; background: transparent; color: #171717;
          border-radius: 999px; font-size: 0.875rem; font-family: inherit;
          letter-spacing: 0.01em; transition: background 0.2s, transform 0.15s;
          border: 1.5px solid rgba(0,0,0,0.1); cursor: pointer; text-decoration: none;
        }
        .hero-btn-secondary:hover { background: rgba(23,23,23,0.05); transform: translateY(-1px); }

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

      <div className="relative flex w-full flex-1 flex-col min-h-screen">
        <HeroFluidCanvas />
        {/* Light veil: keeps motion readable without killing the fluid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#f8f6f0]/35 via-[#f8f6f0]/12 to-transparent"
        />
        <section
        className="relative z-10 w-full flex-1 flex flex-col px-4 overflow-hidden"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        <HeroDiorama />

        {/* Grain */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="bg-noise absolute inset-0"
            style={{ opacity: 0.045, mixBlendMode: "multiply" }}
          />
        </div>

        {/* FORGE — ambient background word */}
        <div
          ref={forgeRef}
          aria-hidden="true"
          className="hidden md:block absolute top-0 right-0 select-none pointer-events-none z-0"
          style={{
            transform: "translate(22%, -8%)",
            fontSize: "clamp(180px, 22vw, 320px)",
            fontWeight: 800,
            color: "rgba(0,0,0,0.025)",
            filter: "blur(1.5px)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            fontFamily: "inherit",
            userSelect: "none",
          }}
        >
          FORGE
        </div>

        {/* Editorial vertical text */}
        <div
          ref={editorialRef}
          aria-hidden="true"
          className="hidden md:block absolute left-6 top-[45%] z-10 pointer-events-none select-none"
          style={{
            transform: "translateY(-50%) rotate(-90deg)",
            fontSize: "11px",
            letterSpacing: "0.22em",
            color: "rgba(0,0,0,0.35)",
            fontFamily: "inherit",
            fontWeight: 400,
            whiteSpace: "nowrap",
          }}
        >
          build → ship
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center flex-1 gap-8 lg:gap-0 py-16 lg:py-0 w-full max-w-[1800px] mx-auto">
          {/* LEFT — text */}
          <div className="lg:order-1 flex flex-col items-center text-center lg:flex-1 lg:px-6 xl:px-10">
            {/* Hero text */}
            <div className="hero-text text-5xl md:text-6xl lg:text-7xl text-neutral-900 leading-[1.22] tracking-[-0.01em] font-normal [text-shadow:0_1px_24px_rgba(255,255,255,0.75),0_0_1px_rgba(255,255,255,0.5)]">
              <span className="inline-flex items-center">
                <svg
                  ref={(el) => {
                    shapesRef.current[0] = el;
                  }}
                  width="48"
                  height="48"
                  className="inline-block mr-3 -mb-2"
                  viewBox="0 0 32 32"
                  style={{ opacity: 0 }}
                >
                  <path
                    d="M16 4L28 24H4L16 4Z"
                    fill={COLORS.burgundy}
                    stroke={COLORS.burgundy}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  ref={(el) => {
                    textRef.current[0] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  I <span className="italic ml-2">am</span>
                </span>
              </span>
              <br />
              <span className="inline-flex items-center">
                <span
                  ref={(el) => {
                    textRef.current[1] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  <span className="blackletter text-6xl mr-2">B</span>uilding
                </span>
                <svg
                  ref={(el) => {
                    shapesRef.current[1] = el;
                  }}
                  width="48"
                  height="48"
                  className="inline-block ml-3 -mb-2"
                  viewBox="0 0 32 32"
                  style={{ opacity: 0 }}
                >
                  <rect
                    x="4"
                    y="4"
                    width="24"
                    height="24"
                    rx="6"
                    fill={COLORS.olive}
                  />
                </svg>
              </span>
              <br />
              <span className="inline-flex items-center">
                <span
                  ref={(el) => {
                    textRef.current[2] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  <span className="italic underline decoration-gray-500 decoration-2 underline-offset-4">
                    cool
                  </span>
                </span>
                <svg
                  ref={(el) => {
                    shapesRef.current[2] = el;
                  }}
                  width="48"
                  height="48"
                  className="inline-block mx-3 -mb-2"
                  viewBox="0 0 32 32"
                  style={{ opacity: 0 }}
                >
                  <circle cx="16" cy="16" r="16" fill={COLORS.ochre} />
                </svg>
                <span
                  ref={(el) => {
                    textRef.current[3] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  stuff
                </span>
              </span>
            </div>

            {/* Subtext */}
            <div
              ref={subtextRef}
              style={{ opacity: 0 }}
              className="mt-5 text-sm md:text-base text-neutral-700 max-w-md leading-relaxed tracking-wide [text-shadow:0_1px_16px_rgba(255,255,255,0.9)]"
            >
              Products, interfaces & ideas — built with craft and curiosity.
            </div>

            {/* CTA buttons */}
            <div
              ref={buttonsRef}
              style={{ opacity: 0 }}
              className="flex items-center gap-2 mt-7"
            >
              <a href="/work" className="hero-btn-primary">
                View Projects
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
            </div>

            {/* Divider + Newsletter */}
            <div
              ref={newsletterRef}
              style={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-3 mb-8 mt-8">
                <div
                  style={{
                    width: "clamp(40px, 6vw, 80px)",
                    height: "1px",
                    background: "rgba(23,23,23,0.18)",
                  }}
                />
                <div
                  style={{
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    background: "rgba(23,23,23,0.3)",
                  }}
                />
                <div
                  style={{
                    width: "clamp(40px, 6vw, 80px)",
                    height: "1px",
                    background: "rgba(23,23,23,0.18)",
                  }}
                />
              </div>
              <Newsletter className="mt-0" />
            </div>
          </div>
          {/* end LEFT column */}
        </div>

        {/* Bottom-left: name + location + time */}
        <div
          ref={bottomElementsRef}
          className="absolute bottom-4 md:bottom-8 left-4 md:left-8 z-20 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center gap-2">
            <svg
              ref={globeRef}
              className="w-4 h-4 md:w-5 md:h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs md:text-sm text-black/80">
              Shrit Shrivastava
            </span>
            <span className="text-xs md:text-sm text-gray-500">•</span>
            <span className="text-xs md:text-sm text-black/80">India</span>
            <TimeDisplay />
          </div>
        </div>

        {/* Bottom-right: Made To Amaze + Spotify */}
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 z-20 flex flex-col items-end gap-2 md:gap-3 max-w-[min(100vw-2rem,420px)]">
          <div
            ref={dontClickRef}
            className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs md:text-sm text-black/80 transition-all duration-300"
            style={{ opacity: 0 }}
          >
            <span className="whitespace-nowrap">Made To Amaze</span>
            {result?.isPlaying ? (
              <span className="relative inline-flex flex-col items-end group/spotify">
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
                      <p className="mt-2 text-[11px] text-black/35">
                        Spotify →
                      </p>
                    </div>
                  </a>
                </div>
              </span>
            ) : null}
          </div>
          <a
            ref={scrollDownRef}
            href="/work"
            className="md:hidden"
            aria-label="Scroll down"
            style={{ opacity: 0 }}
          >
            <svg
              className="w-6 h-6 text-gray-700 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>

        {/* Desktop scroll arrow — centered */}
        <a
          ref={scrollDownRef}
          href="/work"
          className="absolute bottom-4 md:bottom-8 left-1/2 z-20 -translate-x-1/2 hidden md:block"
          aria-label="Scroll down"
          style={{ opacity: 0 }}
        >
          <svg
            className="w-8 h-8 text-gray-700 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </a>
      </section>
      </div>
    </>
  );
};

export default HeroText;
