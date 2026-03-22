"use client";

import { motion } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import {
  BUILD_PROOF_ENTRIES,
  getHomeBuildProofEntries,
} from "@/app/lib/buildProof";

const entries = getHomeBuildProofEntries();
const showSeeAllLogs = BUILD_PROOF_ENTRIES.length > 0;

const CardText = ({
  entry,
  large,
}: {
  entry: (typeof entries)[0];
  large?: boolean;
}) => (
  <div className={`absolute bottom-5 left-5 right-5 z-10`}>
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
  </div>
);

const BuildLog = () => {
  const router = useTransitionRouter();

  const goToArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/archive#build-proof");
  };

  return (
    <section className="relative px-4 md:px-12 py-16 md:py-20 min-h-screen bg-background">
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
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: idx * 0.08 }}
            className="group relative flex-shrink-0 w-[72vw] h-[52vw] rounded-2xl overflow-hidden shadow-lg snap-start cursor-pointer"
            style={{ background: "#111" }}
          >
            <img
              src={entry.image}
              alt={entry.title}
              className="w-full h-full object-cover object-center group-hover:brightness-125 transition-all duration-500"
              draggable="false"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{entry.icon}</span>
                <p className="text-white/70 text-xs tracking-wide">
                  {entry.location} · {entry.date}
                </p>
              </div>
              <p className="text-white font-bold text-base leading-tight tracking-tight group-hover:tracking-wider transition-all duration-300">
                {entry.title}
              </p>
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
          className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer row-span-2"
          style={{ background: "#111" }}
        >
          <img
            src={entries[0].image}
            alt={entries[0].title}
            className="w-full h-full object-cover object-center group-hover:brightness-125 transition-all duration-500"
            draggable="false"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            aria-hidden="true"
          />
          <CardText entry={entries[0]} large />
        </motion.div>

        {/* Cards 1–4 — normal height, 2 per column */}
        {entries.slice(1).map((entry, i) => (
          <motion.div
            key={i + 1}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
              delay: (i + 1) * 0.08,
            }}
            className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer"
            style={{ background: "#111" }}
          >
            <img
              src={entry.image}
              alt={entry.title}
              className="w-full h-full object-cover object-center group-hover:brightness-125 transition-all duration-500"
              draggable="false"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
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
