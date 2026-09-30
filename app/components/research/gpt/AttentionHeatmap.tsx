"use client";

import { useState } from "react";

// tokens from a real DM-style prompt: "them : who is shrit ? me :"
const TOKENS = ["them", ":", "who", "is", "shrit", "?", "me", ":"];
const N = TOKENS.length;

// scaled by 1/√64 (head_size = n_embd/n_head = 384/6) — attention is smooth
const SCALED: number[][] = [
  [1.00, 0,    0,    0,    0,    0,    0,    0   ],
  [0.45, 0.55, 0,    0,    0,    0,    0,    0   ],
  [0.10, 0.15, 0.75, 0,    0,    0,    0,    0   ],
  [0.05, 0.08, 0.52, 0.35, 0,    0,    0,    0   ],
  [0.06, 0.08, 0.30, 0.28, 0.28, 0,    0,    0   ],
  [0.05, 0.05, 0.10, 0.10, 0.42, 0.28, 0,    0   ],
  [0.30, 0.32, 0.08, 0.06, 0.08, 0.06, 0.10, 0   ],
  [0.08, 0.10, 0.06, 0.05, 0.06, 0.05, 0.38, 0.22],
];

// unscaled — without ÷√dk the distribution spikes on the strongest logit
const UNSCALED: number[][] = [
  [1.00, 0,    0,    0,    0,    0,    0,    0   ],
  [0.08, 0.92, 0,    0,    0,    0,    0,    0   ],
  [0.03, 0.05, 0.92, 0,    0,    0,    0,    0   ],
  [0.02, 0.03, 0.88, 0.07, 0,    0,    0,    0   ],
  [0.02, 0.02, 0.10, 0.08, 0.78, 0,    0,    0   ],
  [0.01, 0.02, 0.03, 0.03, 0.86, 0.05, 0,    0   ],
  [0.10, 0.12, 0.02, 0.02, 0.03, 0.01, 0.70, 0   ],
  [0.02, 0.03, 0.02, 0.01, 0.02, 0.01, 0.82, 0.07],
];

export default function AttentionHeatmap({ className = "" }: { className?: string }) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [scaled, setScaled] = useState(true);
  const weights = scaled ? SCALED : UNSCALED;

  return (
    <div className={`border border-neutral-200 rounded-md p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="text-sm font-semibold tracking-tight text-neutral-900">
          Self-Attention Heatmap
        </span>
        <button
          onClick={() => setScaled((s) => !s)}
          className={`text-xs font-mono px-3 py-1 rounded border transition-colors ${
            scaled
              ? "bg-blue-700 text-white border-blue-700"
              : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
          }`}
        >
          {scaled ? "scaled ÷√dk" : "unscaled"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[340px]">
          <div className="flex mb-1 ml-[76px]">
            {TOKENS.map((t, j) => (
              <div
                key={j}
                className={`flex-1 text-center text-[10px] font-mono py-1 truncate px-0.5 transition-colors ${
                  hoveredRow !== null && j <= hoveredRow
                    ? "text-neutral-700 font-semibold"
                    : "text-neutral-400"
                }`}
              >
                {t}
              </div>
            ))}
          </div>
          {TOKENS.map((rowToken, i) => (
            <div
              key={i}
              className="flex items-center mb-[3px]"
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div
                className={`w-[76px] shrink-0 text-right pr-2 text-[10px] font-mono transition-colors ${
                  hoveredRow === i ? "text-blue-700 font-semibold" : "text-neutral-500"
                }`}
              >
                {rowToken}
              </div>
              {Array.from({ length: N }).map((_, j) => {
                const masked = j > i;
                const w = weights[i][j];
                const isActive = hoveredRow === i && !masked;
                return (
                  <div
                    key={j}
                    className={`flex-1 h-8 flex items-center justify-center text-[9px] font-mono rounded-sm mx-px transition-all duration-200 ${
                      masked ? "bg-neutral-100 text-neutral-300" : isActive ? "ring-1 ring-blue-400" : ""
                    }`}
                    style={
                      masked
                        ? {}
                        : {
                            backgroundColor: `rgba(29,78,216,${w * 0.85 + 0.05})`,
                            color: w > 0.4 ? "#fff" : w > 0.15 ? "var(--color-blue-900, #1e3a8a)" : "var(--color-gray-400, #9ca3af)",
                          }
                    }
                    title={masked ? "masked (future)" : `${(w * 100).toFixed(0)}%`}
                  >
                    {masked ? "×" : w > 0.07 ? (w * 100).toFixed(0) : ""}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] font-mono text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: "rgba(29,78,216,0.9)" }} />
              high attention
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: "rgba(29,78,216,0.15)" }} />
              low attention
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-neutral-100" />
              × masked (future)
            </span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs font-mono text-neutral-400">
        hover a row to see its attention pattern · toggle to see the ÷√dk smoothing effect · scaled by 1/√64 (head_size = n_embd/n_head = 384/6)
      </p>
    </div>
  );
}
