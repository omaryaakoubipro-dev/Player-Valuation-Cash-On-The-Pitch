"use client";

import { useState, useCallback } from "react";
import LeagueSelector, { League } from "./components/LeagueSelector";
import SearchBar from "./components/SearchBar";
import LoadingState from "./components/LoadingState";
import ValuationResult from "./components/ValuationResult";
import OptionalInputs from "./components/OptionalInputs";
import { PlayerData, PlayerSearchResult, ValuationResponse, LoadingStep } from "./lib/types";
import { AlertCircle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export default function Home() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [valuation, setValuation] = useState<ValuationResponse | null>(null);
  const [salary, setSalary] = useState("");
  const [contractYears, setContractYears] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  // When the league changes, reset any previous result
  function handleLeagueSelect(league: League) {
    setSelectedLeague(league);
    setPlayer(null);
    setValuation(null);
    setError(null);
    setLoadingStep("idle");
  }

  const handlePlayerSelect = useCallback(
    async (searchResult: PlayerSearchResult) => {
      setError(null);
      setPlayer(null);
      setValuation(null);

      // Step 1: Fetch full player data
      setLoadingStep("fetching");
      let playerData: PlayerData;
      try {
        const res = await fetch(`/api/player/${searchResult.id}`);
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? "Failed to load player");
        playerData = data.player;
        setPlayer(playerData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load player data");
        setLoadingStep("error");
        return;
      }

      // Step 2: AI valuation
      setLoadingStep("analyzing");
      try {
        const body = {
          player: playerData,
          salary: salary ? parseFloat(salary) : undefined,
          contractYearsRemaining: contractYears ? parseFloat(contractYears) : undefined,
        };

        const res = await fetch("/api/valuation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? "Valuation failed");
        setValuation(data.valuation);
        setLoadingStep("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Valuation analysis failed");
        setLoadingStep("error");
      }
    },
    [salary, contractYears]
  );

  const isLoading =
    loadingStep === "fetching" ||
    loadingStep === "analyzing" ||
    loadingStep === "searching";
  const isDone = loadingStep === "done" && player && valuation;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        {!isDone && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles size={14} className="text-accent" />
              <span className="text-xs text-accent font-medium">Powered by Claude AI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-3 leading-tight">
              What is this player
              <span className="text-accent"> worth?</span>
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Pick a league, search a player, get an AI-powered market valuation
              with detailed analysis and comparable transfers.
            </p>
          </div>
        )}

        {/* ── Step 1: League selector ───────────────────────────────── */}
        <section className="mb-6">
          <LeagueSelector selected={selectedLeague} onSelect={handleLeagueSelect} />
        </section>

        {/* ── Step 2: Player search ─────────────────────────────────── */}
        <section className="mb-4">
          <SearchBar
            leagueId={selectedLeague?.id ?? null}
            onSelect={handlePlayerSelect}
            disabled={isLoading}
          />

          {/* Optional inputs toggle */}
          <div className="max-w-2xl mx-auto mt-3">
            <button
              onClick={() => setShowOptional((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mx-auto"
            >
              {showOptional ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {showOptional ? "Hide" : "Add"} salary &amp; contract data (optional, improves accuracy)
            </button>

            {showOptional && (
              <div className="mt-3">
                <OptionalInputs
                  salary={salary}
                  contractYears={contractYears}
                  onSalaryChange={setSalary}
                  onContractYearsChange={setContractYears}
                />
              </div>
            )}
          </div>
        </section>

        {/* ── Loading ──────────────────────────────────────────────── */}
        {isLoading && <LoadingState step={loadingStep} />}

        {/* ── Error ────────────────────────────────────────────────── */}
        {loadingStep === "error" && error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 mt-4">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm opacity-80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Result ───────────────────────────────────────────────── */}
        {isDone && (
          <div className="mt-6">
            <ValuationResult player={player} valuation={valuation} />
          </div>
        )}

        {/* ── Empty state feature cards ─────────────────────────────── */}
        {loadingStep === "idle" && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {[
              {
                icon: "🔍",
                title: "Search any player",
                desc: "Players from the top European leagues — 1 API request per search",
              },
              {
                icon: "📊",
                title: "Position-aware analysis",
                desc: "Defenders judged on defending. Forwards on goals. Fair metrics.",
              },
              {
                icon: "💶",
                title: "Market value with reasoning",
                desc: "Not just a number — full breakdown with comparable transfers",
              },
            ].map((item) => (
              <div key={item.title} className="bg-surface border border-border rounded-xl p-5">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-primary text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
