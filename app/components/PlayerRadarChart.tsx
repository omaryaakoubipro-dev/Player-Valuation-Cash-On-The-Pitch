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

// Custom tick that wraps long labels across two lines so they never overflow.
function CustomTick(props: Record<string, unknown>) {
  const x = props.x as number;
  const y = props.y as number;
  const payload = props.payload as { value: string };
  const textAnchor = (props.textAnchor as string) ?? "middle";
  const label: string = payload.value ?? "";
  // Split on space or "/" into at most two lines (~14 chars per line)
  const words = label.split(/[\s/]+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 13 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);

  const lineHeight = 14;
  const totalHeight = lines.length * lineHeight;
  const startDy = -(totalHeight / 2) + lineHeight / 2;

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor as "start" | "middle" | "end" | "inherit"}
      fill="var(--color-muted)"
      fontSize={11}
      fontWeight={500}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? startDy : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export default function PlayerRadarChart({ data, playerName }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-primary mb-1">Performance Radar</h3>
      <p className="text-sm text-muted mb-4">
        Player vs. league average (100 = world class)
      </p>

      {/* Extra padding ensures labels are never clipped */}
      <ResponsiveContainer width="100%" height={340}>
        <RadarChart
          data={data}
          margin={{ top: 28, right: 68, bottom: 28, left: 68 }}
        >
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={(props) => <CustomTick {...props} />}
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
          {/* League average */}
          <Radar
            name="leagueAvg"
            dataKey="leagueAvg"
            stroke="var(--color-muted)"
            fill="var(--color-muted)"
            fillOpacity={0.15}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          {/* Player */}
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
            wrapperStyle={{ color: "var(--color-muted)", fontSize: "12px" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
