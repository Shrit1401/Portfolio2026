"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getWorks } from "@/app/lib/server";
import { Work } from "../lib/types";
import { urlFor } from "@/sanity/lib/image";
import { MdArrowOutward } from "react-icons/md";

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

function scrollWindowTo(y: number) {
  const lenis = getLenis();
  if (lenis?.scrollTo) {
    lenis.scrollTo(y, { duration: 1.15 });
  } else {
    window.scrollTo({ top: y, behavior: "smooth" });
  }
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
const AUTO_ROTATE_MS = 5000;

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

  /* Lenis does not fire native scroll; ScrollTrigger must be nudged every frame */
  useEffect(() => {
    const bump = () => {
      ScrollTrigger.update();
    };
    const lenis = getLenis();
    if (lenis?.on) {
      lenis.on("scroll", bump);
      return () => lenis.off("scroll", bump);
    }
    window.addEventListener("scroll", bump, { passive: true });
    return () => window.removeEventListener("scroll", bump);
  }, []);

  useLayoutEffect(() => {
    if (count === 0 || !sectionRef.current || !pinRef.current) return;

    const maxSeg = Math.max(0, count - 1);

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

  const goToSlide = useCallback((index: number, options?: { auto?: boolean }) => {
    if (options?.auto) {
      ignoreProgrammaticScrollUntilRef.current = Date.now() + 1800;
    }
    const n = countRef.current;
    if (!sectionRef.current || n === 0) return;
    const st = scrollTriggerRef.current;
    const maxSeg = Math.max(1, n - 1);
    const t = Math.min(1, Math.max(0, index / maxSeg));

    if (st) {
      const y = st.start + t * (st.end - st.start);
      scrollWindowTo(y);
    } else {
      const el = sectionRef.current;
      const top = el.offsetTop;
      const maxRel = Math.max(0, el.offsetHeight - window.innerHeight);
      scrollWindowTo(n <= 1 ? top : top + t * maxRel);
    }
  }, []);

  /* Auto-advance while the pinned slider is active; pause in background & on reduced motion */
  useEffect(() => {
    if (count <= 1 || reduceMotionRef.current) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const clearTimer = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const schedule = () => {
      clearTimer();
      timeoutId = setTimeout(tick, AUTO_ROTATE_MS);
    };

    const tick = () => {
      timeoutId = null;
      if (cancelled) return;
      if (document.hidden) {
        schedule();
        return;
      }
      const st = scrollTriggerRef.current;
      if (!st?.isActive) {
        schedule();
        return;
      }
      const n = countRef.current;
      if (n <= 1) {
        schedule();
        return;
      }
      const next = (activeIndexRef.current + 1) % n;
      goToSlide(next, { auto: true });
      schedule();
    };

    schedule();

    const onScroll = () => {
      if (Date.now() < ignoreProgrammaticScrollUntilRef.current) return;
      if (!scrollTriggerRef.current?.isActive) return;
      schedule();
    };

    const onVisibility = () => {
      if (!document.hidden) schedule();
    };

    const lenis = getLenis();
    if (lenis?.on) lenis.on("scroll", onScroll);
    else window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearTimer();
      if (lenis?.off) lenis.off("scroll", onScroll);
      else window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count, goToSlide]);

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
        style={{ height: `${count * 100}vh` }}
        aria-roledescription="scroll-driven project slider"
        aria-label="Selected work"
      >
        <div
          ref={pinRef}
          className="relative h-[100dvh] min-h-[100vh] w-full overflow-hidden bg-[#0a0a0a]"
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

          <div className="relative z-10 flex h-full flex-col text-white">
            <header className="flex shrink-0 items-start justify-between px-5 pt-8 md:px-10 md:pt-11 lg:px-[6vw]">
              <span className="rounded-full border border-white/15 bg-black/25 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md md:text-[11px]">
                Shrit. / Selected work
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.3em] text-white/45 sm:block md:text-[11px]">
                [ Scroll motion slider ]
              </span>
            </header>

            <div className="flex min-h-0 flex-1 flex-col justify-end px-5 pb-[max(2.25rem,env(safe-area-inset-bottom))] pr-16 pt-8 sm:pr-20 md:px-10 md:pb-12 md:pr-24 lg:px-[6vw] lg:pr-[min(28vw,12rem)] lg:pb-14">
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
                  {(!active?.usefullinks || active.usefullinks.length === 0) && (
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
            </div>

            <nav
              className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-end md:right-9 lg:right-[4.5vw]"
              aria-label="Slide index"
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

      <div className="relative border-t border-black/[0.06] bg-[#ebe6dc] px-5 py-16 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden
        />
        <div className="relative flex justify-center">
          <a
            href="https://github.com/Shrit1401?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-neutral-900/15 bg-neutral-900/[0.04] px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-900 transition-[border-color,background-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-neutral-900/35 hover:bg-neutral-900/[0.07] active:scale-[0.98]"
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
