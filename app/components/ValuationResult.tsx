"use client";

import { PlayerData, ValuationResponse } from "@/app/lib/types";
import PlayerCard from "./PlayerCard";
import PlayerRadarChart from "./PlayerRadarChart";
import ValuationFactorsChart from "./ValuationFactorsChart";
import { TrendingUp, TrendingDown, Minus, Users, MessageSquare, Target } from "lucide-react";

interface Props {
  player: PlayerData;
  valuation: ValuationResponse;
}

function formatMillion(val: number): string {
  if (val >= 1000) return `€${(val / 1000).toFixed(2)}B`;
  if (val >= 100) return `€${Math.round(val)}M`;
  return `€${val.toFixed(1)}M`;
}

function confidenceColor(score: number) {
  if (score >= 70) return "text-emerald-500";
  if (score >= 45) return "text-yellow-500";
  return "text-red-400";
}

function confidenceLabel(score: number) {
  if (score >= 80) return "High Confidence";
  if (score >= 60) return "Moderate-High";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Low Confidence";
  return "Very Low";
}

export default function ValuationResult({ player, valuation }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Player Card ─────────────────────────────────────────── */}
      <PlayerCard player={player} />

      {/* ── Valuation Hero ──────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden">
        {/* Background accent glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />

        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted font-medium uppercase tracking-wider mb-1">
                Estimated Market Value
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl md:text-6xl font-black text-accent">
                  {formatMillion(valuation.valuationMid)}
                </span>
              </div>
              <p className="text-muted mt-2 text-sm">
                Range:{" "}
                <span className="text-primary font-medium">
                  {formatMillion(valuation.valuationMin)} –{" "}
                  {formatMillion(valuation.valuationMax)}
                </span>
              </p>
            </div>

            {/* Confidence meter */}
            <div className="md:text-right">
              <p className="text-sm text-muted mb-1">AI Confidence</p>
              <div className="flex md:justify-end items-center gap-2 mb-1">
                <span
                  className={`text-3xl font-bold ${confidenceColor(valuation.confidenceScore)}`}
                >
                  {valuation.confidenceScore}
                </span>
                <span className="text-muted text-lg">/100</span>
              </div>
              <p className={`text-sm font-medium ${confidenceColor(valuation.confidenceScore)}`}>
                {confidenceLabel(valuation.confidenceScore)}
              </p>
              <p className="text-xs text-muted mt-1 max-w-xs">
                {valuation.confidenceReason}
              </p>
            </div>
          </div>

          {/* Range bar */}
          <div className="mt-6">
            <div className="relative h-4 bg-surface-alt rounded-full border border-border overflow-visible">
              {/* Fill */}
              <div
                className="absolute h-full bg-gradient-to-r from-accent/40 via-accent to-accent/40 rounded-full"
                style={{
                  left: `${(valuation.valuationMin / (valuation.valuationMax * 1.1)) * 100}%`,
                  right: `${100 - (valuation.valuationMax / (valuation.valuationMax * 1.1)) * 100}%`,
                }}
              />
              {/* Mid marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full border-2 border-surface shadow-lg shadow-accent/30"
                style={{
                  left: `calc(${(valuation.valuationMid / (valuation.valuationMax * 1.1)) * 100}% - 8px)`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-muted">{formatMillion(valuation.valuationMin)}</span>
              <span className="text-xs text-accent font-medium">
                {formatMillion(valuation.valuationMid)} (central)
              </span>
              <span className="text-xs text-muted">{formatMillion(valuation.valuationMax)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlayerRadarChart data={valuation.radarData} playerName={player.name} />
        <ValuationFactorsChart factors={valuation.factors} />
      </div>

      {/* ── Strengths & Weaknesses ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-emerald-500" />
            <h3 className="font-semibold text-primary">Strengths</h3>
          </div>
          <ul className="space-y-2.5">
            {valuation.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                <span className="text-secondary">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} className="text-red-400" />
            <h3 className="font-semibold text-primary">Areas of Concern</h3>
          </div>
          <ul className="space-y-2.5">
            {valuation.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="text-red-400 mt-0.5 shrink-0">—</span>
                <span className="text-secondary">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Similar Transfers ────────────────────────────────────── */}
      {valuation.similarPlayers && valuation.similarPlayers.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-accent" />
            <h3 className="font-semibold text-primary">Comparable Transfers</h3>
          </div>
          <div className="space-y-3">
            {valuation.similarPlayers.map((sp, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-surface-alt border border-border/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Minus size={12} className="text-accent" />
                    <span className="font-medium text-primary">{sp.name}</span>
                    <span className="text-xs text-muted">· {sp.club}</span>
                  </div>
                  <p className="text-xs text-muted mt-1 ml-4 leading-relaxed">{sp.reason}</p>
                </div>
                <div className="sm:text-right shrink-0 ml-4">
                  <div className="text-accent font-bold">{sp.transferFee}</div>
                  <div className="text-xs text-muted">{sp.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Verdict ─────────────────────────────────────────────── */}
      <div className="bg-surface border border-accent/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent to-accent/30 rounded-l-2xl" />
        <div className="flex items-center gap-2 mb-4 pl-3">
          <MessageSquare size={18} className="text-accent" />
          <h3 className="font-semibold text-primary">The Verdict</h3>
          <Target size={14} className="text-muted ml-auto" />
          <span className="text-xs text-muted">AI Analysis</span>
        </div>
        <p className="text-secondary leading-relaxed pl-3 whitespace-pre-line">
          {valuation.verdict}
        </p>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted/60 text-center pb-4">
        This valuation is AI-generated based on available statistics and market comparisons.
        It does not constitute financial or transfer advice.
        Data sourced from API-Football · Analysis by Claude AI
      </p>
    </div>
  );
}
