"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import {
  LOADER_EXIT_START,
  LOADER_EXIT_FALLBACK_MS,
} from "../lib/loader-events";

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

const REVEAL_DURATION = 1.45;

function revealAnimated(el: HTMLElement | null) {
  if (!el) return;
  gsap.to(el, {
    scaleY: 0,
    duration: REVEAL_DURATION,
    ease: "hop",
  });
}

function revealRouteOverlay(el: HTMLElement | null) {
  if (!el) return;
  gsap.set(el, { scaleY: 1, transformOrigin: "center top" });
  gsap.to(el, {
    scaleY: 0,
    duration: REVEAL_DURATION,
    ease: "hop",
  });
}

export type UseRevealerOptions = {
  /** Only `/` uses the polaroid Loader — other routes must not wait for its event. */
  waitForLoader?: boolean;
  /** Ref to this page’s revealer node (so we don’t touch other instances). */
  revealerRef?: RefObject<HTMLElement | null>;
};

export function useRevealer(options?: UseRevealerOptions) {
  const waitForLoader = options?.waitForLoader ?? false;
  const revealerRef = options?.revealerRef;

  useEffect(() => {
    if (waitForLoader) return;

    const el = revealerRef?.current;
    if (!el) return;

    gsap.set(el, { scaleY: 1, transformOrigin: "center top" });
    const t = window.requestAnimationFrame(() => {
      revealRouteOverlay(el);
    });

    return () => {
      window.cancelAnimationFrame(t);
      gsap.killTweensOf(el);
    };
  }, [waitForLoader, revealerRef]);

  useEffect(() => {
    if (!waitForLoader) return;

    let ran = false;
    const go = () => {
      if (ran) return;
      ran = true;
      window.clearTimeout(fallbackId);
      document.removeEventListener(LOADER_EXIT_START, go);
      revealAnimated(revealerRef?.current ?? null);
    };

    document.addEventListener(LOADER_EXIT_START, go, { once: true });
    const fallbackId = window.setTimeout(go, LOADER_EXIT_FALLBACK_MS);

    return () => {
      window.clearTimeout(fallbackId);
      document.removeEventListener(LOADER_EXIT_START, go);
    };
  }, [waitForLoader, revealerRef]);
}
