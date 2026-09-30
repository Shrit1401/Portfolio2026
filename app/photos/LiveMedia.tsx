"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Makes videos and GIFs on the board feel alive, the way they do on X (tweet media and uploaded video pins):
 * muted, looping autoplay while on screen, paused off screen, tap to turn the sound on.
 * react-tweet otherwise shows a still poster with a play button and "Watch on X".
 * Skipped entirely for people who prefer reduced motion (react-tweet's own click-to-play remains).
 */
export default function LiveMedia({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups: (() => void)[] = [];

    const enhance = (video: HTMLVideoElement) => {
      if (video.dataset.live) return;
      video.dataset.live = "1";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      // react-tweet puts the mp4 in a <source> child with preload="none"; setting src directly makes it load reliably.
      const source = video.querySelector("source");
      if (source && !video.getAttribute("src")) video.src = source.src;
      video.load();
      const box = video.parentElement!;
      box.classList.add("tweet-live");

      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "tweet-sound";
      const label = () => (pill.textContent = video.muted ? "tap for sound" : "sound on");
      label();
      const toggle = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        video.muted = !video.muted;
        if (video.paused) void video.play().catch(() => {});
        label();
      };
      pill.addEventListener("click", toggle);
      video.addEventListener("click", toggle);
      box.appendChild(pill);

      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      }, { threshold: 0.5 });
      io.observe(video);

      cleanups.push(() => {
        io.disconnect();
        video.removeEventListener("click", toggle);
        pill.remove();
      });
    };

    root.querySelectorAll("video").forEach(enhance);
    // react-tweet may render media after hydration.
    const mo = new MutationObserver(() => root.querySelectorAll("video").forEach(enhance));
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      cleanups.forEach((c) => c());
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
