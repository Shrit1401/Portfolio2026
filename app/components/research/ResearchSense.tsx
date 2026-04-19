import React, { useEffect, useState } from "react";
import { useTransitionRouter } from "next-transition-router";
import { usePathname } from "next/navigation";
import { getAdjacentResearch } from "@/app/lib/server";

interface AdjacentItem {
  slug: string;
  title: string;
}

interface AdjacentResearch {
  previous: AdjacentItem | null;
  next: AdjacentItem | null;
}

const ResearchSense = () => {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const [adjacent, setAdjacent] = useState<AdjacentResearch>({ previous: null, next: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = pathname.split("/").pop();
    if (slug) {
      getAdjacentResearch(slug).then((data) => {
        setAdjacent(data);
        setLoading(false);
      });
    }
  }, [pathname]);

  if (loading || (!adjacent.previous && !adjacent.next)) return null;

  const navigate = (slug: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/research/${slug}`);
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto px-6 py-12 border-t border-neutral-200"
      style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
    >
      <div className="flex items-start justify-between gap-8">
        {adjacent.previous ? (
          <button
            onClick={navigate(adjacent.previous.slug)}
            className="group flex flex-col items-start text-left max-w-[45%]"
          >
            <span className="text-xs text-neutral-400 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>← Previous</span>
            <span className="text-base md:text-lg font-bold text-neutral-700 group-hover:text-neutral-900 transition-colors duration-200 leading-snug">
              {adjacent.previous.title}
            </span>
          </button>
        ) : <div />}

        {adjacent.next ? (
          <button
            onClick={navigate(adjacent.next.slug)}
            className="group flex flex-col items-end text-right max-w-[45%]"
          >
            <span className="text-xs text-neutral-400 uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Next →</span>
            <span className="text-base md:text-lg font-bold text-neutral-700 group-hover:text-neutral-900 transition-colors duration-200 leading-snug">
              {adjacent.next.title}
            </span>
          </button>
        ) : <div />}
      </div>
    </div>
  );
};

export default ResearchSense;
