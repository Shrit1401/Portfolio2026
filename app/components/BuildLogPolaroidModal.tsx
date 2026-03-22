"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, type FC } from "react";
import type { BuildProofEntry } from "@/app/lib/buildProof";
import { BuildLogLearnMore } from "./BuildLogLearnMore";

/** Full-card hit target; keeps “learn more” clickable via pointer-events on siblings. */
export function BuildLogCardOpenButton({
  entry,
  onOpen,
  roundedClassName = "rounded-2xl",
}: {
  entry: BuildProofEntry;
  onOpen: (e: BuildProofEntry) => void;
  roundedClassName?: string;
}) {
  const label = `Open details: ${entry.title}`;
  return (
    <button
      type="button"
      aria-label={label}
      className={`absolute inset-0 z-[1] cursor-pointer border-0 bg-transparent p-0 ${roundedClassName}`}
      onClick={() => onOpen(entry)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(entry);
        }
      }}
    />
  );
}

type Props = {
  entry: BuildProofEntry | null;
  onClose: () => void;
};

export const BuildLogPolaroidModal: FC<Props> = ({ entry, onClose }) => {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!entry) return;
    document.addEventListener("keydown", handleKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [entry, handleKeyDown]);

  return (
    <AnimatePresence>
      {entry ? (
        <motion.div
          role="presentation"
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap');
              .buildlog-polaroid-hand {
                font-family: 'Caveat', cursive;
              }
            `}
          </style>
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-neutral-950/65 backdrop-blur-[6px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-[1] flex w-full max-w-3xl flex-col gap-6 md:flex-row md:items-stretch md:gap-8 md:justify-center"
            initial={{ opacity: 0, scale: 0.88, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.92, rotate: 2 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 28,
            }}
          >
            <figure className="buildlog-polaroid-paper relative mx-auto w-full max-w-[min(100%,320px)] shrink-0 bg-[#faf9f6] p-3 pb-9 shadow-[0_28px_80px_rgba(0,0,0,0.35),0_2px_0_rgba(255,255,255,0.5)_inset] ring-1 ring-black/[0.08] md:max-w-[340px]">
              <div className="relative aspect-square w-full overflow-hidden bg-neutral-300 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
                <img
                  src={entry.image}
                  alt={entry.title}
                  className="h-full w-full object-cover object-center"
                  draggable={false}
                />
              </div>
              <figcaption className="buildlog-polaroid-hand mt-5 px-1 text-center text-[1.65rem] leading-[1.15] text-neutral-800 md:text-[1.85rem]">
                <span className="mr-1" aria-hidden>
                  {entry.icon}
                </span>
                <span id={titleId}>{entry.title}</span>
              </figcaption>
              <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {entry.location}
                {entry.location && entry.date ? " · " : null}
                {entry.date}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-black/[0.06] text-lg text-neutral-700 transition-colors hover:bg-black/[0.1] hover:text-neutral-900"
                aria-label="Close polaroid"
              >
                ×
              </button>
            </figure>

            <motion.div
              className="flex min-h-0 min-w-0 flex-1 flex-col justify-center rounded-2xl border border-black/[0.08] bg-[#f8f6f0]/95 p-5 shadow-lg backdrop-blur-sm md:max-w-md md:self-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
            >
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                read more
              </p>
              {entry.story ? (
                <p className="mt-3 text-sm leading-relaxed text-neutral-800 md:text-[0.95rem]">
                  {entry.story}
                </p>
              ) : (
                <p className="mt-3 text-sm italic leading-relaxed text-neutral-600">
                  No long story here yet — add one in Sanity, or use learn more
                  below.
                </p>
              )}
              {entry.learnMoreUrl ? (
                <div className="mt-5 border-t border-black/[0.08] pt-4">
                  <BuildLogLearnMore
                    href={entry.learnMoreUrl}
                    className="text-sm font-medium tracking-tight lowercase text-neutral-800 underline underline-offset-4 decoration-neutral-400 hover:decoration-neutral-800 transition-colors"
                  />
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
