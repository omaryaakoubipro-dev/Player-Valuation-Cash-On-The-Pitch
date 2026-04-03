"use client";

import Image from "next/image";

export interface League {
  id: number;
  name: string;
  country: string;
  flag: string; // emoji flag
  logo: string; // API-Football CDN URL
}

// Hardcoded to avoid extra API calls — logos served by API-Football CDN
export const LEAGUES: League[] = [
  { id: 39,  name: "Premier League",   country: "England",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://media.api-sports.io/football/leagues/39.png"  },
  { id: 140, name: "La Liga",          country: "Spain",       flag: "🇪🇸", logo: "https://media.api-sports.io/football/leagues/140.png" },
  { id: 78,  name: "Bundesliga",       country: "Germany",     flag: "🇩🇪", logo: "https://media.api-sports.io/football/leagues/78.png"  },
  { id: 135, name: "Serie A",          country: "Italy",       flag: "🇮🇹", logo: "https://media.api-sports.io/football/leagues/135.png" },
  { id: 61,  name: "Ligue 1",          country: "France",      flag: "🇫🇷", logo: "https://media.api-sports.io/football/leagues/61.png"  },
  { id: 94,  name: "Primeira Liga",    country: "Portugal",    flag: "🇵🇹", logo: "https://media.api-sports.io/football/leagues/94.png"  },
  { id: 88,  name: "Eredivisie",       country: "Netherlands", flag: "🇳🇱", logo: "https://media.api-sports.io/football/leagues/88.png"  },
  { id: 203, name: "Super Lig",        country: "Turkey",      flag: "🇹🇷", logo: "https://media.api-sports.io/football/leagues/203.png" },
  { id: 144, name: "Pro League",       country: "Belgium",     flag: "🇧🇪", logo: "https://media.api-sports.io/football/leagues/144.png" },
  { id: 179, name: "Scottish Prem.",   country: "Scotland",    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", logo: "https://media.api-sports.io/football/leagues/179.png" },
  { id: 2,   name: "Champions League", country: "UEFA",        flag: "🇪🇺", logo: "https://media.api-sports.io/football/leagues/2.png"   },
  { id: 3,   name: "Europa League",    country: "UEFA",        flag: "🇪🇺", logo: "https://media.api-sports.io/football/leagues/3.png"   },
];

interface Props {
  selected: League | null;
  onSelect: (league: League) => void;
}

export default function LeagueSelector({ selected, onSelect }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">
          1. Choose a league
        </span>
        <span className="text-xs text-red-400 font-medium">required</span>
        {selected && (
          <span className="ml-auto text-xs text-accent flex items-center gap-1.5">
            <span>{selected.flag}</span>
            <span className="font-medium">{selected.name}</span>
            <span className="text-emerald-500">✓</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {LEAGUES.map((league) => {
          const isSelected = selected?.id === league.id;
          return (
            <button
              key={league.id}
              onClick={() => onSelect(league)}
              title={`${league.name} (${league.country})`}
              className={`
                relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-150
                ${isSelected
                  ? "bg-accent/15 border-accent shadow-sm shadow-accent/20 scale-105"
                  : "bg-surface border-border hover:border-accent/40 hover:bg-hover"
                }
              `}
            >
              {/* League logo */}
              <div className="relative w-8 h-8 shrink-0">
                <Image
                  src={league.logo}
                  alt={league.name}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* Name — truncated */}
              <span
                className={`text-[10px] leading-tight text-center font-medium w-full truncate ${
                  isSelected ? "text-accent" : "text-muted"
                }`}
              >
                {league.name}
              </span>

              {/* Selected indicator dot */}
              {isSelected && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {!selected && (
        <p className="text-xs text-muted/60 text-center mt-2">
          Select a league above to enable player search
        </p>
      )}
    </div>
  );
}
