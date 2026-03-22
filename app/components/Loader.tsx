"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { LOADER_EXIT_START } from "../lib/loader-events";

const FRAME_COUNT = 7;
const FRAMES = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/loader/${i + 1}.png`,
);

/** Next card starts before previous fully settles */
const CARD_OVERLAP = 0.28;
const HOLD_LAST_DURATION = 0.38;
/** Aligned with `REVEAL_DURATION` in useRevealer for one continuous wipe */
const EXIT_DURATION = 1.45;

const IMAGE_WELL_BG = "#ebe6df";

type StackPose = {
  restRot: number;
  restX: number;
  restY: number;
  enterRot: number;
  enterY: number;
  enterScale: number;
  landDuration: number;
};

/** New random stack each visit; keeps tabs readable but avoids “only two directions.” */
function randomStackPoses(count: number): StackPose[] {
  const r = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
  const poses: StackPose[] = [];

  for (let i = 0; i < count; i++) {
    poses.push({
      restRot: r(-7.2, 7.2),
      restX: r(-11, 11),
      restY: r(-10, 10),
      enterRot: r(-18, 18),
      enterY: 54 + r(0, 36) + i * r(3, 10),
      enterScale: r(0.84, 0.92),
      landDuration: r(0.48, 0.64),
    });
  }

  // Hero card: a bit calmer
  poses[0] = {
    ...poses[0],
    restRot: r(-3.8, 3.8),
    restX: r(-5, 5),
    restY: r(-5, 5),
    enterRot: r(-11, 11),
    enterY: r(46, 62),
    enterScale: r(0.9, 0.95),
    landDuration: r(0.52, 0.62),
  };

  // Separate adjacent rest angles so the pile doesn’t look mirrored
  for (let i = 1; i < count; i++) {
    const prev = poses[i - 1].restRot;
    let rot = poses[i].restRot;
    if (Math.abs(rot - prev) < 2) {
      rot += rot >= prev ? r(2.5, 5) : -r(2.5, 5);
      poses[i] = { ...poses[i], restRot: Math.max(-8, Math.min(8, rot)) };
    }
  }

  return poses;
}

function preloadFrame(src: string) {
  return new Promise<void>((resolve) => {
    const im = new Image();
    im.onload = () => {
      const d = im.decode?.();
      if (d && typeof d.then === "function") {
        d.then(() => resolve()).catch(() => resolve());
      } else {
        resolve();
      }
    };
    im.onerror = () => resolve();
    im.src = src;
  });
}

function waitForCardImages(cards: HTMLDivElement[]) {
  return Promise.all(
    cards.map((card) => {
      const img = card.querySelector("img");
      if (!img) return Promise.resolve();
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
}

const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function Loader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = loaderRef.current;
    const stage = stageRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!root || !stage || cards.length !== FRAME_COUNT) return;

    let cancelled = false;
    let mainTl: gsap.core.Timeline | null = null;

    const poses = randomStackPoses(FRAME_COUNT);

    gsap.set(root, { opacity: 1, scale: 1, visibility: "visible" });

    cards.forEach((card, i) => {
      const p = poses[i]!;
      gsap.set(card, {
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "50% 85%",
        /** First polaroid visible in enter pose while assets load; rest stay hidden. */
        opacity: i === 0 ? 1 : 0,
        x: 0,
        y: p.enterY,
        rotation: p.enterRot,
        scale: p.enterScale,
        zIndex: i,
      });
    });

    const preload = () =>
      Promise.all(FRAMES.map((src) => preloadFrame(src))).then(() =>
        waitForCardImages(cards),
      );

    preload().then(() => {
      if (cancelled || !loaderRef.current || !stageRef.current) return;

      const r = loaderRef.current;
      const stack = cardRefs.current.filter(Boolean) as HTMLDivElement[];

      const tl = gsap.timeline();
      mainTl = tl;

      stack.forEach((card, i) => {
        const position = i === 0 ? 0 : `>-${CARD_OVERLAP}`;
        const p = poses[i]!;

        tl.to(
          card,
          {
            opacity: 1,
            x: p.restX,
            y: p.restY,
            rotation: p.restRot,
            scale: 1,
            duration: p.landDuration,
            ease: "power3.out",
          },
          position,
        );
      });

      tl.to({}, { duration: HOLD_LAST_DURATION }).to(r, {
        opacity: 0,
        duration: EXIT_DURATION,
        ease: "power2.inOut",
        onStart: () => {
          document.dispatchEvent(new CustomEvent(LOADER_EXIT_START));
        },
        onComplete: () => {
          gsap.set(r, { visibility: "hidden" });
        },
      });
    });

    return () => {
      cancelled = true;
      mainTl?.kill();
      gsap.killTweensOf([root, stage, ...cards]);
    };
  }, []);

  const backdropNoise = NOISE_BG;

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[999] flex min-h-[100dvh] items-center justify-center pointer-events-none overflow-x-hidden overflow-y-auto p-4 sm:p-6"
      style={{ visibility: "visible" }}
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 75% at 50% 42%, #f2efe8 0%, #e4dfd6 48%, #d6d1c9 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-multiply"
        style={{ backgroundImage: backdropNoise }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_160px_rgba(0,0,0,0.055)]"
        aria-hidden
      />
      <div
        ref={stageRef}
        className="relative z-10 mx-auto flex min-h-[min(82vh,560px)] w-full max-w-[min(94vw,500px)] items-center justify-center md:max-w-[520px]"
        style={{
          overflow: "visible",
          fontFamily: "var(--font-instrument-serif), Georgia, serif",
        }}
      >
        {FRAMES.map((src, i) => (
          <div
            key={src}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={`absolute w-[min(88vw,300px)] bg-white px-3 pt-3 pb-6 shadow-[0_20px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)] sm:w-[min(86vw,340px)] sm:pb-7 md:w-[min(70vw,400px)] md:px-3.5 md:pt-3.5 md:pb-8 lg:w-[min(440px,52vw)] ${i === 0 ? "opacity-100" : "opacity-0"}`}
            style={{ zIndex: i }}
          >
            <div
              className="relative aspect-[3/4] overflow-hidden"
              style={{
                backgroundColor: IMAGE_WELL_BG,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  filter: "contrast(1.05) saturate(1.06)",
                }}
                decoding="async"
                draggable={false}
                loading="eager"
                fetchPriority={i === 0 ? "high" : "low"}
              />
              {i === FRAME_COUNT - 1 ? (
                <div
                  className="pointer-events-none absolute inset-0 z-[1] opacity-[0.12] mix-blend-multiply"
                  style={{ backgroundImage: NOISE_BG }}
                  aria-hidden
                />
              ) : null}
            </div>
            <div className="mt-2.5 flex justify-between gap-2 px-0.5 text-[0.75rem] leading-none tracking-[0.01em] text-black sm:mt-3 sm:text-[0.8rem] md:text-[0.8125rem]">
              <span className="shrink-0">Shrit Shrivastava</span>
              <span className="shrink-0 text-right opacity-80">Loading...</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
