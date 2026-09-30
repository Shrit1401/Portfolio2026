"use client";

import { useState, useRef } from "react";

// Downsampled from output/loss_history.csv — real training run on shrit.txt (MPS, M2, 267 min)
const TRAIN_MAIN = [
  { iter: 0,     loss: 4.744 },
  { iter: 250,   loss: 2.524 },
  { iter: 500,   loss: 2.339 },
  { iter: 1000,  loss: 1.241 },
  { iter: 1500,  loss: 0.560 },
  { iter: 2000,  loss: 0.412 },
  { iter: 3000,  loss: 0.360 },
  { iter: 5000,  loss: 0.247 },
  { iter: 7500,  loss: 0.202 },
  { iter: 10000, loss: 0.132 },
  { iter: 15000, loss: 0.075 },
  { iter: 20000, loss: 0.055 },
  { iter: 25000, loss: 0.050 },
];
const VAL_MAIN = [
  { iter: 0,     loss: 4.747 },
  { iter: 250,   loss: 2.504 },
  { iter: 500,   loss: 2.286 },
  { iter: 1000,  loss: 0.953 },
  { iter: 1500,  loss: 0.254 },
  { iter: 2000,  loss: 0.119 },
  { iter: 3000,  loss: 0.084 },
  { iter: 5000,  loss: 0.073 },
  { iter: 7500,  loss: 0.067 },
  { iter: 10000, loss: 0.061 },
  { iter: 15000, loss: 0.058 },
  { iter: 20000, loss: 0.057 },
  { iter: 25000, loss: 0.057 },
];
// finetune phase: lr drops from 8e-5 → 8e-6 over 8000 iters
const TRAIN_FT = [
  { iter: 25000, loss: 0.050 },
  { iter: 27000, loss: 0.051 },
  { iter: 29000, loss: 0.049 },
  { iter: 31000, loss: 0.047 },
  { iter: 33000, loss: 0.045 },
];
const VAL_FT = [
  { iter: 25000, loss: 0.057 },
  { iter: 27000, loss: 0.057 },
  { iter: 29000, loss: 0.057 },
  { iter: 31000, loss: 0.061 },
  { iter: 33000, loss: 0.058 },
];

const VW = 600, VH = 260;
const ML = 44, MR = 20, MT = 15, MB = 38;
const CW = VW - ML - MR;
const CH = VH - MT - MB;
const Y_MIN = 0.0, Y_MAX = 5.0;

function xOf(iter: number, maxIter: number) {
  return ML + (iter / maxIter) * CW;
}
function yOf(loss: number) {
  return MT + ((Y_MAX - loss) / (Y_MAX - Y_MIN)) * CH;
}
function toPath(pts: { iter: number; loss: number }[], maxIter: number) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.iter, maxIter).toFixed(1)} ${yOf(p.loss).toFixed(1)}`).join(" ");
}
function lerp(pts: { iter: number; loss: number }[], targetIter: number) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (targetIter >= a.iter && targetIter <= b.iter) {
      const t = (targetIter - a.iter) / (b.iter - a.iter);
      return a.loss + t * (b.loss - a.loss);
    }
  }
  return pts[pts.length - 1].loss;
}

export default function TrainingLossChart({ className = "" }: { className?: string }) {
  const [showFt, setShowFt] = useState(false);
  const [scrubber, setScrubber] = useState<{ x: number; iter: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const maxIter = showFt ? 33000 : 25000;
  const trainPts = showFt ? [...TRAIN_MAIN, ...TRAIN_FT.slice(1)] : TRAIN_MAIN;
  const valPts = showFt ? [...VAL_MAIN, ...VAL_FT.slice(1)] : VAL_MAIN;

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VW;
    const chartX = Math.max(ML, Math.min(ML + CW, svgX));
    const iter = Math.round(((chartX - ML) / CW) * maxIter);
    setScrubber({ x: chartX, iter });
  }

  const scrubTrain = scrubber ? lerp(trainPts, scrubber.iter) : null;
  const scrubVal = scrubber ? lerp(valPts, scrubber.iter) : null;

  const yTicks = [0, 1, 2, 3, 4, 5];
  const xTicks = Array.from({ length: 6 }, (_, i) => Math.round((i / 5) * maxIter));

  const tooltipX = scrubber ? Math.min(scrubber.x + 8, ML + CW - 112) : 0;

  return (
    <div className={`border border-neutral-200 rounded-md p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="text-sm font-semibold tracking-tight text-neutral-900">
          Training Loss
        </span>
        <button
          onClick={() => setShowFt((s) => !s)}
          className={`text-xs font-mono px-3 py-1 rounded border transition-colors ${
            showFt
              ? "bg-blue-700 text-white border-blue-700"
              : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
          }`}
        >
          {showFt ? "▸ w/ fine-tune" : "fine-tune off"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          // pan-y keeps vertical page scroll on phones while a horizontal drag scrubs.
          style={{ minWidth: 300, display: "block", cursor: "crosshair", touchAction: "pan-y" }}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => setScrubber(null)}
        >
          {yTicks.map((loss) => (
            <line key={loss} x1={ML} y1={yOf(loss)} x2={ML + CW} y2={yOf(loss)} stroke="#e5e7eb" strokeWidth="1" />
          ))}

          {/* vertical dashed line at iter=25000 (always shown — marks train→finetune boundary) */}
          <line
            x1={xOf(25000, maxIter)} y1={MT}
            x2={xOf(25000, maxIter)} y2={MT + CH}
            stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,3"
          />
          <text
            x={xOf(25000, maxIter) - 4} y={MT + 10}
            textAnchor="end" fontSize="8" fontFamily="ui-monospace,monospace" fill="#9ca3af"
          >
            25k
          </text>

          {showFt && (
            <rect
              x={xOf(25000, maxIter)} y={MT}
              width={xOf(33000, maxIter) - xOf(25000, maxIter)} height={CH}
              fill="rgba(29,78,216,0.04)"
              stroke="rgba(29,78,216,0.18)" strokeWidth="1" strokeDasharray="4,3"
            />
          )}
          {showFt && (
            <text x={xOf(29000, maxIter)} y={MT + 12} textAnchor="middle" fontSize="9" fontFamily="ui-monospace,monospace" fill="rgba(29,78,216,0.5)">
              fine-tune (lr 8e-5 → 8e-6)
            </text>
          )}

          <path d={toPath(valPts, maxIter)} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5,3" />
          <path d={toPath(trainPts, maxIter)} fill="none" stroke="#1d4ed8" strokeWidth="2" />

          {scrubber && scrubTrain !== null && scrubVal !== null && (
            <>
              <line x1={scrubber.x} y1={MT} x2={scrubber.x} y2={MT + CH} stroke="#d1d5db" strokeWidth="1" />
              <circle cx={scrubber.x} cy={yOf(scrubTrain)} r="3.5" fill="#1d4ed8" />
              <circle cx={scrubber.x} cy={yOf(scrubVal)} r="3" fill="#9ca3af" />
              <rect x={tooltipX} y={MT + 8} width={104} height={50} rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
              <text x={tooltipX + 6} y={MT + 21} fontSize="9" fontFamily="ui-monospace,monospace" fill="#374151">
                iter: {scrubber.iter.toLocaleString()}
              </text>
              <text x={tooltipX + 6} y={MT + 33} fontSize="9" fontFamily="ui-monospace,monospace" fill="#1d4ed8">
                train: {scrubTrain.toFixed(3)}
              </text>
              <text x={tooltipX + 6} y={MT + 45} fontSize="9" fontFamily="ui-monospace,monospace" fill="#9ca3af">
                val: {scrubVal.toFixed(3)}
              </text>
            </>
          )}

          {yTicks.map((loss) => (
            <text key={loss} x={ML - 5} y={yOf(loss) + 3} textAnchor="end" fontSize="9" fontFamily="ui-monospace,monospace" fill="#9ca3af">
              {loss.toFixed(1)}
            </text>
          ))}
          {xTicks.map((iter) => (
            <text key={iter} x={xOf(iter, maxIter)} y={VH - 6} textAnchor="middle" fontSize="9" fontFamily="ui-monospace,monospace" fill="#9ca3af">
              {iter >= 1000 ? `${iter / 1000}k` : iter}
            </text>
          ))}

          <line x1={ML} y1={MT} x2={ML} y2={MT + CH} stroke="#e5e7eb" strokeWidth="1" />
          <line x1={ML} y1={MT + CH} x2={ML + CW} y2={MT + CH} stroke="#e5e7eb" strokeWidth="1" />

          <line x1={ML + CW - 78} y1={MT + 7} x2={ML + CW - 64} y2={MT + 7} stroke="#1d4ed8" strokeWidth="2" />
          <text x={ML + CW - 61} y={MT + 10} fontSize="9" fontFamily="ui-monospace,monospace" fill="#6b7280">train</text>
          <line x1={ML + CW - 78} y1={MT + 19} x2={ML + CW - 64} y2={MT + 19} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4,2" />
          <text x={ML + CW - 61} y={MT + 22} fontSize="9" fontFamily="ui-monospace,monospace" fill="#6b7280">val</text>
        </svg>
      </div>
      <p className="mt-2 text-xs font-mono text-neutral-400">
        hover to read off loss values · toggle fine-tune to see the lower-lr tail · val below train is expected — dropout (p=0.1) only active during training
      </p>
    </div>
  );
}
