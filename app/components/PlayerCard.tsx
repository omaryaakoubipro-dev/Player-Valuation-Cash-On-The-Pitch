"use client";

import { PlayerInfo } from "@/app/lib/types";
import { MapPin, Calendar, Ruler } from "lucide-react";

interface Props {
  player: PlayerInfo;
  salary: number;
  contractYearsRemaining: number;
}

const POSITION_BADGE: Record<string, { label: string; color: string }> = {
  Forward:    { label: "FW", color: "bg-red-500" },
  Midfielder: { label: "MF", color: "bg-blue-500" },
  Defender:   { label: "DF", color: "bg-green-500" },
  Goalkeeper: { label: "GK", color: "bg-yellow-500" },
};

function MetaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StatBox({ value, label, highlight }: { value: string | number; label: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center border ${
      highlight ? "bg-accent/10 border-accent/30" : "bg-surface-alt border-border"
    }`}>
      <div className={`text-xl font-bold ${highlight ? "text-accent" : "text-primary"}`}>
        {value}
      </div>
      <div className="text-xs text-muted mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

export default function PlayerCard({ player, salary, contractYearsRemaining }: Props) {
  const badge = POSITION_BADGE[player.position] ?? { label: "??", color: "bg-gray-500" };
  const s = player.stats;
  const quickStats = getQuickStats(player);

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-accent via-accent/60 to-transparent" />

      <div className="p-6">
        <div className="flex gap-5">
          {/* Avatar with initials */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 border-border bg-surface-alt flex items-center justify-center">
              <span className="text-3xl font-black text-accent">
                {player.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </span>
            </div>
            <span className={`absolute -bottom-2 -right-2 ${badge.color} text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg`}>
              {badge.label}
            </span>
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-primary truncate">
              {player.name}
            </h2>

            <div className="flex items-center gap-2 mt-1.5">
              <span className="font-medium text-primary">{player.club}</span>
              <span className="text-muted">·</span>
              <span className="text-muted text-sm">{player.league}</span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              <MetaItem icon={<Calendar size={14} />} label={`${player.age} years old`} />
              <MetaItem icon={<MapPin size={14} />} label={player.nationality} />
              {player.height && (
                <MetaItem icon={<Ruler size={14} />} label={player.height} />
              )}
            </div>
          </div>
        </div>

        {/* Contract info bar */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-surface-alt border border-border rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-primary">
              €{(salary * 12).toLocaleString()}
            </div>
            <div className="text-xs text-muted mt-0.5">Annual Salary</div>
          </div>
          <div className="bg-surface-alt border border-border rounded-xl p-3 text-center">
            <div className={`text-lg font-bold ${contractYearsRemaining <= 1 ? "text-red-400" : "text-primary"}`}>
              {contractYearsRemaining}y
            </div>
            <div className="text-xs text-muted mt-0.5">Contract Left</div>
          </div>
        </div>

        {/* Season stats */}
        {quickStats.length > 0 && (
          <>
            <div className="mt-4 mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted font-medium uppercase tracking-wider">
                {player.season} Season
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {quickStats.map((stat) => (
                <StatBox key={stat.label} {...stat} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function fmt(v: number | null | undefined, suffix = ""): string {
  if (v === null || v === undefined) return "—";
  return `${v}${suffix}`;
}

function getQuickStats(player: PlayerInfo) {
  const s = player.stats;
  const base = [
    { value: fmt(s.appearances), label: "Apps" },
    { value: fmt(s.minutesPlayed ? Math.round(s.minutesPlayed) : null), label: "Mins" },
  ];

  if (player.position === "Goalkeeper") {
    return [
      ...base,
      { value: fmt(s.goalsConceded), label: "Conceded" },
      { value: fmt(s.saves), label: "Saves", highlight: true },
      { value: fmt(s.savePercentage, "%"), label: "Save %" },
      { value: fmt(s.cleanSheets), label: "Clean Sheets", highlight: true },
    ];
  }
  if (player.position === "Defender") {
    return [
      ...base,
      { value: fmt(s.tackles), label: "Tackles", highlight: true },
      { value: fmt(s.interceptions), label: "Intercep.", highlight: true },
      { value: fmt(s.blocks), label: "Blocks" },
      { value: fmt(s.passAccuracy, "%"), label: "Pass Acc." },
    ];
  }
  if (player.position === "Midfielder") {
    return [
      ...base,
      { value: fmt(s.goals), label: "Goals" },
      { value: fmt(s.assists), label: "Assists", highlight: true },
      { value: fmt(s.keyPasses), label: "Key Passes", highlight: true },
      { value: fmt(s.passAccuracy, "%"), label: "Pass Acc." },
    ];
  }
  // Forward
  return [
    ...base,
    { value: fmt(s.goals), label: "Goals", highlight: true },
    { value: fmt(s.assists), label: "Assists" },
    { value: fmt(s.xG), label: "xG", highlight: true },
    {
      value: s.goals != null && s.shots ? `${Math.round((s.goals / s.shots) * 100)}%` : "—",
      label: "Conv.",
    },
  ];
}
