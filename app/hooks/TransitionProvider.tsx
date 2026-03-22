"use client";

import React, {
  ReactNode,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";
import { HERO_COLOR_VALUES } from "@/app/lib/heroPalette";

const BLOCK_SIZE = 100;

function pickHeroColor(): string {
  return HERO_COLOR_VALUES[
    Math.floor(Math.random() * HERO_COLOR_VALUES.length)
  ]!;
}

function setUniformBlockColor(blocks: HTMLDivElement[], color: string) {
  for (const el of blocks) {
    el.style.backgroundColor = color;
  }
}

const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const transitionGridRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement[]>([]);

  const buildGrid = useCallback(() => {
    const container = transitionGridRef.current;
    if (!container || typeof window === "undefined") return;

    container.innerHTML = "";
    blockRef.current = [];

    const gridWidth = window.innerWidth;
    const gridHeight = window.innerHeight;

    const cols = Math.ceil(gridWidth / BLOCK_SIZE);
    const rows = Math.ceil(gridHeight / BLOCK_SIZE) + 1;

    const offsetX = (gridWidth - cols * BLOCK_SIZE) / 2;
    const offsetY = (gridHeight - rows * BLOCK_SIZE) / 2;
    const fill = pickHeroColor();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const block = document.createElement("div");
        block.className = "transition-block";
        block.style.cssText = `
          width: ${BLOCK_SIZE}px;
          height: ${BLOCK_SIZE}px;
          left: ${col * BLOCK_SIZE + offsetX}px;
          top: ${row * BLOCK_SIZE + offsetY}px;
          background-color: ${fill};
        `;
        container.appendChild(block);
        blockRef.current.push(block);
      }
    }

    gsap.set(blockRef.current, { opacity: 0 });
  }, []);

  useLayoutEffect(() => {
    buildGrid();
  }, [buildGrid]);

  useEffect(() => {
    window.addEventListener("resize", buildGrid);
    return () => window.removeEventListener("resize", buildGrid);
  }, [buildGrid]);

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        if (blockRef.current.length === 0) buildGrid();
        const targets = blockRef.current;
        if (targets.length === 0) {
          next();
          return () => {};
        }
        setUniformBlockColor(targets, pickHeroColor());
        const tween = gsap.to(targets, {
          opacity: 1,
          duration: 0.35,
          ease: "power2.inOut",
          stagger: { amount: 0.45, from: "random" },
          onComplete: next,
        });
        return () => tween.kill();
      }}
      enter={(next) => {
        if (blockRef.current.length === 0) buildGrid();
        const targets = blockRef.current;
        if (targets.length === 0) {
          next();
          return () => {};
        }
        gsap.set(targets, { opacity: 1 });
        const tween = gsap.to(targets, {
          opacity: 0,
          duration: 0.4,
          delay: 0.15,
          ease: "power2.inOut",
          stagger: { amount: 0.45, from: "random" },
          onComplete: next,
        });
        return () => tween.kill();
      }}
    >
      <div ref={transitionGridRef} className="transition-grid" aria-hidden />
      {children}
    </TransitionRouter>
  );
};

export default TransitionProvider;
