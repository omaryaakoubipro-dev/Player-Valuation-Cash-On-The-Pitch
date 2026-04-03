"use client";

import { ValuationFactor } from "@/app/lib/types";

interface Props {
  factors: ValuationFactor[];
}

// Score to color gradient
function scoreColor(score: number): string {
  if (score >= 75) return "from-emerald-500 to-green-400";
  if (score >= 55) return "from-yellow-500 to-amber-400";
  if (score >= 35) return "from-orange-500 to-amber-400";
  return "from-red-500 to-rose-400";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Elite";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Good";
  if (score >= 35) return "Average";
  if (score >= 20) return "Below Avg";
  return "Weak";
}

export default function ValuationFactorsChart({ factors }: Props) {
  if (!factors || factors.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-primary mb-1">Valuation Factors</h3>
      <p className="text-sm text-muted mb-6">
        Weighted analysis of the key drivers behind this valuation
      </p>

      <div className="space-y-5">
        {factors.map((factor) => (
          <div key={factor.name}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-primary text-sm">{factor.name}</span>
                <span className="text-xs text-muted border border-border rounded-full px-2 py-0.5">
                  {factor.weight}% weight
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">{scoreLabel(factor.score)}</span>
                <span className="text-sm font-bold text-primary">{factor.score}/100</span>
              </div>
            </div>

            {/* Bar */}
            <div className="h-3 bg-surface-alt rounded-full overflow-hidden border border-border">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${scoreColor(factor.score)} transition-all duration-700`}
                style={{ width: `${factor.score}%` }}
              />
            </div>

            {/* Description */}
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              {factor.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
