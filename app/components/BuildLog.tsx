"use client";

import { motion } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HOME_BUILD_PROOF_LIMIT,
  type BuildProofEntry,
} from "@/app/lib/buildProof";
import { triggerPageTransition } from "@/app/lib/triggerPageTransition";
import { BuildLogLearnMore } from "./BuildLogLearnMore";
import {
  BuildLogCardOpenButton,
  BuildLogPolaroidModal,
} from "./BuildLogPolaroidModal";

const CardText = ({
  entry,
  large,
}: {
  entry: BuildProofEntry;
  large?: boolean;
}) => (
  <div className="pointer-events-none absolute bottom-5 left-5 right-5 z-[3]">
    <div className="flex items-center gap-2 mb-1">
      <span className={large ? "text-xl" : "text-base"}>{entry.icon}</span>
      <p className="text-white/70 text-xs tracking-wide">
        {entry.location} · {entry.date}
      </p>
    </div>
    <p
      className={`text-white font-bold leading-tight tracking-tight group-hover:tracking-wider transition-all duration-300 ${large ? "text-xl" : "text-base"}`}
    >
      {entry.title}
    </p>
    {entry.learnMoreUrl ? (
      <div className="pointer-events-auto mt-2">
        <BuildLogLearnMore href={entry.learnMoreUrl} />
      </div>
    ) : null}
  </div>
);

const BuildLog = ({ entries: allEntries }: { entries: BuildProofEntry[] }) => {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const [polaroidEntry, setPolaroidEntry] = useState<BuildProofEntry | null>(
    null,
  );
  const entries = allEntries.slice(0, HOME_BUILD_PROOF_LIMIT);
  const showSeeAllLogs = allEntries.length > 0;

  const goToArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/archive") {
      document
        .getElementById("build-proof")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    router.push("/archive#build-proof", {
      onTransitionReady: triggerPageTransition,
    });
  };

  if (entries.length === 0) return null;

  return (
    <section className="relative px-4 md:px-12 py-16 md:py-20 min-h-screen bg-background">
      <BuildLogPolaroidModal
        entry={polaroidEntry}
        onClose={() => setPolaroidEntry(null)}
      />
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-10 md:mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight lowercase">
            build proof.
          </h2>
          <div
            className="mt-4 h-px w-full"
            style={{ background: "rgba(23,23,23,0.18)" }}
          />
        </div>
        {showSeeAllLogs && (
          <button
            type="button"
            onClick={goToArchive}
            className="self-start sm:self-auto text-sm md:text-base font-medium text-black/60 hover:text-black tracking-tight lowercase underline underline-offset-4 decoration-black/25 hover:decoration-black/50 transition-colors"
          >
            see all build logs →
          </button>
        )}
      </motion.div>

      {/* Mobile: horizontal scroll */}
      <div className="flex md:hidden gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4">
        {entries.map((entry, idx) => (
          <motion.div
            key={entry.id ?? `${entry.title}-${idx}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: idx * 0.08 }}
            className="group relative flex-shrink-0 w-[72vw] h-[52vw] rounded-2xl overflow-hidden shadow-lg snap-start"
            style={{ background: "#111" }}
          >
            <BuildLogCardOpenButton entry={entry} onOpen={setPolaroidEntry} />
            <img
              src={entry.image}
              alt={entry.title}
              className="relative z-0 pointer-events-none w-full h-full object-cover object-center group-hover:brightness-125 transition-all duration-500"
              draggable="false"
            />
            <div
              className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              aria-hidden="true"
            />
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[3]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{entry.icon}</span>
                <p className="text-white/70 text-xs tracking-wide">
                  {entry.location} · {entry.date}
                </p>
              </div>
              <p className="text-white font-bold text-base leading-tight tracking-tight group-hover:tracking-wider transition-all duration-300">
                {entry.title}
              </p>
              {entry.learnMoreUrl ? (
                <div className="pointer-events-auto mt-2">
                  <BuildLogLearnMore href={entry.learnMoreUrl} />
                </div>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop: bento-style grid — fixed total height */}
      <div
        className="hidden md:grid grid-cols-3 gap-3"
        style={{ height: "75vh", gridTemplateRows: "1fr 1fr" }}
      >
        {/* Card 0 — tall, spans 2 rows */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0 }}
          className="group relative rounded-2xl overflow-hidden shadow-lg row-span-2"
          style={{ background: "#111" }}
        >
          <BuildLogCardOpenButton
            entry={entries[0]}
            onOpen={setPolaroidEntry}
          />
          <img
            src={entries[0].image}
            alt={entries[0].title}
            className="relative z-0 pointer-events-none w-full h-full object-cover object-center group-hover:brightness-125 transition-all duration-500"
            draggable="false"
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            aria-hidden="true"
          />
          <CardText entry={entries[0]} large />
        </motion.div>

        {/* Cards 1–4 — normal height, 2 per column */}
        {entries.slice(1).map((entry, i) => (
          <motion.div
            key={entry.id ?? `${entry.title}-${i + 1}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
              delay: (i + 1) * 0.08,
            }}
            className="group relative rounded-2xl overflow-hidden shadow-lg"
            style={{ background: "#111" }}
          >
            <BuildLogCardOpenButton entry={entry} onOpen={setPolaroidEntry} />
            <img
              src={entry.image}
              alt={entry.title}
              className="relative z-0 pointer-events-none w-full h-full object-cover object-center group-hover:brightness-125 transition-all duration-500"
              draggable="false"
            />
            <div
              className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              aria-hidden="true"
            />
            <CardText entry={entry} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default BuildLog;
