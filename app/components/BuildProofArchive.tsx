"use client";

import { motion } from "framer-motion";
import { BUILD_PROOF_ENTRIES } from "@/app/lib/buildProof";

const BuildProofArchive = () => {
  const entries = BUILD_PROOF_ENTRIES;
  if (entries.length === 0) return null;

  return (
    <section
      id="build-proof"
      className="relative w-full px-4 md:px-8 lg:px-10 py-16 md:py-24 bg-background font-instrument"
      aria-label="All build logs"
    >
      <div className="mb-8 md:mb-10 w-full">
        <h2 className="text-3xl md:text-4xl font-normal text-black tracking-tight leading-tight lowercase">
          all build logs.
        </h2>
        <div
          className="mt-3 h-px w-full"
          style={{ background: "rgba(23,23,23,0.18)" }}
        />
      </div>

      <ul className="grid w-full max-w-none grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 list-none p-0 m-0">
        {entries.map((entry, idx) => (
          <li key={`${entry.title}-${idx}`} className="min-w-0">
            <motion.figure
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.05 }}
              className="group m-0 h-full flex flex-col bg-[#fafafa] pt-2.5 px-2.5 sm:pt-3 sm:px-3 pb-7 sm:pb-9 shadow-[0_6px_28px_rgba(0,0,0,0.1),0_1px_0_rgba(0,0,0,0.04)] rounded-[2px] border border-black/[0.06]"
            >
              {/* Photo area — full bleed, object-cover; slightly taller than square */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-neutral-200 shrink-0">
                <img
                  src={entry.image}
                  alt={entry.title}
                  className="absolute inset-0 size-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                  draggable="false"
                  loading="lazy"
                />
              </div>
              {/* Polaroid caption strip */}
              <figcaption className="flex flex-col items-center justify-center text-center flex-1 pt-3.5 sm:pt-4 px-1.5 min-h-[4rem] sm:min-h-[4.25rem]">
                <p className="text-[11px] sm:text-xs text-neutral-500 italic tracking-wide leading-tight">
                  {entry.location} · {entry.date}
                </p>
                <p className="text-xs sm:text-sm md:text-[0.95rem] font-normal text-neutral-900 leading-snug mt-1.5 line-clamp-3">
                  <span className="mr-0.5" aria-hidden>
                    {entry.icon}
                  </span>
                  {entry.title}
                </p>
              </figcaption>
            </motion.figure>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default BuildProofArchive;
