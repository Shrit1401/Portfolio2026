"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HEAD_NAMES = ["diagonal", "positional", "first-tok", "broad", "sparse", "previous"];
const TOKENS6 = ["them", ":", "who", "is", "shrit", "?"];

type HeadMatrix = (number | null)[][];

const HEAD_WEIGHTS: HeadMatrix[] = [
  [
    [1.00, null, null, null, null, null],
    [0.12, 0.88, null, null, null, null],
    [0.05, 0.05, 0.90, null, null, null],
    [0.03, 0.03, 0.04, 0.90, null, null],
    [0.02, 0.02, 0.03, 0.03, 0.90, null],
    [0.01, 0.01, 0.02, 0.02, 0.04, 0.90],
  ],
  [
    [1.00, null, null, null, null, null],
    [0.30, 0.70, null, null, null, null],
    [0.05, 0.35, 0.60, null, null, null],
    [0.02, 0.08, 0.35, 0.55, null, null],
    [0.01, 0.04, 0.10, 0.35, 0.50, null],
    [0.01, 0.02, 0.07, 0.10, 0.35, 0.45],
  ],
  [
    [1.00, null, null, null, null, null],
    [0.60, 0.40, null, null, null, null],
    [0.55, 0.25, 0.20, null, null, null],
    [0.50, 0.20, 0.15, 0.15, null, null],
    [0.45, 0.20, 0.15, 0.10, 0.10, null],
    [0.40, 0.18, 0.15, 0.10, 0.09, 0.08],
  ],
  [
    [1.00, null, null, null, null, null],
    [0.50, 0.50, null, null, null, null],
    [0.33, 0.33, 0.34, null, null, null],
    [0.25, 0.25, 0.25, 0.25, null, null],
    [0.20, 0.20, 0.20, 0.20, 0.20, null],
    [0.17, 0.17, 0.17, 0.17, 0.17, 0.15],
  ],
  [
    [1.00, null, null, null, null, null],
    [0.05, 0.95, null, null, null, null],
    [0.02, 0.03, 0.95, null, null, null],
    [0.70, 0.10, 0.10, 0.10, null, null],
    [0.05, 0.05, 0.05, 0.05, 0.80, null],
    [0.02, 0.02, 0.03, 0.03, 0.05, 0.85],
  ],
  [
    [1.00, null, null, null, null, null],
    [0.75, 0.25, null, null, null, null],
    [0.05, 0.75, 0.20, null, null, null],
    [0.02, 0.05, 0.78, 0.15, null, null],
    [0.02, 0.03, 0.05, 0.75, 0.15, null],
    [0.01, 0.02, 0.02, 0.05, 0.75, 0.15],
  ],
];

function MiniHeatmap({ weights, cellSize }: { weights: HeadMatrix; cellSize: number }) {
  return (
    <div>
      {weights.map((row, i) => (
        <div key={i} className="flex">
          {row.map((w, j) => (
            <div
              key={j}
              style={{
                width: cellSize,
                height: cellSize,
                margin: "0.5px",
                backgroundColor:
                  w === null ? "var(--color-gray-100, #f3f4f6)" : `rgba(29,78,216,${(w as number) * 0.85 + 0.05})`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function MultiHeadDiagram({ className = "" }: { className?: string }) {
  const [activeHead, setActiveHead] = useState<number | null>(null);

  return (
    <div className={`border border-neutral-200 rounded-md p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold tracking-tight text-neutral-900">
          Multi-Head Attention
        </span>
        {activeHead !== null && (
          <span className="text-xs font-mono text-blue-700">
            h{activeHead}: {HEAD_NAMES[activeHead]}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeHead !== null && (
          <motion.div
            key={activeHead}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden mb-5"
          >
            <div className="flex items-start gap-5 p-4 bg-neutral-50 rounded border border-neutral-200">
              <div className="shrink-0">
                <MiniHeatmap weights={HEAD_WEIGHTS[activeHead]} cellSize={30} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-mono text-neutral-700 font-semibold mb-2">
                  head {activeHead}: {HEAD_NAMES[activeHead]}
                </p>
                <div className="flex flex-col gap-[3px]">
                  {TOKENS6.map((t, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-neutral-400 w-10 text-right shrink-0">
                        {t}:
                      </span>
                      <div className="flex gap-[2px]">
                        {(HEAD_WEIGHTS[activeHead][i] as (number | null)[]).map((w, j) => (
                          <div
                            key={j}
                            className="h-[10px] rounded-sm"
                            style={{
                              width: 22,
                              backgroundColor:
                                w === null
                                  ? "var(--color-gray-200, #e5e7eb)"
                                  : `rgba(29,78,216,${(w as number) * 0.85 + 0.05})`,
                            }}
                            title={w === null ? "masked" : `${((w as number) * 100).toFixed(0)}%`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] font-mono text-neutral-400">
                  rows = query token · cols = key tokens (past only)
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {HEAD_WEIGHTS.map((weights, idx) => (
          <motion.button
            key={idx}
            onClick={() => setActiveHead(activeHead === idx ? null : idx)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded border transition-colors ${
              activeHead === idx
                ? "border-blue-600 bg-blue-50"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <MiniHeatmap weights={weights} cellSize={17} />
            <span className="text-[9px] font-mono text-neutral-500 w-full text-center truncate">
              h{idx}: {HEAD_NAMES[idx]}
            </span>
          </motion.button>
        ))}
      </div>
      <p className="mt-3 text-xs font-mono text-neutral-400">
        click a head tile to expand its full attention pattern · real model: 6 heads × 64-dim each = 384 (concatenated back to n_embd)
      </p>
    </div>
  );
}
