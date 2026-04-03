"use client";

import Image from "next/image";
import { PlayerData } from "@/app/lib/types";
import { MapPin, Calendar, Ruler, Weight } from "lucide-react";

interface Props {
  player: PlayerData;
}

const POSITION_BADGE: Record<string, { label: string; color: string }> = {
  Forward: { label: "FW", color: "bg-red-500" },
  Midfielder: { label: "MF", color: "bg-blue-500" },
  Defender: { label: "DF", color: "bg-green-500" },
  Goalkeeper: { label: "GK", color: "bg-yellow-500" },
};

export default function PlayerCard({ player }: Props) {
  const badge = POSITION_BADGE[player.position] ?? { label: "??", color: "bg-gray-500" };
  const s = player.stats;

  // Build relevant quick-stats based on position
  const quickStats = getQuickStats(player);

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Header banner */}
      <div className="h-2 bg-gradient-to-r from-accent via-accent/60 to-transparent" />

      <div className="p-6">
        <div className="flex gap-5">
          {/* Photo */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-border bg-surface-alt">
              {player.photo ? (
                <Image
                  src={player.photo}
                  alt={player.name}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  👤
                </div>
              )}
            </div>
            {/* Position badge */}
            <span
              className={`absolute -bottom-2 -right-2 ${badge.color} text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg`}
            >
              {badge.label}
            </span>
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-primary truncate">
              {player.name}
            </h2>

            {/* Club + League */}
            <div className="flex items-center gap-2 mt-1.5">
              {player.clubLogo && (
                <Image
                  src={player.clubLogo}
                  alt={player.club}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              )}
              <span className="font-medium text-primary">{player.club}</span>
              <span className="text-muted">·</span>
              {player.leagueLogo && (
                <Image
                  src={player.leagueLogo}
                  alt={player.league}
                  width={16}
                  height={16}
                  className="object-contain"
                />
              )}
              <span className="text-muted text-sm">{player.league}</span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              <MetaItem icon={<Calendar size={14} />} label={`${player.age} years old`} />
              <MetaItem icon={<MapPin size={14} />} label={player.nationality} />
              {player.height && (
                <MetaItem icon={<Ruler size={14} />} label={player.height} />
              )}
              {player.weight && (
                <MetaItem icon={<Weight size={14} />} label={player.weight} />
              )}
            </div>
          </div>
        </div>

        {/* Season label */}
        <div className="mt-4 mb-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted font-medium uppercase tracking-wider">
            {player.season}/{player.season + 1} Season
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickStats.map((stat) => (
            <StatBox key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StatBox({
  value,
  label,
  highlight,
}: {
  value: string | number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 text-center border ${
        highlight
          ? "bg-accent/10 border-accent/30"
          : "bg-surface-alt border-border"
      }`}
    >
      <div
        className={`text-xl font-bold ${highlight ? "text-accent" : "text-primary"}`}
      >
        {value}
      </div>
      <div className="text-xs text-muted mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

function getQuickStats(player: PlayerData) {
  const s = player.stats;

  const base = [
    { value: s.appearances, label: "Apps" },
    { value: s.minutesPlayed.toLocaleString(), label: "Minutes" },
  ];

  if (player.position === "Goalkeeper") {
    return [
      ...base,
      { value: s.goalsConceded ?? "N/A", label: "Goals Conceded" },
      { value: s.saves ?? "N/A", label: "Saves", highlight: true },
      { value: s.penaltiesSaved ?? "N/A", label: "Pen. Saved" },
      { value: `${s.passAccuracy}%`, label: "Pass Acc." },
    ];
  }

  if (player.position === "Defender") {
    return [
      ...base,
      { value: s.tackles, label: "Tackles", highlight: true },
      { value: s.interceptions, label: "Interceptions", highlight: true },
      { value: s.blocks, label: "Blocks" },
      { value: `${s.passAccuracy}%`, label: "Pass Acc." },
    ];
  }

  if (player.position === "Midfielder") {
    return [
      ...base,
      { value: s.goals, label: "Goals" },
      { value: s.assists, label: "Assists", highlight: true },
      { value: s.keyPasses, label: "Key Passes", highlight: true },
      { value: `${s.passAccuracy}%`, label: "Pass Acc." },
    ];
  }

  // Forward
  return [
    ...base,
    { value: s.goals, label: "Goals", highlight: true },
    { value: s.assists, label: "Assists" },
    { value: s.shotsOnTarget, label: "SoT", highlight: true },
    {
      value:
        s.shots > 0 ? `${Math.round((s.goals / s.shots) * 100)}%` : "N/A",
      label: "Conv. Rate",
    },
  ];
}
