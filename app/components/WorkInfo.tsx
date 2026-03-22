"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getWorks } from "@/app/lib/server";
import { Work } from "../lib/types";
import { urlFor } from "@/sanity/lib/image";
import {
  MdArrowOutward,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";

gsap.registerPlugin(ScrollTrigger);

type LenisWindow = Window & {
  lenis?: {
    scroll: number;
    scrollTo: (y: number, opts?: { duration?: number }) => void;
    on: (e: string, fn: () => void) => void;
    off: (e: string, fn: () => void) => void;
  };
};

function getLenis() {
  return (window as LenisWindow).lenis;
}

/** Lenis exposes animated scroll; fall back for pages without smooth scroll. */
function getScrollY(): number {
  const lenis = getLenis();
  if (lenis != null && typeof lenis.scroll === "number") {
    return lenis.scroll;
  }
  return typeof window !== "undefined" ? window.scrollY : 0;
}

function scrollWindowTo(y: number, durationSec = 1.15) {
  const lenis = getLenis();
  if (lenis?.scrollTo) {
    lenis.scrollTo(y, { duration: durationSec });
  } else {
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

function projectPrimaryHref(project: Work): string {
  const first = project.usefullinks?.[0]?.link;
  return first ?? "https://github.com/Shrit1401?tab=repositories";
}

function layerOpacities(
  count: number,
  floatSeg: number,
  reduceMotion: boolean,
): number[] {
  const out = new Array(count).fill(0);
  if (count === 0) return out;
  if (reduceMotion || count === 1) {
    const i = count === 1 ? 0 : Math.min(count - 1, Math.round(floatSeg));
    out[i] = 1;
    return out;
  }
  const from = Math.floor(floatSeg);
  const to = Math.min(count - 1, from + 1);
  const t = floatSeg - from;
  if (from === to) {
    out[from] = 1;
  } else {
    out[from] = 1 - t;
    out[to] = t;
  }
  return out;
}

const GRAIN_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
);

const SLIDER_TRIGGER_ID = "workinfo-slider";
/** Viewport heights of scroll track per slide (higher = slower / more scroll per project). */
const VH_PER_SLIDE = 280;
const AUTO_ROTATE_MS = 12_000;
const SCROLL_DURATION_BASE = 1.12;
const SCROLL_DURATION_PER_STEP = 0.18;
const SCROLL_DURATION_MAX = 2.35;
const PROGRAMMATIC_SCROLL_IGNORE_MS = 2400;

const WorkInfo = () => {
  const [projects, setProjects] = useState<Work[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const bgLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastDiscreteRef = useRef(-1);
  const reduceMotionRef = useRef(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const countRef = useRef(0);
  const activeIndexRef = useRef(0);
  const ignoreProgrammaticScrollUntilRef = useRef(0);
  const pauseAutoFromHoverRef = useRef(false);
  const polaroidSectionRef = useRef<HTMLElement>(null);
  const autoCycleStartRef = useRef(0);
  const autoRingRectRef = useRef<SVGRectElement>(null);
  const autoCountdownRef = useRef<HTMLSpanElement>(null);
  const lastScrollYForAutoBumpRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mq.matches;
    const onChange = () => {
      reduceMotionRef.current = mq.matches;
      ScrollTrigger.refresh();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getWorks();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const count = projects.length;
  countRef.current = count;
  activeIndexRef.current = activeIndex;

  /* Lenis can emit scroll more than once per frame; coalesce to one ST update per paint. */
  useEffect(() => {
    let raf = 0;
    const bump = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        ScrollTrigger.update();
      });
    };
    const lenis = getLenis();
    if (lenis?.on) {
      lenis.on("scroll", bump);
      return () => {
        lenis.off("scroll", bump);
        if (raf) cancelAnimationFrame(raf);
      };
    }
    window.addEventListener("scroll", bump, { passive: true });
    return () => {
      window.removeEventListener("scroll", bump);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useLayoutEffect(() => {
    if (count === 0 || !sectionRef.current || !pinRef.current) return;

    const applyProgress = (p: number) => {
      const n = countRef.current;
      if (n === 0) return;
      const ms = Math.max(0, n - 1);
      const floatSeg = ms === 0 ? 0 : p * ms;
      const reduceMotion = reduceMotionRef.current;
      const opacities = layerOpacities(n, floatSeg, reduceMotion);

      for (let i = 0; i < n; i++) {
        const layer = bgLayerRefs.current[i];
        if (layer) gsap.set(layer, { opacity: opacities[i] });
      }

      if (progressFillRef.current) {
        gsap.set(progressFillRef.current, {
          scaleY: p,
          transformOrigin: "top center",
        });
      }

      const discrete = n <= 1 ? 0 : Math.min(n - 1, Math.round(p * ms));
      if (discrete !== lastDiscreteRef.current) {
        lastDiscreteRef.current = discrete;
        setActiveIndex(discrete);
      }
    };

    const existing = ScrollTrigger.getById(SLIDER_TRIGGER_ID);
    existing?.kill();

    const st = ScrollTrigger.create({
      id: SLIDER_TRIGGER_ID,
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: pinRef.current,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        applyProgress(self.progress);
      },
    });

    scrollTriggerRef.current = st;
    applyProgress(st.progress);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      st.kill();
      scrollTriggerRef.current = null;
    };
  }, [count, projects]);

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      const nodes = contentRef.current?.querySelectorAll("[data-reveal]");
      if (!nodes?.length) return;
      if (reduceMotionRef.current) {
        gsap.set(nodes, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        nodes,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.07,
          ease: "power3.out",
          overwrite: "auto",
        },
      );
    }, contentRef);
    return () => ctx.revert();
  }, [activeIndex]);

  const goToSlide = useCallback(
    (index: number, options?: { auto?: boolean; durationSec?: number }) => {
      autoCycleStartRef.current = performance.now();
      if (options?.auto) {
        ignoreProgrammaticScrollUntilRef.current =
          Date.now() + PROGRAMMATIC_SCROLL_IGNORE_MS;
      }
      const n = countRef.current;
      if (!sectionRef.current || n === 0) return;
      const st = scrollTriggerRef.current;
      const maxSeg = Math.max(1, n - 1);
      const clamped = Math.min(n - 1, Math.max(0, index));
      const t = Math.min(1, Math.max(0, clamped / maxSeg));

      const durationSec =
        options?.durationSec ??
        Math.min(
          SCROLL_DURATION_MAX,
          SCROLL_DURATION_BASE +
            Math.abs(activeIndexRef.current - clamped) *
              SCROLL_DURATION_PER_STEP,
        );

      if (st) {
        const y = st.start + t * (st.end - st.start);
        scrollWindowTo(y, durationSec);
      } else {
        const el = sectionRef.current;
        const top = el.offsetTop;
        const maxRel = Math.max(0, el.offsetHeight - window.innerHeight);
        scrollWindowTo(n <= 1 ? top : top + t * maxRel, durationSec);
      }
    },
    [],
  );

  /* Sync auto-rotate cycle when projects load */
  useEffect(() => {
    if (count > 0) autoCycleStartRef.current = performance.now();
  }, [count]);

  /**
   * Auto-advance with rAF + scroll-range check (Lenis + ScrollTrigger: `isActive` is unreliable).
   * Border stroke-dashoffset shows elapsed fraction of the interval.
   */
  useEffect(() => {
    if (count <= 1) return;

    let rafId = 0;

    const isInSliderRange = () => {
      const st = scrollTriggerRef.current;
      if (!st) return false;
      const y = getScrollY();
      return y >= st.start - 3 && y <= st.end + 3;
    };

    const bumpCycleOnManualScroll = () => {
      if (Date.now() < ignoreProgrammaticScrollUntilRef.current) return;
      if (!isInSliderRange()) {
        lastScrollYForAutoBumpRef.current = null;
        return;
      }
      const y = getScrollY();
      const prev = lastScrollYForAutoBumpRef.current;
      lastScrollYForAutoBumpRef.current = y;
      /* Ignore sub-pixel noise so Lenis idle frames don’t reset the countdown. */
      if (prev != null && Math.abs(y - prev) < 0.75) return;
      autoCycleStartRef.current = performance.now();
    };

    const lenis = getLenis();
    if (lenis?.on) lenis.on("scroll", bumpCycleOnManualScroll);
    else window.addEventListener("scroll", bumpCycleOnManualScroll, { passive: true });

    const tick = () => {
      const ring = autoRingRectRef.current;
      const label = autoCountdownRef.current;
      const n = countRef.current;

      if (n <= 1 || reduceMotionRef.current) {
        if (ring) {
          ring.style.strokeDashoffset = "0";
          ring.style.opacity = "0";
        }
        if (label) label.textContent = "";
        return;
      }

      if (ring) ring.style.opacity = "1";

      if (!isInSliderRange() || document.hidden) {
        if (ring) {
          ring.style.strokeDashoffset = "0";
          ring.style.opacity = "0";
        }
        if (label) label.textContent = "";
        return;
      }

      if (pauseAutoFromHoverRef.current) {
        autoCycleStartRef.current = performance.now();
        if (ring) ring.style.strokeDashoffset = "0";
        if (label) label.textContent = "Paused";
        return;
      }

      const now = performance.now();
      const ignored = Date.now() < ignoreProgrammaticScrollUntilRef.current;
      const elapsed = ignored ? 0 : now - autoCycleStartRef.current;
      const p = Math.min(1, Math.max(0, elapsed / AUTO_ROTATE_MS));

      if (ring) ring.style.strokeDashoffset = String(p);

      const secLeft = Math.max(0, Math.ceil((AUTO_ROTATE_MS - elapsed) / 1000));
      if (label) {
        label.textContent = ignored
          ? "…"
          : secLeft > 0
            ? `${secLeft}s`
            : "";
      }

      if (!ignored && elapsed >= AUTO_ROTATE_MS) {
        goToSlide((activeIndexRef.current + 1) % n, { auto: true });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (lenis?.off) lenis.off("scroll", bumpCycleOnManualScroll);
      else window.removeEventListener("scroll", bumpCycleOnManualScroll);
    };
  }, [count, goToSlide]);

  useLayoutEffect(() => {
    const root = polaroidSectionRef.current;
    if (!root || count === 0) return;

    const cards = root.querySelectorAll("[data-polaroid]");
    if (!cards.length) return;

    if (reduceMotionRef.current) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 44, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.88,
          stagger: 0.09,
          ease: "power3.out",
          overwrite: "auto",
          scrollTrigger: {
            trigger: root,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [count, projects]);

  const goPrev = useCallback(() => {
    const n = countRef.current;
    if (n <= 1) return;
    goToSlide((activeIndexRef.current - 1 + n) % n);
  }, [goToSlide]);

  const goNext = useCallback(() => {
    const n = countRef.current;
    if (n <= 1) return;
    goToSlide((activeIndexRef.current + 1) % n);
  }, [goToSlide]);

  const onSliderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };

  const setNavHoverPause = (v: boolean) => {
    pauseAutoFromHoverRef.current = v;
  };

  const active = projects[activeIndex];

  if (count === 0) {
    return (
      <section
        className="workinfo-section bg-[#0a0a0a] text-white"
        style={{ minHeight: "100vh" }}
        aria-busy="true"
        aria-label="Projects"
      >
        <div className="flex h-screen w-full items-center justify-center">
          <p className="animate-pulse text-[11px] font-medium uppercase tracking-[0.28em] text-white/40">
            Loading projects…
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        ref={sectionRef}
        className="workinfo-section"
        style={{ height: `${count * VH_PER_SLIDE}vh` }}
        aria-roledescription="scroll-driven project slider"
        aria-label="Selected work"
      >
        <div
          ref={pinRef}
          tabIndex={0}
          role="region"
          aria-label="Project slider. Use arrow keys to change slide."
          onKeyDown={onSliderKeyDown}
          className="relative h-[100dvh] min-h-[100vh] w-full overflow-hidden bg-[#0a0a0a] outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <div className="absolute inset-0" aria-hidden="true">
            {projects.map((project, i) => (
              <div
                key={`${project.title}-${i}`}
                ref={(node) => {
                  bgLayerRefs.current[i] = node;
                }}
                className="absolute inset-0 will-change-[opacity]"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                {project.image ? (
                  <img
                    src={urlFor(project.image).url()}
                    alt=""
                    className="h-full w-full object-cover"
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={() => ScrollTrigger.refresh()}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/25" />
              </div>
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-[3]"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 0%, rgba(0,0,0,0.55) 100%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[4] mix-blend-overlay"
            style={{
              opacity: 0.045,
              backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
              backgroundRepeat: "repeat",
            }}
            aria-hidden
          />

          <svg
            className="pointer-events-none absolute inset-0 z-[21] h-full w-full"
            aria-hidden
          >
            <rect
              ref={autoRingRectRef}
              x="1.5%"
              y="1.5%"
              width="97%"
              height="97%"
              rx="2"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={0}
              vectorEffect="nonScalingStroke"
            />
          </svg>
          <div
            className="pointer-events-none absolute right-4 top-[max(5.5rem,env(safe-area-inset-top)+4rem)] z-[22] text-right md:right-8"
            aria-live="polite"
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/50">
              Auto
            </p>
            <p className="mt-0.5 font-mono text-sm tabular-nums text-white/90">
              <span ref={autoCountdownRef} />
            </p>
          </div>

          <div className="relative z-10 flex h-full flex-col text-white">
            <header className="flex shrink-0 items-start justify-between px-5 pt-8 md:px-10 md:pt-11 lg:px-[6vw]">
              <span className="rounded-full border border-white/15 bg-black/25 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md md:text-[11px]">
                Shrit. / Selected work
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.3em] text-white/45 sm:block md:text-[11px]">
                [ Scroll · ← → ]
              </span>
            </header>

            <div
              className="flex min-h-0 flex-1 flex-col justify-end px-5 pb-[max(2.25rem,env(safe-area-inset-bottom))] pr-16 pt-8 sm:pr-20 md:px-10 md:pb-12 md:pr-24 lg:px-[6vw] lg:pr-[min(28vw,12rem)] lg:pb-14"
              onMouseEnter={() => setNavHoverPause(true)}
              onMouseLeave={() => setNavHoverPause(false)}
            >
              <div ref={contentRef} className="max-w-[min(42rem,88vw)]">
                {active?.year != null && (
                  <p
                    data-reveal
                    className="mb-4 text-[11px] font-medium uppercase tracking-[0.4em] text-white/45"
                  >
                    {active.year}
                  </p>
                )}
                <h2
                  data-reveal
                  className="font-[family-name:var(--font-instrument-serif)] text-[clamp(2.5rem,9.5vw,5.75rem)] font-normal leading-[0.92] tracking-[-0.02em] text-white antialiased"
                >
                  {active?.title}
                </h2>

                <div
                  data-reveal
                  className="mt-11 flex flex-wrap gap-3 md:mt-12 md:gap-4"
                >
                  {active?.usefullinks?.slice(0, 2).map((link) => (
                    <a
                      key={link.name}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/20 bg-white/[0.08] px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md transition-[border-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] after:absolute after:inset-0 after:translate-y-full after:bg-white/10 after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/45 hover:after:translate-y-0 md:text-xs"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {link.name}
                        <MdArrowOutward className="text-lg transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </a>
                  ))}
                  {(!active?.usefullinks ||
                    active.usefullinks.length === 0) && (
                    <a
                      href="https://github.com/Shrit1401?tab=repositories"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/20 bg-white/[0.08] px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md transition-[border-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] after:absolute after:inset-0 after:translate-y-full after:bg-white/10 after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/45 hover:after:translate-y-0 md:text-xs"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        View on GitHub
                        <MdArrowOutward className="text-lg transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </a>
                  )}
                </div>
              </div>

              <div
                className="mt-10 flex items-center gap-2 md:mt-11"
                onMouseEnter={() => setNavHoverPause(true)}
                onMouseLeave={() => setNavHoverPause(false)}
              >
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={count <= 1}
                  aria-label="Previous project"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/22 bg-black/30 text-white backdrop-blur-md transition-[border-color,background-color,transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/45 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-25 md:h-[3.25rem] md:w-[3.25rem]"
                >
                  <MdKeyboardArrowLeft
                    className="text-2xl md:text-[1.65rem]"
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={count <= 1}
                  aria-label="Next project"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/22 bg-black/30 text-white backdrop-blur-md transition-[border-color,background-color,transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/45 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-25 md:h-[3.25rem] md:w-[3.25rem]"
                >
                  <MdKeyboardArrowRight
                    className="text-2xl md:text-[1.65rem]"
                    aria-hidden
                  />
                </button>
              </div>
            </div>

            <nav
              className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-end md:right-9 lg:right-[4.5vw]"
              aria-label="Slide index"
              onMouseEnter={() => setNavHoverPause(true)}
              onMouseLeave={() => setNavHoverPause(false)}
            >
              <div className="flex items-start gap-5">
                <ol className="flex flex-col items-end gap-[0.65rem] text-right md:gap-3">
                  {projects.map((_, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => goToSlide(i)}
                          className={`group flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em] transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:text-sm ${
                            isActive
                              ? "scale-100 text-white"
                              : "text-white/30 hover:scale-[1.02] hover:text-white/55"
                          }`}
                          aria-current={isActive ? "true" : undefined}
                        >
                          <span
                            className={`inline-block h-px origin-right bg-white transition-[width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              isActive ? "w-5 opacity-100" : "w-0 opacity-0"
                            }`}
                            aria-hidden
                          />
                          <span className="tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <div
                  className="relative w-px shrink-0 bg-white/12"
                  aria-hidden
                  style={{
                    height: `${Math.max(projects.length, 1) * 2.35}rem`,
                  }}
                >
                  <div
                    ref={progressFillRef}
                    className="absolute left-0 top-0 h-full w-full origin-top scale-y-0 bg-white/75"
                  />
                </div>
              </div>
            </nav>
          </div>
        </div>
      </section>

      <section
        ref={polaroidSectionRef}
        className="workinfo-polaroid-grid relative border-t border-black/[0.08] bg-[#ebe6dc] px-4 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24 lg:px-[5vw] lg:pb-32 lg:pt-28"
        aria-label="Project polaroid gallery"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[88rem]">
          <header className="mb-12 max-w-2xl md:mb-16">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.38em] text-neutral-700/75">
              After the scroll
            </p>
            <h3 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(2rem,5vw,3.25rem)] font-normal leading-[1.05] tracking-[-0.02em] text-neutral-900">
              Same work, pinned snapshots
            </h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
              Skim the grid, open a link, or jump back into the slider on any
              frame.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14">
            {projects.map((project, i) => {
              const href = projectPrimaryHref(project);
              return (
                <article
                  key={`polaroid-${project.title}-${i}`}
                  data-polaroid
                  className="flex w-full justify-center"
                >
                  <div className="group/polaroid w-full max-w-[22rem] transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.2)] sm:max-w-none">
                    <div className="rounded-[3px] border border-white/90 bg-white p-3 pb-10 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06]">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-[1px] bg-neutral-200 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900/35"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-200">
                          {project.image ? (
                            <img
                              src={urlFor(project.image).url()}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/polaroid:scale-[1.03]"
                              loading="lazy"
                              decoding="async"
                              onLoad={() => ScrollTrigger.refresh()}
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-neutral-300 to-neutral-500" />
                          )}
                        </div>
                      </a>
                      <div className="mt-5 min-h-[4.5rem] px-1 text-center">
                        {project.year != null && (
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-neutral-500">
                            {project.year}
                          </p>
                        )}
                        <p className="font-[family-name:var(--font-instrument-serif)] text-[1.05rem] leading-snug text-neutral-900 md:text-lg">
                          {project.title}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 underline decoration-neutral-400/60 underline-offset-4 transition-colors duration-300 hover:text-neutral-800"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              goToSlide(i);
                            }}
                          >
                            Open in slider
                          </button>
                          <span className="text-neutral-300" aria-hidden>
                            ·
                          </span>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600 transition-colors duration-300 hover:text-neutral-900"
                          >
                            Visit
                            <MdArrowOutward className="ml-0.5 inline align-[-2px] text-sm" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div className="workinfo-more-cta relative z-0 border-t border-black/[0.08] bg-[#e8e2d6] px-5 py-14 md:px-10 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <p className="max-w-md text-sm leading-relaxed text-neutral-700/90">
            Want the full stream of experiments and repos? Everything else lives
            on GitHub.
          </p>
          <a
            href="https://github.com/Shrit1401?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-neutral-900/18 bg-neutral-900/[0.06] px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-900 transition-[border-color,background-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-neutral-900/40 hover:bg-neutral-900/[0.1] active:scale-[0.98]"
          >
            More projects
            <MdArrowOutward className="text-lg transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </>
  );
};

export default WorkInfo;
