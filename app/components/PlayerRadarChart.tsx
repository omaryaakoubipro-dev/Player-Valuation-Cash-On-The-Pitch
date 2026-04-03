"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { RadarDataPoint } from "@/app/lib/types";

interface Props {
  data: RadarDataPoint[];
  playerName: string;
}

export default function PlayerRadarChart({ data, playerName }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-primary mb-1">Performance Radar</h3>
      <p className="text-sm text-muted mb-6">
        Player vs. league average for their position (100 = world class)
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "var(--color-muted)", fontSize: 11, fontWeight: 500 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              color: "var(--color-primary)",
              fontSize: "13px",
            }}
            formatter={(value, name) => [
              `${value}/100`,
              name === "playerValue" ? playerName : "League Average",
            ]}
          />
          {/* League average — filled softly */}
          <Radar
            name="leagueAvg"
            dataKey="leagueAvg"
            stroke="var(--color-muted)"
            fill="var(--color-muted)"
            fillOpacity={0.15}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          {/* Player — solid accent */}
          <Radar
            name="playerValue"
            dataKey="playerValue"
            stroke="var(--color-accent)"
            fill="var(--color-accent)"
            fillOpacity={0.25}
            strokeWidth={2.5}
          />
          <Legend
            formatter={(value) =>
              value === "playerValue" ? playerName : "League Average"
            }
            wrapperStyle={{ color: "var(--color-muted)", fontSize: "13px" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
