"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Box = { left: number; top: number; right: number; bottom: number };
const PIXEL = 3;

/** Native selection stays in charge of text and copying; this only paints its fringe. */
export default function SelectionPixels() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || pathname.startsWith("/studio")) return;
    const surface = canvas;
    const ctx = context;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let boxes: Box[] = [];

    function clear() {
      ctx.clearRect(0, 0, surface.width, surface.height);
    }

    function measure() {
      boxes = [];
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) return;
      const anchor = selection.anchorNode;
      const element = anchor instanceof Element ? anchor : anchor?.parentElement;
      if (element?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;

      for (let index = 0; index < selection.rangeCount; index++) {
        const selected = selection.getRangeAt(index);
        const root = selected.commonAncestorContainer;
        const walker = document.createTreeWalker(
          root.nodeType === Node.TEXT_NODE ? root.parentNode! : root,
          NodeFilter.SHOW_TEXT,
        );
        let node: Node | null;
        let visited = 0;
        while ((node = walker.nextNode()) && visited++ < 4000 && boxes.length < 800) {
          if (!node.textContent?.trim() || !selected.intersectsNode(node)) continue;
          const parent = node.parentElement;
          if (!parent || parent.closest('script, style, [aria-hidden="true"], input, textarea, [contenteditable]:not([contenteditable="false"])')) continue;
          const style = getComputedStyle(parent);
          if (style.visibility === "hidden" || style.userSelect === "none") continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          if (node === selected.startContainer) range.setStart(node, selected.startOffset);
          if (node === selected.endContainer) range.setEnd(node, selected.endOffset);
          for (const rect of range.getClientRects()) {
            if (rect.width < 1 || rect.height < 1 || rect.bottom < 0 || rect.top > innerHeight || rect.right < 0 || rect.left > innerWidth) continue;
            const box = { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
            // Inline links and word spans often split one selected line into many rects.
            const line = boxes.find((b) => Math.abs(b.top - box.top) < 2 && Math.abs(b.bottom - box.bottom) < 2 && box.left <= b.right + 2 && box.right >= b.left - 2);
            if (line) {
              line.left = Math.min(line.left, box.left);
              line.right = Math.max(line.right, box.right);
            } else boxes.push(box);
          }
        }
      }
    }

    function paint() {
      clear();
      if (!boxes.length || reducedMotion.matches || document.hidden) return;
      const anchor = window.getSelection()?.anchorNode;
      const element = anchor instanceof Element ? anchor : anchor?.parentElement;
      if (!element?.isConnected) return;
      // Read from the selected element so the forced-dark /e page works too.
      ctx.fillStyle = getComputedStyle(element).getPropertyValue("--selection-background").trim() || "#000";
      const phase = performance.now() / 140;
      let pixels = 0;
      function fringe(x: number, y: number, dx: number, dy: number) {
        // Travelling, stepped waves create a crawling edge rather than random noise.
        const along = dx === 0 ? x : y;
        const direction = dx + dy;
        const wave = Math.sin(along / 9 - phase * direction)
          + 0.5 * Math.sin(along / 4.5 + phase * 1.3);
        const depth = Math.max(0, Math.min(3, Math.round(1 + wave)));
        for (let step = 0; step < depth; step++) {
          if (pixels++ > 12000) break;
          const px = Math.round(x + dx * step * PIXEL);
          const py = Math.round(y + dy * step * PIXEL);
          // Never cover text or draw seams inside an adjacent selected line.
          if (boxes.some((b) => px + PIXEL > b.left && px < b.right && py + PIXEL > b.top && py < b.bottom)) break;
          ctx.fillRect(px, py, PIXEL, PIXEL);
        }
      }
      for (const box of boxes) {
        const left = Math.max(-PIXEL, box.left);
        const right = Math.min(innerWidth + PIXEL, box.right);
        const top = Math.max(-PIXEL, box.top);
        const bottom = Math.min(innerHeight + PIXEL, box.bottom);
        for (let x = left; x < right; x += PIXEL) {
          fringe(x, box.top - PIXEL, 0, -1);
          fringe(x, box.bottom, 0, 1);
        }
        for (let y = top; y < bottom; y += PIXEL) {
          fringe(box.left - PIXEL, y, -1, 0);
          fringe(box.right, y, 1, 0);
        }
        if (pixels > 12000) break;
      }
      timer = setTimeout(paint, 50);
    }

    function refresh() {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      frame = requestAnimationFrame(() => {
        measure();
        paint();
      });
    }

    function resize() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      surface.width = Math.round(innerWidth * ratio);
      surface.height = Math.round(innerHeight * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      refresh();
    }

    resize();
    document.addEventListener("selectionchange", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("scroll", refresh, { passive: true, capture: true });
    window.addEventListener("resize", resize);
    reducedMotion.addEventListener("change", refresh);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      clear();
      document.removeEventListener("selectionchange", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("scroll", refresh, true);
      window.removeEventListener("resize", resize);
      reducedMotion.removeEventListener("change", refresh);
    };
  }, [pathname]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] h-full w-full" />;
}
