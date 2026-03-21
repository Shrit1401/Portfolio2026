"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 20, suffix: "+", label: "projects shipped" },
  { value: 5, suffix: "", label: "hackathons won" },
  { value: 50, suffix: "+", label: "experiments built" },
  { value: 10, suffix: "k+", label: "users reached" },
];

function useCountUp(target: number, duration = 1.8) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(id);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [isInView, target, duration]);

  return { count, ref };
}

const StatCell = ({
  stat,
  idx,
}: {
  stat: (typeof stats)[0];
  idx: number;
}) => {
  const { count, ref } = useCountUp(stat.value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: idx * 0.1 }}
      className="flex flex-col items-center text-center"
    >
      <p className="text-5xl md:text-6xl font-bold tracking-tight text-black leading-none">
        {count}
        <span className="text-[#37517b]">{stat.suffix}</span>
      </p>
      <p className="text-sm md:text-base text-gray-500 tracking-wide lowercase mt-2">
        {stat.label}
      </p>
    </motion.div>
  );
};

const StatsBar = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="bg-background px-4 md:px-12 py-14 md:py-16"
    >
      <div
        className="h-px w-full mb-12"
        style={{ background: "rgba(23,23,23,0.18)" }}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <StatCell key={idx} stat={stat} idx={idx} />
        ))}
      </div>
      <div
        className="h-px w-full mt-12"
        style={{ background: "rgba(23,23,23,0.18)" }}
      />
    </motion.section>
  );
};

export default StatsBar;
