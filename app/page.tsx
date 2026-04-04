"use client";

import { useState } from "react";
import SearchBar from "./components/SearchBar";
import LoadingState from "./components/LoadingState";
import ValuationResult from "./components/ValuationResult";
import ContractInputs from "./components/ContractInputs";
import { ValuationRequest, ValuationResponse, LoadingStep } from "./lib/types";
import { AlertCircle, Sparkles, RotateCcw } from "lucide-react";

export default function Home() {
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [valuation, setValuation] = useState<ValuationResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<ValuationRequest | null>(null);
  const [salary, setSalary] = useState("");
  const [contractYears, setContractYears] = useState("");

  const contractReady =
    salary.trim() !== "" &&
    !isNaN(parseFloat(salary)) &&
    parseFloat(salary) > 0 &&
    contractYears.trim() !== "" &&
    !isNaN(parseFloat(contractYears)) &&
    parseFloat(contractYears) >= 0;

  async function handleSubmit(playerName: string) {
    if (!contractReady) return;

    const req: ValuationRequest = {
      playerName,
      salary: parseFloat(salary),
      contractYearsRemaining: parseFloat(contractYears),
    };

    setError(null);
    setValuation(null);
    setLastRequest(req);
    setLoadingStep("analyzing");

    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Valuation failed");
      setValuation(data.valuation);
      setLoadingStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Valuation failed");
      setLoadingStep("error");
    }
  }

  function handleReset() {
    setLoadingStep("idle");
    setValuation(null);
    setLastRequest(null);
    setError(null);
    setSalary("");
    setContractYears("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isLoading = loadingStep === "analyzing";
  const isDone = loadingStep === "done" && valuation && lastRequest;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        {!isDone && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles size={14} className="text-accent" />
              <span className="text-xs text-accent font-medium">
                Powered by Claude AI · Live Web Search
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-3 leading-tight">
              What is this player
              <span className="text-accent"> worth?</span>
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Claude searches FBref, Transfermarkt, and WhoScored in real time,
              then produces a detailed AI valuation with comparable transfers.
            </p>
          </div>
        )}

        {/* ── Step 1: Player name ───────────────────────────────────── */}
        <section className="mb-6">
          <SearchBar
            onSubmit={handleSubmit}
            disabled={isLoading || !contractReady}
          />
        </section>

        {/* ── Step 2: Contract & Salary ─────────────────────────────── */}
        <section className="mb-6">
          <ContractInputs
            salary={salary}
            contractYears={contractYears}
            onSalaryChange={setSalary}
            onContractYearsChange={setContractYears}
          />
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
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted">
                Valuation for{" "}
                <span className="text-primary font-medium">
                  {valuation.playerInfo.name}
                </span>
              </p>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-accent text-muted hover:text-accent transition-colors text-sm font-medium"
              >
                <RotateCcw size={14} />
                New search
              </button>
            </div>

            <ValuationResult request={lastRequest} valuation={valuation} />

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors"
              >
                <RotateCcw size={16} />
                Valuate another player
              </button>
            </div>
          </div>
        )}

        {/* ── Empty state feature cards ─────────────────────────────── */}
        {loadingStep === "idle" && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {[
              {
                icon: "🔍",
                title: "Live web search",
                desc: "Claude searches FBref, Transfermarkt & WhoScored for the latest stats — no API key needed",
              },
              {
                icon: "📊",
                title: "Position-aware analysis",
                desc: "Defenders judged on defending. Forwards on goals. Fair, position-specific metrics.",
              },
              {
                icon: "💶",
                title: "Market value with reasoning",
                desc: "Not just a number — full breakdown with comparable transfers and a plain-language verdict.",
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
