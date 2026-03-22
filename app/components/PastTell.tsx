import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  PAST_TIMELINE_ROWS,
  type PastTimelineRow,
} from "@/app/lib/pastTimeline";

gsap.registerPlugin(ScrollTrigger);

const accentColors = [
  "#7B3737",
  "#6B46C1",
  "#3B4F1B",
  "#2C7A7B",
  "#B89B2B",
  "#E53E3E",
];

const MILESTONE_ACCENT = "#5c2222";

/** Optional aside after `::` in story text. */
function parsePastDescription(raw: string): { body: string; aside?: string } {
  const marker = "::";
  const i = raw.indexOf(marker);
  if (i === -1) return { body: raw.trim() };
  const body = raw.slice(0, i).trim();
  const aside = raw.slice(i + marker.length).trim();
  return { body, aside: aside || undefined };
}

function typeLabel(type: string): string {
  return type.replace(/-/g, " ");
}

function isMilestoneRow(type: string, title: string, body: string): boolean {
  if (type === "big-moment") return true;
  const blob = `${title} ${body}`.toLowerCase();
  return (
    /₹?\s*40\s*k\b|\b40\s*k\b|40\s*,\s*000|40000|forty\s*k|\b₹\s*40\b/.test(
      blob,
    ) || /\b40k\b/i.test(blob)
  );
}

/** Small visual hook per step — keyword match, then rotation (no schema). */
function pickStepIcon(title: string, body: string, idx: number): string {
  const t = `${title} ${body}`.toLowerCase();
  if (/video|edit|premiere|after\s*effects|cut\b/.test(t)) return "🎬";
  if (/react|next\.?js|code|dev|build|app|web/.test(t)) return "💻";
  if (/ghost|game|player|steam/.test(t)) return "👻";
  if (/money|₹|rupee|fiverr|paid|earn|freelance|client|\$\d/.test(t))
    return "💰";
  if (/learn|study|course|school|college/.test(t)) return "📚";
  if (/write|blog|essay|story/.test(t)) return "✍️";
  const pool = ["✦", "◇", "○", "◆", "△", "✧"];
  return pool[idx % pool.length];
}

/** Spacing after each step (last item uses 0). */
const MARGIN_BELOW_PX = [46, 58, 38, 54, 44, 52];

/** Per-card accent strength for left bar. */
const ACCENT_STRENGTH = [1, 0.88, 0.92, 0.78, 0.95, 0.82];

type PolaroidTape = "none" | "amber" | "sage" | "blush" | "slate";

type PolaroidStyle = {
  rotate: number;
  paper: string;
  border: string;
  boxShadow: string;
  tape: PolaroidTape;
  imgRadiusPx: number;
  captionHandwritten: boolean;
  liftY: number;
  wideCaption: boolean;
};

/** Cycled per step so each polaroid feels distinct. */
const POLAROID_STYLES: PolaroidStyle[] = [
  {
    rotate: -4.1,
    paper: "#f4f0e6",
    border: "rgba(55, 44, 36, 0.18)",
    boxShadow:
      "0 22px 50px -14px rgba(28, 22, 18, 0.42), 0 8px 22px -10px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.72)",
    tape: "amber",
    imgRadiusPx: 1,
    captionHandwritten: false,
    liftY: 6,
    wideCaption: false,
  },
  {
    rotate: 3.7,
    paper: "#faf8f3",
    border: "rgba(44, 122, 123, 0.2)",
    boxShadow:
      "0 20px 46px -12px rgba(25, 50, 52, 0.32), 0 6px 18px -8px rgba(44, 122, 123, 0.14), inset 0 1px 0 rgba(255,255,255,0.85)",
    tape: "sage",
    imgRadiusPx: 4,
    captionHandwritten: true,
    liftY: 0,
    wideCaption: true,
  },
  {
    rotate: -2.4,
    paper: "#f8f3f0",
    border: "rgba(123, 55, 55, 0.16)",
    boxShadow:
      "0 18px 40px -12px rgba(60, 35, 35, 0.28), 0 4px 14px -6px rgba(123, 55, 55, 0.1), inset 0 1px 0 rgba(255,255,255,0.65)",
    tape: "blush",
    imgRadiusPx: 0,
    captionHandwritten: true,
    liftY: 10,
    wideCaption: false,
  },
  {
    rotate: 4.2,
    paper: "#f2efe8",
    border: "rgba(35, 35, 40, 0.14)",
    boxShadow:
      "0 24px 52px -16px rgba(15, 15, 22, 0.38), 0 2px 8px -2px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.4)",
    tape: "slate",
    imgRadiusPx: 2,
    captionHandwritten: false,
    liftY: 2,
    wideCaption: false,
  },
  {
    rotate: -3.2,
    paper: "#fdfbf7",
    border: "rgba(107, 70, 193, 0.17)",
    boxShadow:
      "0 19px 44px -14px rgba(55, 40, 80, 0.26), 0 8px 20px -10px rgba(107, 70, 193, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
    tape: "none",
    imgRadiusPx: 6,
    captionHandwritten: true,
    liftY: 8,
    wideCaption: true,
  },
  {
    rotate: 2.8,
    paper: "#f6f2ea",
    border: "rgba(184, 155, 43, 0.22)",
    boxShadow:
      "0 21px 48px -14px rgba(70, 55, 20, 0.3), 0 5px 16px -6px rgba(184, 155, 43, 0.15), inset 0 1px 0 rgba(255,255,255,0.7)",
    tape: "amber",
    imgRadiusPx: 3,
    captionHandwritten: false,
    liftY: 4,
    wideCaption: false,
  },
];

function polaroidStyleAt(idx: number): PolaroidStyle {
  return POLAROID_STYLES[idx % POLAROID_STYLES.length];
}

function PastPolaroidFrame({
  src,
  alt,
  dateLine,
  titleLine,
  idx,
}: {
  src: string;
  alt: string;
  dateLine: string;
  titleLine: string;
  idx: number;
}) {
  const v = polaroidStyleAt(idx);
  return (
    <figure
      className="pasttell-polaroid group/polaroid relative mx-auto w-[min(13.75rem,84vw)] shrink-0 md:mx-0 md:w-[11.85rem] lg:w-[12.35rem]"
      style={{
        transform: `rotate(${v.rotate}deg) translateY(${v.liftY}px)`,
        background: v.paper,
        border: `1px solid ${v.border}`,
        boxShadow: v.boxShadow,
        padding: "0.5rem 0.5rem 0.62rem",
      }}
    >
      {v.tape !== "none" ? (
        <span
          className={`pasttell-polaroid-tape pasttell-polaroid-tape--${v.tape}`}
          aria-hidden
        />
      ) : null}
      <div
        className="relative aspect-[4/5] overflow-hidden bg-neutral-300/75 ring-1 ring-black/[0.04]"
        style={{ borderRadius: v.imgRadiusPx }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 size-full object-cover object-center transition-[filter,transform] duration-500 group-hover/polaroid:brightness-[1.03] group-hover/polaroid:scale-[1.02]"
          draggable={false}
          loading="lazy"
        />
      </div>
      <figcaption
        className={`mt-2.5 min-h-[2.35rem] px-0.5 ${v.wideCaption ? "px-1" : ""}`}
      >
        <p
          className={
            v.captionHandwritten
              ? "pasttell-aside text-center text-[1.05rem] leading-tight text-neutral-600/88 md:text-[1.12rem]"
              : "text-center font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-500/85"
          }
          style={v.captionHandwritten ? { transform: "rotate(-0.25deg)" } : undefined}
        >
          {dateLine}
        </p>
        <p className="mt-1 line-clamp-2 text-center text-[11px] font-medium leading-snug text-neutral-800/88 md:text-[11.5px]">
          {titleLine}
        </p>
      </figcaption>
    </figure>
  );
}

type PastTellProps = {
  timelineRows?: PastTimelineRow[];
};

const PastTell = ({ timelineRows }: PastTellProps) => {
  const rows = timelineRows ?? PAST_TIMELINE_ROWS;
  const stepCount = rows.length;
  const listRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const lineTrackRef = useRef<HTMLDivElement>(null);
  const lineProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        const w = window as Window & { lenis?: { resize: () => void } };
        w.lenis?.resize();
        ScrollTrigger.refresh();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, []);

  /* Entry: fade + rise (steps only). */
  useEffect(() => {
    const root = listRef.current;
    if (!root || stepCount === 0) return;

    const steps = root.querySelectorAll("[data-past-step]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        steps,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: root,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [stepCount]);

  /* Timeline fill + single “spotlight” step (closest to focal line) + spine glow. */
  useEffect(() => {
    const journey = journeyRef.current;
    const track = lineTrackRef.current;
    const progressEl = lineProgressRef.current;
    const root = listRef.current;
    if (!journey || !track || !progressEl || !root || stepCount === 0)
      return;

    gsap.set(progressEl, { scaleY: 0, transformOrigin: "top center" });

    const updateSpotlight = () => {
      const steps = [...root.querySelectorAll<HTMLElement>("[data-past-step]")];
      if (steps.length === 0) return;

      const md = window.matchMedia("(min-width: 768px)").matches;
      const focalY = window.innerHeight * 0.4;
      let bestI = 0;
      let bestD = Infinity;
      steps.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const anchor = r.top + Math.min(r.height * 0.32, 120);
        const d = Math.abs(anchor - focalY);
        if (d < bestD) {
          bestD = d;
          bestI = i;
        }
      });

      steps.forEach((el, i) => {
        el.classList.toggle("pasttell-step--spotlight", i === bestI);
      });

      if (md && track) {
        const active = steps[bestI];
        const dot = active?.querySelector<HTMLElement>(".pasttell-dot");
        const tr = track.getBoundingClientRect();
        if (dot && tr.height > 0) {
          const dr = dot.getBoundingClientRect();
          const cy = dr.top + dr.height / 2;
          const pct = ((cy - tr.top) / tr.height) * 100;
          journey.style.setProperty(
            "--pasttell-line-hotspot",
            `${Math.max(2, Math.min(98, pct))}%`,
          );
        }
      }
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: journey,
        start: "top 78%",
        end: "bottom 22%",
        scrub: 0.45,
        onUpdate: (self) => {
          gsap.set(progressEl, {
            scaleY: Math.max(0.008, self.progress),
          });
        },
      });

      ScrollTrigger.create({
        trigger: journey,
        start: "top bottom",
        end: "bottom top",
        onEnter: updateSpotlight,
        onLeave: updateSpotlight,
        onEnterBack: updateSpotlight,
        onLeaveBack: updateSpotlight,
        onUpdate: updateSpotlight,
      });
    }, journey);

    journey.classList.add("pasttell-journey--ready");
    requestAnimationFrame(updateSpotlight);

    return () => {
      journey.classList.remove("pasttell-journey--ready");
      ctx.revert();
    };
  }, [stepCount]);

  return (
    <section className="pasttell-section relative flex min-h-screen w-full items-start justify-center overflow-x-hidden pb-28 pt-16 md:pb-36 md:pt-24">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap');
          .pasttell-aside {
            font-family: 'Caveat', cursive;
          }
          @keyframes pasttell-dot-pulse {
            0%, 100% {
              filter: drop-shadow(0 0 5px color-mix(in srgb, var(--dot-glow, #666) 40%, transparent));
            }
            50% {
              filter: drop-shadow(0 0 14px color-mix(in srgb, var(--dot-glow, #666) 65%, transparent));
            }
          }
          @media (min-width: 768px) {
            .pasttell-journey--ready .pasttell-step--spotlight .pasttell-step-glow {
              opacity: 1;
            }
            .pasttell-journey--ready .pasttell-step--spotlight .pasttell-dot {
              transform: scale(1.12) !important;
              animation: pasttell-dot-pulse 2.4s ease-in-out infinite;
              will-change: filter;
            }
            .pasttell-journey--ready:has(.pasttell-step--spotlight) .pasttell-step:not(.pasttell-step--spotlight) .pasttell-spotlight-target {
              opacity: 0.4;
              filter: blur(1.25px);
              transform: scale(0.985);
            }
            .pasttell-journey--ready:has(.pasttell-step--spotlight) .pasttell-step--spotlight .pasttell-spotlight-target {
              opacity: 1;
              filter: blur(0);
              transform: scale(1.024);
            }
            .pasttell-journey--ready:has(.pasttell-step--spotlight) .pasttell-step:not(.pasttell-step--spotlight) .pasttell-dot {
              opacity: 0.45;
              transform: scale(0.92) !important;
            }
            .pasttell-journey--ready:has(.pasttell-step--spotlight) .pasttell-step:not(.pasttell-step--spotlight) .pasttell-connector {
              opacity: 0.35;
            }
          }
          .pasttell-line-hotspot {
            opacity: 0;
            transition: top 0.35s ease-out, opacity 0.4s ease-out;
          }
          @media (min-width: 768px) {
            .pasttell-journey--ready .pasttell-line-hotspot {
              opacity: 1;
            }
          }
          .pasttell-polaroid-tape {
            position: absolute;
            left: 50%;
            top: 0;
            width: 42%;
            height: 1.15rem;
            transform: translate(-50%, -42%) rotate(-1.2deg);
            border-radius: 1px;
            pointer-events: none;
            z-index: 2;
            opacity: 0.9;
          }
          .pasttell-polaroid-tape--amber {
            background: linear-gradient(
              180deg,
              rgba(240, 215, 165, 0.75) 0%,
              rgba(195, 165, 115, 0.45) 100%
            );
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .pasttell-polaroid-tape--sage {
            background: linear-gradient(
              180deg,
              rgba(190, 215, 195, 0.7) 0%,
              rgba(120, 160, 140, 0.4) 100%
            );
            box-shadow: 0 1px 3px rgba(30, 60, 50, 0.12);
          }
          .pasttell-polaroid-tape--blush {
            background: linear-gradient(
              180deg,
              rgba(245, 210, 210, 0.72) 0%,
              rgba(210, 160, 165, 0.42) 100%
            );
            box-shadow: 0 1px 3px rgba(80, 40, 45, 0.1);
          }
          .pasttell-polaroid-tape--slate {
            background: linear-gradient(
              180deg,
              rgba(200, 205, 215, 0.75) 0%,
              rgba(140, 145, 158, 0.45) 100%
            );
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
          }
          @media (prefers-reduced-motion: reduce) {
            .pasttell-polaroid {
              transform: none !important;
            }
            .pasttell-journey--ready .pasttell-step .pasttell-spotlight-target {
              opacity: 1 !important;
              filter: none !important;
              transform: none !important;
            }
            .pasttell-journey--ready .pasttell-step .pasttell-dot {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
            .pasttell-journey--ready .pasttell-step .pasttell-connector {
              opacity: 1 !important;
            }
          }
        `}
      </style>
      <div
        className="pointer-events-none absolute inset-0 bg-noise opacity-[0.2]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#e8e4d9]/68 via-[#f8f6f0] to-[#ebe7dc]/52"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#7B3737]/[0.04] blur-3xl md:left-0"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-[#2C7A7B]/[0.05] blur-3xl"
        aria-hidden
      />

      <div className="relative z-20 w-full max-w-3xl px-5 md:max-w-[58rem] md:px-8 md:pl-9 lg:max-w-[62rem]">
        <header className="pasttell-header relative z-30 mb-16 md:mb-[4.5rem] md:translate-x-0.5">
          <p className="pasttell-kicker font-mono text-[11px] uppercase tracking-[0.32em] text-neutral-500/90">
            Personal archive
          </p>
          <h2 className="pasttell-title mt-3 font-instrument text-[clamp(2.5rem,6vw,3.75rem)] leading-[1.05] tracking-tight text-neutral-900">
            life events
          </h2>
          <div
            className="pasttell-rule mt-6 h-[2px] max-w-[min(12rem,40vw)] rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(23,23,23,0.26) 0%, rgba(23,23,23,0.05) 55%, transparent 100%)",
            }}
          />
        </header>

        <div ref={journeyRef} className="pasttell-journey relative md:pl-1">
          {/* Spine: behind steps */}
          <div
            ref={lineTrackRef}
            className="pointer-events-none absolute bottom-3 left-[12px] top-0 z-0 hidden w-[5px] md:block"
            style={
              {
                ["--pasttell-line-hotspot" as string]: "18%",
              } as React.CSSProperties
            }
            aria-hidden
          >
            <div
              className="pasttell-line-hotspot pointer-events-none absolute left-1/2 z-[2] h-[4.5rem] w-7 -translate-x-1/2 rounded-full"
              style={{
                top: "var(--pasttell-line-hotspot, 22%)",
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(120,95,80,0.45) 0%, rgba(160,140,120,0.12) 45%, transparent 72%)",
                filter: "blur(5px)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(200,195,188,0.65) 0%, rgba(210,205,198,0.45) 45%, rgba(220,215,208,0.2) 100%)",
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.35), 0 0 20px rgba(180,170,160,0.12)",
              }}
            />
            <div
              ref={lineProgressRef}
              className="absolute inset-x-0 top-0 z-[1] h-full rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(75,65,58,0.82) 0%, rgba(110,100,92,0.55) 50%, rgba(130,120,112,0.35) 100%)",
                boxShadow:
                  "0 0 14px rgba(90,75,65,0.22), 0 0 28px rgba(120,90,70,0.08)",
              }}
            />
          </div>

          <div ref={listRef} className="relative z-10 flex flex-col">
            {rows.map(
              ({ chapter, event, globalIdx: idx, isFirstInChapter }) => {
                const { body, aside } = parsePastDescription(event.story);
                const baseAccent = accentColors[idx % accentColors.length];
                const isMilestone = isMilestoneRow(
                  event.type,
                  event.title,
                  body,
                );
                const isLatest = idx === stepCount - 1;
                const accent = isMilestone ? MILESTONE_ACCENT : baseAccent;
                const strength = isMilestone
                  ? 1
                  : ACCENT_STRENGTH[idx % ACCENT_STRENGTH.length];
                const marginBelow =
                  idx === stepCount - 1
                    ? 0
                    : MARGIN_BELOW_PX[idx % MARGIN_BELOW_PX.length];
                const noBorder = idx % 6 === 2 && !isMilestone;
                const thinBar = idx % 5 === 3 && !isMilestone;
                const marker = typeLabel(event.type);

                const dotSize = isMilestone ? 22 : isLatest ? 17 : 13;
                const cardEmphasis = isMilestone
                  ? "md:scale-[1.03]"
                  : isLatest
                    ? "md:scale-[1.015]"
                    : "";

                const staggerExtraRem = idx % 2 === 0 ? 1.15 : 0.12;
                const hasImage = Boolean(event.image);

                return (
                  <React.Fragment key={`${chapter.id}-${event.title}-${idx}`}>
                    {isFirstInChapter ? (
                      <div className="pasttell-section-break relative z-10 mb-12 mt-6 first:mt-0 md:mb-14 md:mt-10 md:pl-[3.25rem]">
                        <p className="font-mono text-[9px] uppercase tracking-[0.42em] text-neutral-400/75">
                          chapter
                        </p>
                        <p className="pasttell-chapter-title mt-2 font-instrument text-[clamp(1.65rem,4.5vw,2.35rem)] lowercase leading-none tracking-tight text-neutral-800/[0.22]">
                          {chapter.title}
                        </p>
                      </div>
                    ) : null}

                    <article
                      data-past-step
                      className="group/past pasttell-step pasttell-card-wrap relative md:pl-[3.65rem]"
                      style={{
                        marginBottom: marginBelow,
                        opacity: 0,
                      }}
                    >
                      {/* Connector: spine (≈15px) → step body; width grows with alternate indent */}
                      <div
                        className="pasttell-connector pointer-events-none absolute left-[15px] z-[5] hidden h-0.5 transition-opacity duration-500 ease-out md:block"
                        style={{
                          background: `linear-gradient(90deg, ${accent}50, ${accent}14)`,
                          top: `calc(2.15rem + ${dotSize / 2}px)`,
                          width: `calc(3.65rem + ${staggerExtraRem}rem - 15px)`,
                          transform: "translateY(-50%)",
                        }}
                        aria-hidden
                      />

                      <div
                        className="pasttell-dot absolute left-0 top-[2.15rem] z-[12] hidden rounded-full border-[3px] border-[#f8f6f0] shadow-sm transition-[box-shadow,transform,opacity] duration-500 ease-out md:flex md:items-center md:justify-center group-hover/past:shadow-md"
                        style={{
                          ["--dot-glow" as string]: accent,
                          width: dotSize,
                          height: dotSize,
                          marginLeft: isMilestone
                            ? -2
                            : isLatest
                              ? -1
                              : idx % 2 === 0
                                ? 0
                                : 1,
                          background: accent,
                          boxShadow: isMilestone
                            ? `0 0 0 2px ${accent}66, 0 0 28px 4px ${accent}40, 0 6px 18px -4px ${accent}45`
                            : isLatest
                              ? `0 0 0 1px ${accent}44, 0 0 16px 2px ${accent}30, 0 4px 12px -3px ${accent}28`
                              : `0 0 0 1px ${accent}2a, 0 0 10px 1px ${accent}18, 0 3px 10px -3px ${accent}20`,
                        }}
                        aria-hidden
                      />

                      <div
                        className={`pasttell-spotlight-target origin-top relative transition-[opacity,filter,transform] duration-500 ease-out md:duration-700 md:ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          idx % 2 === 0 ? "md:ml-5" : "md:ml-0.5"
                        }`}
                        style={{ transformOrigin: "0 0" }}
                      >
                        <div
                          className="pasttell-step-glow pointer-events-none absolute -inset-3 -z-10 rounded-[1.35rem] opacity-0 transition-opacity duration-500 ease-out md:-inset-4"
                          style={{
                            background: `radial-gradient(ellipse 85% 70% at 40% 35%, ${accent}22 0%, transparent 65%)`,
                          }}
                          aria-hidden
                        />
                        <div
                          className={`pasttell-card relative overflow-hidden rounded-2xl rounded-tl-sm bg-[#fdfbf7]/92 p-6 pl-5 backdrop-blur-[4px] transition-[border-color,box-shadow,transform] duration-200 ease-out md:p-8 md:pl-7 md:hover:-translate-y-1 ${cardEmphasis} ${
                            isMilestone
                              ? "shadow-[0_28px_64px_-22px_rgba(0,0,0,0.2),0_6px_20px_-8px_rgba(92,34,34,0.12)] ring-1 ring-[#5c2222]/15 md:hover:shadow-[0_34px_72px_-20px_rgba(0,0,0,0.22),0_8px_24px_-8px_rgba(92,34,34,0.14)]"
                              : isLatest
                                ? "shadow-[0_22px_52px_-24px_rgba(0,0,0,0.15),0_3px_12px_-5px_rgba(0,0,0,0.065)] md:hover:shadow-[0_30px_64px_-22px_rgba(0,0,0,0.17),0_5px_16px_-6px_rgba(0,0,0,0.08)]"
                                : "shadow-[0_20px_48px_-26px_rgba(0,0,0,0.13),0_2px_10px_-4px_rgba(0,0,0,0.055)] md:hover:shadow-[0_26px_58px_-22px_rgba(0,0,0,0.16),0_4px_14px_-6px_rgba(0,0,0,0.075)]"
                          } ${
                            noBorder
                              ? "border-0 ring-1 ring-neutral-200/50"
                              : "border border-neutral-200/55"
                          } md:hover:border-neutral-400/50`}
                          style={
                            {
                              ["--past-accent" as string]: accent,
                            } as React.CSSProperties
                          }
                        >
                          <div
                            className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full opacity-[0.085] blur-2xl transition-opacity duration-500 group-hover/past:opacity-[0.12]"
                            style={{ background: accent }}
                            aria-hidden
                          />
                          <div
                            className="absolute left-0 top-0 h-full rounded-l-md rounded-tl-sm"
                            style={{
                              width: isMilestone ? 4 : thinBar ? 2 : 3,
                              opacity: isMilestone ? 0.95 : 0.7 * strength,
                              background: `linear-gradient(180deg, ${accent} 0%, ${accent}aa 42%, transparent 100%)`,
                            }}
                            aria-hidden
                          />

                          <div
                            className={
                              hasImage
                                ? "flex flex-col gap-10 md:flex-row md:items-start md:gap-8 lg:gap-10"
                                : undefined
                            }
                          >
                            <div
                              className={`relative min-w-0 ${hasImage ? "flex-1" : ""}`}
                            >
                              <div
                                className={
                                  hasImage
                                    ? "absolute right-0 top-0 z-10 flex max-w-[min(13rem,calc(100%-1rem))] flex-col items-end gap-1.5 text-right md:right-1 md:top-1 md:max-w-[11.5rem]"
                                    : "absolute right-5 top-5 z-10 flex max-w-[calc(100%-1.5rem)] flex-col items-end gap-1.5 text-right md:right-8 md:top-8 md:max-w-[13rem]"
                                }
                              >
                                {isMilestone ? (
                                  <span className="rounded-md bg-[#5c2222]/92 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[#f8f6f0]">
                                    big moment
                                  </span>
                                ) : isLatest ? (
                                  <span className="rounded-md bg-neutral-800/88 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[#f8f6f0]">
                                    now
                                  </span>
                                ) : null}
                                <span
                                  className="pasttell-date inline-flex max-w-full flex-wrap justify-end rounded-2xl px-3 py-1.5 font-mono text-[10px] font-medium uppercase leading-snug tracking-[0.14em] text-neutral-700/88 ring-1 ring-inset ring-neutral-800/[0.04]"
                                  style={{
                                    backgroundColor: `${accent}12`,
                                  }}
                                >
                                  {event.date}
                                </span>
                              </div>

                              <div
                                className={
                                  hasImage
                                    ? "max-w-[50ch] min-w-0 pr-0 pt-1 sm:pr-[6.75rem] md:max-w-none md:pr-3 md:pt-0 lg:pr-2"
                                    : "max-w-[50ch] min-w-0 pr-[7.25rem] sm:pr-[8.25rem] md:pr-[9.25rem]"
                                }
                              >
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <span
                                    className="select-none text-[1.15rem] leading-none opacity-[0.88] md:text-[1.25rem]"
                                    aria-hidden
                                  >
                                    {pickStepIcon(event.title, body, idx)}
                                  </span>
                                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-neutral-400">
                                    {marker}
                                  </p>
                                </div>
                                <h3
                                  className={`pasttell-title font-instrument lowercase leading-tight tracking-tight text-neutral-900 ${
                                    isMilestone
                                      ? "text-[1.85rem] md:text-[1.95rem]"
                                      : isLatest
                                        ? "text-[1.68rem] md:text-[1.76rem]"
                                        : "text-2xl md:text-[1.55rem]"
                                  }`}
                                >
                                  {event.title}
                                </h3>
                                <p
                                  className={`pasttell-body mt-3 text-[15px] leading-snug md:text-[15px] md:leading-[1.55] ${
                                    isLatest && !isMilestone
                                      ? "text-neutral-600"
                                      : idx >= stepCount - 3
                                        ? "text-neutral-600/90"
                                        : "text-neutral-600/78"
                                  }`}
                                >
                                  {body}
                                </p>
                                {aside ? (
                                  <p
                                    className="pasttell-aside mt-3 text-[1.32rem] leading-tight text-neutral-500 md:text-[1.42rem]"
                                    style={{ transform: "rotate(-0.35deg)" }}
                                  >
                                    note: {aside}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            {hasImage && event.image ? (
                              <PastPolaroidFrame
                                src={event.image}
                                alt={event.title}
                                dateLine={event.date}
                                titleLine={event.title}
                                idx={idx}
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  </React.Fragment>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PastTell;
