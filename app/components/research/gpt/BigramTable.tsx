"use client";

import { useState } from "react";

// chars that dominate the DM corpus — every line is "me: ..." or "them: ..."
const CHARS = ["m", "e", "t", "h", ":", " "];

//           next→  m     e     t     h     :     ␣
const PROBS: number[][] = [
  /* m */ [0.02, 0.72, 0.04, 0.03, 0.03, 0.16],
  /* e */ [0.04, 0.05, 0.06, 0.07, 0.62, 0.16],
  /* t */ [0.03, 0.05, 0.04, 0.76, 0.03, 0.09],
  /* h */ [0.08, 0.62, 0.04, 0.03, 0.03, 0.20],
  /* : */ [0.02, 0.03, 0.02, 0.02, 0.01, 0.90],
  /* ␣ */ [0.28, 0.12, 0.22, 0.08, 0.02, 0.28],
];

function getTop3(rowIdx: number): Set<number> {
  const row = PROBS[rowIdx];
  const indices = [...row.keys()].sort((a, b) => row[b] - row[a]).slice(0, 3);
  return new Set(indices);
}

export default function BigramTable({ className = "" }: { className?: string }) {
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const top3 = activeRow !== null ? getTop3(activeRow) : new Set<number>();

  return (
    <div className={`border border-neutral-200 rounded-md p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="text-sm font-semibold tracking-tight text-neutral-900">
          Bigram Prediction Table
        </span>
        {activeRow !== null && (
          <span className="text-xs font-mono text-blue-700">
            &quot;{CHARS[activeRow]}&quot; → top 3 highlighted
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[280px]">
          <div className="flex mb-1">
            <div className="w-10 shrink-0" />
            {CHARS.map((c) => (
              <div key={c} className="flex-1 text-center text-xs font-mono text-neutral-400 py-1">
                {c}
              </div>
            ))}
          </div>
          {CHARS.map((rowChar, rowIdx) => (
            <div
              key={rowChar}
              className="flex items-center mb-1 cursor-pointer"
              onClick={() => setActiveRow(activeRow === rowIdx ? null : rowIdx)}
            >
              <div
                className={`w-10 shrink-0 text-xs font-mono font-semibold py-1 pr-2 text-right transition-colors ${
                  activeRow === rowIdx ? "text-blue-700" : "text-neutral-600"
                }`}
              >
                {rowChar}
              </div>
              {PROBS[rowIdx].map((prob, colIdx) => {
                const isTop3 = top3.has(colIdx) && activeRow === rowIdx;
                return (
                  <div
                    key={colIdx}
                    className={`flex-1 h-9 flex items-center justify-center text-[10px] font-mono rounded mx-px transition-all duration-150 border ${
                      isTop3
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                        : "border-transparent"
                    }`}
                    style={
                      isTop3
                        ? {}
                        : {
                            backgroundColor: `color-mix(in srgb, var(--color-ink) ${prob * 55}%, transparent)`,
                            color: prob > 0.3 ? "var(--color-paper)" : "var(--color-gray-500, #6b7280)",
                          }
                    }
                  >
                    {(prob * 100).toFixed(0)}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="mt-2 flex items-center gap-4 text-[10px] font-mono text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-neutral-800" />
              high prob
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-neutral-100 border border-neutral-200" />
              low prob
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded border border-blue-600 bg-blue-50" />
              top-3
            </span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs font-mono text-neutral-400">
        click a row label to see the top-3 most likely next characters · tuned to the DM corpus — every line starts me: or them:
      </p>
    </div>
  );
}
