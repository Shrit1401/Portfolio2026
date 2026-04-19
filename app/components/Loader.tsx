"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { LOADER_EXIT_START } from "../lib/loader-events";

const EXIT_DURATION = 1.45;

export default function Loader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const root = loaderRef.current;
    if (!root) return;

    gsap.set(root, { opacity: 1, visibility: "visible" });

    const dots = dotRefs.current.filter(Boolean) as HTMLSpanElement[];
    dots.forEach((dot, i) => {
      gsap.fromTo(
        dot,
        { opacity: 0.2, y: 0 },
        {
          opacity: 1,
          y: -6,
          duration: 0.4,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: i * 0.15,
        }
      );
    });

    const timer = setTimeout(() => {
      if (!root) return;
      document.dispatchEvent(new CustomEvent(LOADER_EXIT_START));
      gsap.to(root, {
        opacity: 0,
        duration: EXIT_DURATION,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(root, { visibility: "hidden" });
        },
      });
    }, 600);

    return () => {
      clearTimeout(timer);
      gsap.killTweensOf([root, ...dots]);
    };
  }, []);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none"
      style={{ visibility: "visible", background: "#f7f5f1" }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            ref={(el) => { dotRefs.current[i] = el; }}
            className="block w-1.5 h-1.5 rounded-full bg-neutral-400"
          />
        ))}
      </div>
    </div>
  );
}
