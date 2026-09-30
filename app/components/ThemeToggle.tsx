"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { applyTheme, DARK_CLASS, setThemeOverride, type Theme } from "../lib/theme";

const REVEAL_CLASS = "theme-reveal";

/** Runs `update` inside a view transition when the browser supports it (default crossfade). */
function withTransition(update: () => void) {
  if (!document.startViewTransition) {
    update();
    return null;
  }
  return document.startViewTransition(update);
}

/** Footer switch between day and night. The pre-paint script in the layout sets the initial theme. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains(DARK_CLASS) ? "dark" : "light");
    // Re-check every minute so an open tab flips at 8pm / 6am (and when an override expires).
    const id = window.setInterval(() => {
      const dark = document.documentElement.classList.contains(DARK_CLASS);
      if (dark !== (applyTheme(false) === "dark")) withTransition(() => flushSync(() => setTheme(applyTheme())));
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const update = () =>
      flushSync(() => {
        const applied = setThemeOverride(next);
        // Storage blocked: still flip for this page view.
        if (applied !== next) document.documentElement.classList.toggle(DARK_CLASS, next === "dark");
        setTheme(next);
      });

    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !document.startViewTransition) {
      withTransition(update);
      return;
    }

    // The new theme grows out of the button as a circle until it covers the page.
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    root.classList.add(REVEAL_CLASS);
    const vt = document.startViewTransition(update);
    vt.ready
      .then(() =>
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(0.77, 0, 0.175, 1)", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
    vt.finished.finally(() => root.classList.remove(REVEAL_CLASS));
  };

  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      title="Dark from 8pm to 6am by default"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={`press inline-flex items-center gap-1.5 hover:text-ink ${theme ? "" : "invisible"} ${className}`}
    >
      <span className="relative grid h-3.5 w-3.5 place-items-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.svg
            key={dark ? "sun" : "moon"}
            aria-hidden
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.6, rotate: -90, filter: "blur(2px)" }}
            animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.6, rotate: 90, filter: "blur(2px)" }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            {dark ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </>
            ) : (
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            )}
          </motion.svg>
        </AnimatePresence>
      </span>
      {dark ? "Lights on" : "Lights off"}
    </button>
  );
}
