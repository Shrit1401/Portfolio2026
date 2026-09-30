"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "6+", label: "months of active research" },
  { value: "8–12", label: "classes represented" },
  { value: "Multiple", label: "FB groups monitored" },
];

export default function SurveyStatCards({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-8 sm:gap-12 ${className}`}>
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="flex-1"
        >
          <p className="text-3xl font-bold tracking-tight text-neutral-800" style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}>
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-neutral-400 uppercase tracking-widest" style={{ fontFamily: "var(--font-geist), sans-serif" }}>
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
