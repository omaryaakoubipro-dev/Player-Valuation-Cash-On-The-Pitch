"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { PlayerSearchResult } from "@/app/lib/types";
import Image from "next/image";

interface Props {
  leagueId: number | null;
  onSelect: (player: PlayerSearchResult) => void;
  disabled?: boolean;
  contractReady?: boolean;
}

export default function SearchBar({ leagueId, onSelect, disabled, contractReady }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset when league changes
  useEffect(() => {
    setQuery("");
    setResults([]);
    setOpen(false);
    setError(null);
  }, [leagueId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback(
    async (q: string) => {
      if (!leagueId) return;
      if (q.trim().length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q.trim())}&league=${leagueId}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        setResults(data.players ?? []);
        setOpen(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    },
    [leagueId]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 500);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      search(query);
    }
  }

  function handleSearchClick() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    search(query);
  }

  function handleSelect(player: PlayerSearchResult) {
    setQuery(player.name);
    setOpen(false);
    setResults([]);
    onSelect(player);
  }

  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    setError(null);
  }

  const isDisabled = disabled || !leagueId || contractReady === false;

  const POSITION_COLORS: Record<string, string> = {
    Forward:    "bg-red-500/20 text-red-400 border-red-500/30",
    Midfielder: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Defender:   "bg-green-500/20 text-green-400 border-green-500/30",
    Goalkeeper: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">
          2. Search a player
        </span>
        <span className="text-xs text-red-400 font-medium">required</span>
      </div>

      <div ref={containerRef} className="relative">
        {/* Input + button row */}
        <div className="flex gap-2">
          <div
            className={`flex flex-1 items-center gap-3 px-4 py-3.5 rounded-xl border bg-surface transition-all duration-200 ${
              isDisabled
                ? "opacity-50 cursor-not-allowed border-border"
                : open
                ? "border-accent shadow-lg shadow-accent/10"
                : "border-border hover:border-accent/50"
            }`}
          >
            {loading ? (
              <Loader2 size={20} className="text-accent animate-spin shrink-0" />
            ) : (
              <Search size={20} className="text-muted shrink-0" />
            )}
            <input
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder={
                !leagueId
                  ? "← Select a league first"
                  : contractReady === false
                  ? "← Fill in salary & contract first"
                  : "Type a player name... (e.g. Pedri, Haaland, Salah)"
              }
              disabled={isDisabled}
              className="flex-1 bg-transparent text-primary placeholder:text-muted outline-none text-base disabled:cursor-not-allowed"
              autoComplete="off"
              spellCheck={false}
            />
            {query && !isDisabled && (
              <button onClick={clear} className="text-muted hover:text-primary transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Search button */}
          <button
            onClick={handleSearchClick}
            disabled={isDisabled || loading || query.trim().length < 2}
            className="px-5 py-3.5 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Dropdown results */}
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-2 border-b border-border">
              <p className="text-xs text-muted px-2">
                {results.length} player{results.length > 1 ? "s" : ""} found — click to select
              </p>
            </div>
            <ul className="max-h-80 overflow-y-auto divide-y divide-border/50">
              {results.map((player) => (
                <li key={player.id}>
                  <button
                    onClick={() => handleSelect(player)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-hover transition-colors text-left group"
                  >
                    {/* Photo */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border shrink-0 bg-surface-alt">
                      {player.photo ? (
                        <Image
                          src={player.photo}
                          alt={player.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          👤
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-primary group-hover:text-accent transition-colors truncate">
                          {player.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            POSITION_COLORS[player.position] ??
                            "bg-surface-alt text-muted border-border"
                          }`}
                        >
                          {player.position}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {player.clubLogo && (
                          <Image
                            src={player.clubLogo}
                            alt={player.club}
                            width={14}
                            height={14}
                            className="object-contain"
                          />
                        )}
                        <span className="text-sm text-muted truncate">
                          {player.club} · {player.league}
                        </span>
                      </div>
                    </div>

                    {/* Age + Nationality */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-primary">{player.age} yrs</div>
                      <div className="text-xs text-muted">{player.nationality}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No results */}
        {open && !loading && results.length === 0 && !error && query.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl z-50 p-6 text-center">
            <p className="text-muted">No players found for &quot;{query}&quot;</p>
            <p className="text-xs text-muted/60 mt-1">Try a different name or spelling</p>
          </div>
        )}

        {/* API error */}
        {open && error && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-red-500/30 rounded-xl shadow-2xl z-50 p-4 text-center">
            <p className="text-red-400 text-sm font-medium">Search error</p>
            <p className="text-xs text-muted mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
