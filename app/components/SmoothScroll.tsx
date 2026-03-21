"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      autoRaf: true,
    });

    (window as any).lenis = lenisRef.current;

    return () => {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      delete (window as any).lenis;
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
