"use client";

import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTransitionRouter } from "next-transition-router";
import { usePathname } from "next/navigation";
import type { WorkGalleryItem } from "@/app/lib/workGallery";

/** Base tilt per index (SSR-safe); motion adds a gentle wobble on top. */
const TILT_DEG = [-4.2, 2.6, -2.4, 3.4, -3.6, 2.2] as const;

/** Extra drop for cards toward the middle — matches a sagging rope (center lowest). */
function sagPx(index: number, count: number): number {
  if (count <= 1) return 0;
  const mid = (count - 1) / 2;
  const t = (index - mid) / mid;
  return Math.round(34 * (1 - t * t));
}

/** Rope Y in viewBox coords (matches RopeSvg path M 0 38 Q 500 132 1000 38). */
function ropeYVb(u: number): number {
  const y0 = 38;
  const y1 = 132;
  const y2 = 38;
  const o = 1 - u;
  return o * o * y0 + 2 * o * u * y1 + u * u * y2;
}

/** Nudge clip down slightly where the rope hangs lower so it stays “on” the line. */
function hookNudgeY(index: number, count: number): number {
  const u = (index + 0.5) / count;
  return Math.round((ropeYVb(u) - 38) * 0.2);
}

function Clothespin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="34"
      height="42"
      viewBox="0 0 30 38"
      aria-hidden
    >
      <path
        d="M6 3h18l2 8-1 24H5L4 11l2-8z"
        fill="#d4b896"
        stroke="#a08060"
        strokeWidth="0.75"
      />
      <path d="M14 6h2v26h-2z" fill="#b89870" />
      <ellipse cx="15" cy="5" rx="7" ry="3" fill="#e8d4bc" opacity={0.9} />
    </svg>
  );
}

function Paperclip({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="26"
      height="34"
      viewBox="0 0 24 32"
      aria-hidden
    >
      <path
        d="M9 6v16c0 3.5 2.5 6 6 6s6-2.5 6-6V8c0-4-3-7-7-7s-7 3-7 7v14c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5V10"
        fill="none"
        stroke="#7eb0c8"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RopeSvg({
  className,
  gradientId,
}: {
  className?: string;
  gradientId: string;
}) {
  /* Tall viewBox + deep control point so the U stays visible when the strip is very wide. */
  const d = "M 0 38 Q 500 132 1000 38";
  return (
    <svg
      className={className}
      viewBox="0 0 1000 150"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7a5c3a" />
          <stop offset="35%" stopColor="#a08055" />
          <stop offset="65%" stopColor="#8b6f47" />
          <stop offset="100%" stopColor="#6b4f32" />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="6.5"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.12))" }}
      />
      <path
        d={d}
        fill="none"
        stroke="#000"
        strokeOpacity={0.1}
        strokeWidth="8"
        strokeLinecap="round"
        transform="translate(0.8, 1.6)"
      />
    </svg>
  );
}

type SegmentProps = {
  items: WorkGalleryItem[];
  gradientId: string;
  segmentKey: string;
  reduceMotion: boolean | null;
  onNavigate: (
    href: string,
  ) => (e: React.MouseEvent<HTMLAnchorElement>) => void;
  segmentRef?: React.RefObject<HTMLDivElement | null>;
  ariaHidden?: boolean;
};

function PolaroidSegment({
  items,
  gradientId,
  segmentKey,
  reduceMotion,
  onNavigate,
  segmentRef,
  ariaHidden,
}: SegmentProps) {
  const n = items.length;
  return (
    <div
      ref={segmentRef}
      className="relative shrink-0 px-4 sm:px-8 md:px-10"
      aria-hidden={ariaHidden}
    >
      <RopeSvg
        gradientId={gradientId}
        className="pointer-events-none absolute left-4 right-4 top-2 z-[4] h-[6.25rem] md:h-[7.25rem] w-[calc(100%-2rem)] sm:left-7 sm:right-7 sm:w-[calc(100%-3.5rem)] md:left-10 md:right-10 md:w-[calc(100%-5rem)]"
      />

      <div className="relative z-[8] flex flex-row items-start gap-8 sm:gap-11 md:gap-14 lg:gap-16 pt-[3.35rem] md:pt-[3.75rem] pb-10 sm:pb-12 md:pb-16">
        {items.map((item, index) => {
          const tilt = TILT_DEG[index % TILT_DEG.length] ?? 0;
          const y = sagPx(index, n);
          const Fastener = index % 2 === 0 ? Clothespin : Paperclip;
          const wobble = 2.8;
          const href = item.href?.trim();
          const hasLink = Boolean(href);

          const entrance = {
            initial:
              reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, amount: 0.15 },
            transition: {
              duration: reduceMotion ? 0 : 0.5,
              ease: "easeOut" as const,
              delay: reduceMotion ? 0 : index * 0.05,
            },
          };

          const polaroidInner = (
            <motion.div
              className="relative mx-auto w-[min(78vw,300px)] sm:w-[min(72vw,340px)] md:w-[min(68vw,380px)]"
              style={{ transformOrigin: "50% 3px" }}
              animate={
                reduceMotion
                  ? { y, rotate: tilt }
                  : {
                      y,
                      rotate: [tilt - wobble, tilt + wobble, tilt],
                    }
              }
              transition={{
                y: { duration: 0 },
                rotate: reduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 5.2 + index * 0.35,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.4,
                    },
              }}
            >
              <div
                className="pointer-events-none absolute left-1/2 top-[-1.35rem] z-[22] -translate-x-1/2 md:top-[-1.45rem]"
                style={{ marginTop: hookNudgeY(index, n) }}
              >
                <Fastener className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)] scale-[1.12]" />
              </div>
              <div
                className="relative z-[12] rounded-[2px] bg-white p-3 pb-4 md:p-3.5 md:pb-5
                  shadow-[0_20px_50px_rgba(0,0,0,0.16),0_3px_0_rgba(255,255,255,0.9)_inset]
                  ring-1 ring-black/[0.07] transition-[box-shadow,transform] duration-500 ease-out
                  group-hover:shadow-[0_28px_64px_rgba(0,0,0,0.2)] group-hover:-translate-y-0.5"
              >
                <div className="flex w-full items-center justify-center overflow-hidden bg-neutral-900">
                  <img
                    src={item.img}
                    alt=""
                    className="max-h-[min(44vw,340px)] sm:max-h-[min(42vw,380px)] md:max-h-[min(38vw,400px)] w-full max-w-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    draggable={false}
                  />
                </div>
                <p className="mt-3 md:mt-4 px-1 text-center text-sm md:text-[0.95rem] leading-snug text-neutral-600 tracking-wide lowercase">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          );

          const key = `${segmentKey}-${item.img}-${index}`;

          if (hasLink && href) {
            return (
              <motion.a
                key={key}
                href={href}
                onClick={onNavigate(href)}
                tabIndex={ariaHidden ? -1 : undefined}
                aria-hidden={ariaHidden}
                aria-label={
                  ariaHidden ? undefined : `${item.subtitle}. Open section.`
                }
                className="group relative z-[10] shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)]"
                {...entrance}
              >
                {polaroidInner}
              </motion.a>
            );
          }

          return (
            <motion.div
              key={key}
              aria-hidden={ariaHidden}
              className="group relative z-[10] shrink-0"
              {...entrance}
            >
              {polaroidInner}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

type RopePolaroidGalleryProps = {
  items: WorkGalleryItem[];
};

const RopePolaroidGallery = ({ items }: RopePolaroidGalleryProps) => {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const ropeGradientId = useId().replace(/:/g, "");
  const segmentRef = useRef<HTMLDivElement>(null);
  const [segmentWidth, setSegmentWidth] = useState(0);

  useLayoutEffect(() => {
    const el = segmentRef.current;
    if (!el) return;
    const measure = () => setSegmentWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleClick =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (href === pathname) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      router.push(href);
    };

  /** ~42px/s travel — scales with strip width so the loop stays seamless. */
  const marqueeDuration =
    segmentWidth > 0 ? Math.max(28, segmentWidth / 42) : 0;

  const runMarquee = !reduceMotion && segmentWidth > 0;

  return (
    <section
      className="relative w-full bg-[var(--background)] pt-12 sm:pt-14 md:pt-16 lg:pt-20 pb-16 sm:pb-20 md:pb-28 lg:pb-32"
      aria-label="Gallery of things"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(ellipse 70% 45% at 50% 0%, rgba(120, 90, 60, 0.07), transparent 50%)`,
        }}
      />

      <div className="relative z-[1] w-full max-w-[2000px] mx-auto px-3 sm:px-5 md:px-8">
        <header className="max-w-3xl">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.42em] text-neutral-500 mb-2 sm:mb-3">
            scraps &amp; frames
          </p>
          <h2
            className="text-[clamp(2.25rem,8vw,4.75rem)] font-semibold tracking-[-0.03em] text-neutral-900 leading-[0.95] lowercase"
          >
            gallery of{" "}
            <span className="italic font-normal text-neutral-600">things</span>
          </h2>
          <p className="mt-3 md:mt-4 max-w-xl text-[0.95rem] sm:text-base md:text-lg text-neutral-600 leading-relaxed">
            Endless line — tilts, drifts left, loops forever. Click a frame if
            it catches you.
          </p>
          <div
            className="mt-6 md:mt-8 h-px w-full max-w-md"
            style={{ background: "rgba(23,23,23,0.12)" }}
            aria-hidden
          />
        </header>
      </div>

      <div
        className="relative z-[1] w-full overflow-x-clip mt-6 sm:mt-8 md:mt-10 pt-1"
        role="region"
        aria-label="Scrolling polaroid gallery"
      >
        {/* Side vignette — light touch so photos stay vivid */}
        <div
          className="pointer-events-none absolute inset-y-2 left-0 right-0 z-10 opacity-[0.32] sm:opacity-[0.28]"
          style={{
            background:
              "linear-gradient(to right, var(--background) 0%, transparent 16%, transparent 84%, var(--background) 100%)",
          }}
          aria-hidden
        />

        <motion.div
          className="flex w-max max-w-none will-change-transform pointer-events-none"
          style={{
            transformOrigin: "50% 50%",
          }}
          animate={
            runMarquee
              ? {
                  x: [0, -segmentWidth],
                  rotate: [-2.8, -2.2, -2.8],
                }
              : reduceMotion
                ? { x: 0, rotate: -2.4 }
                : { x: 0, rotate: [-2.8, -2.2, -2.8] }
          }
          transition={
            runMarquee
              ? {
                  x: {
                    duration: marqueeDuration,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  rotate: {
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
              : {
                  x: { duration: 0 },
                  rotate: reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                }
          }
        >
          <div className="pointer-events-auto flex flex-row">
            <PolaroidSegment
              items={items}
              gradientId={`${ropeGradientId}-a`}
              segmentKey="a"
              reduceMotion={reduceMotion}
              onNavigate={handleClick}
              segmentRef={segmentRef}
            />
            {!reduceMotion ? (
              <PolaroidSegment
                items={items}
                gradientId={`${ropeGradientId}-b`}
                segmentKey="b"
                reduceMotion={reduceMotion}
                onNavigate={handleClick}
                ariaHidden
              />
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RopePolaroidGallery;
