"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface Props {
  onSubmit: (playerName: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div
          className={`flex flex-1 items-center gap-3 px-4 py-3.5 rounded-xl border bg-surface transition-all duration-200 ${
            disabled
              ? "opacity-50 cursor-not-allowed border-border"
              : "border-border hover:border-accent/50 focus-within:border-accent focus-within:shadow-lg focus-within:shadow-accent/10"
          }`}
        >
          <Search size={20} className="text-muted shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Pedri, Erling Haaland, Virgil van Dijk..."
            disabled={disabled}
            className="flex-1 bg-transparent text-primary placeholder:text-muted outline-none text-base disabled:cursor-not-allowed"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          type="submit"
          disabled={disabled || value.trim().length < 2}
          className="px-5 py-3.5 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0"
        >
          {disabled ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          <span className="hidden sm:inline">Valuate</span>
        </button>
      </form>
    </div>
  );
}
