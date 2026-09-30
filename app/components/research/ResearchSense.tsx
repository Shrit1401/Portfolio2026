"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAdjacentResearchBySlug } from "@/app/lib/researchData";

const ResearchSense = () => {
  const pathname = usePathname();

  const slug = pathname.split("/").pop() || "";
  const adjacent = getAdjacentResearchBySlug(slug);

  if (!adjacent.previous && !adjacent.next) return null;

  return (
    <div
      className="mx-auto w-full max-w-[44rem] border-t border-line px-4 py-10 md:py-12 lg:max-w-[46rem] xl:max-w-[48rem]"
      style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
    >
      <div className="flex items-start justify-between gap-8">
        {adjacent.previous ? (
          <Link
            href={`/posts/${adjacent.previous.slug}`}
            className="group flex flex-col items-start text-left max-w-[45%]"
          >
            <span className="mb-1 text-[11px] uppercase tracking-[0.18em] text-neutral-400" style={{ fontFamily: "var(--font-geist), sans-serif" }}>← Previous</span>
            <span className="text-base leading-snug text-neutral-700 transition-colors duration-200 group-hover:text-neutral-900 md:text-lg">
              {adjacent.previous.title}
            </span>
          </Link>
        ) : <div />}

        {adjacent.next ? (
          <Link
            href={`/posts/${adjacent.next.slug}`}
            className="group flex flex-col items-end text-right max-w-[45%]"
          >
            <span className="mb-1 text-[11px] uppercase tracking-[0.18em] text-neutral-400" style={{ fontFamily: "var(--font-geist), sans-serif" }}>Next →</span>
            <span className="text-base leading-snug text-neutral-700 transition-colors duration-200 group-hover:text-neutral-900 md:text-lg">
              {adjacent.next.title}
            </span>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
};

export default ResearchSense;
