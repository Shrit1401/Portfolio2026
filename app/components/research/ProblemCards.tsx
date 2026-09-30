"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const problems = [
  {
    id: "materials",
    title: "Finding Books & Materials",
    description:
      "Parents struggle to find the right books and raw materials for homeschooling. There's no central marketplace or curated resource list.",
    image: "https://i.postimg.cc/1X34YRf3/image-1.png",
  },
  {
    id: "study-buddy",
    title: "Study Buddy System",
    description:
      "A study buddy for each kid, so learning feels less boring and more fun. Could include games and silly activities to keep them excited.",
  },
  {
    id: "curriculum",
    title: "Curriculum Selection",
    description:
      "Choosing a good curriculum is hard — too many options, most feel dull. Parents often don't know which one to pick.",
  },
  {
    id: "getting-started",
    title: "Getting Started Guide",
    description:
      "A lot of people want to start homeschooling but don't know how to set it up or where to begin. It all feels confusing.",
  },
];

export default function ProblemCards({ className = "" }: { className?: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className={className}>
      <p
        className="mb-1 text-xs font-medium uppercase tracking-widest text-neutral-400"
        style={{ fontFamily: "var(--font-geist), sans-serif" }}
      >
        Opportunities
      </p>
      <p className="mb-6 text-neutral-600 text-sm" style={{ fontFamily: "var(--font-newsreader), Georgia, serif", fontStyle: "italic" }}>
        Problems worth solving — click to explore
      </p>

      <div className="space-y-3">
        {problems.map((problem, i) => {
          const isExpanded = expandedId === problem.id;
          return (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              onClick={() => setExpandedId(isExpanded ? null : problem.id)}
              className={`cursor-pointer border-b border-neutral-200/70 pb-3 transition-colors ${
                isExpanded ? "border-neutral-300" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-[0.95rem] font-medium text-neutral-800">{problem.title}</h4>
                <motion.span
                  className="text-neutral-400 text-sm"
                  animate={{ rotate: isExpanded ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  +
                </motion.span>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                      {problem.description}
                    </p>
                    {problem.image && (
                      <img
                        src={problem.image}
                        alt={problem.title}
                        className="mt-3 rounded-lg border border-neutral-100 w-full max-w-md"
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
