/**
 * API-Football client (api-football.com / RapidAPI)
 * Free tier: 100 requests/day
 * Docs: https://www.api-football.com/documentation-v3
 */

import { PlayerData, PlayerSearchResult, Position, PlayerStats } from "./types";

const API_BASE = "https://v3.football.api-sports.io";
const RAPID_BASE = "https://api-football-v1.p.rapidapi.com/v3";

// Resolve which host/key pattern to use based on available env vars
function getHeaders(): HeadersInit {
  const apiSportsKey = process.env.API_FOOTBALL_KEY;
  const rapidKey = process.env.RAPIDAPI_KEY;

  if (apiSportsKey) {
    return { "x-apisports-key": apiSportsKey };
  }
  if (rapidKey) {
    return {
      "X-RapidAPI-Key": rapidKey,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    };
  }
  throw new Error(
    "No football API key configured. Set API_FOOTBALL_KEY or RAPIDAPI_KEY."
  );
}

function getBase(): string {
  return process.env.RAPIDAPI_KEY && !process.env.API_FOOTBALL_KEY
    ? RAPID_BASE
    : API_BASE;
}

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${getBase()}${path}`;
  const res = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 }, // cache 1h
  });
  if (!res.ok) {
    throw new Error(`API-Football error ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(JSON.stringify(json.errors));
  }
  return json;
}

// ─── Search Players ──────────────────────────────────────────────────────────
export async function searchPlayers(
  query: string
): Promise<PlayerSearchResult[]> {
  // Try current season first, fall back to previous if empty
  const currentYear = new Date().getFullYear();
  const seasons = [currentYear - 1, currentYear - 2]; // 2024-25 season → 2024

  for (const season of seasons) {
    const data = await apiFetch<{
      response: ApiPlayerResponse[];
    }>(`/players?search=${encodeURIComponent(query)}&season=${season}`);

    if (data.response && data.response.length > 0) {
      return data.response.slice(0, 8).map(mapToSearchResult);
    }
  }
  return [];
}

// ─── Fetch Full Player Data ──────────────────────────────────────────────────
export async function fetchPlayerData(playerId: number): Promise<PlayerData> {
  const currentYear = new Date().getFullYear();
  const seasons = [currentYear - 1, currentYear - 2];

  for (const season of seasons) {
    const data = await apiFetch<{
      response: ApiPlayerResponse[];
    }>(`/players?id=${playerId}&season=${season}`);

    if (data.response && data.response.length > 0) {
      return mapToPlayerData(data.response[0], season);
    }
  }
  throw new Error("Player data not found");
}

// ─── API Response Types ───────────────────────────────────────────────────────
interface ApiPlayerResponse {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    nationality: string;
    height: string;
    weight: string;
    photo: string;
  };
  statistics: ApiStatistics[];
}

interface ApiStatistics {
  team: { id: number; name: string; logo: string };
  league: { id: number; name: string; country: string; logo: string };
  games: {
    appearences: number;
    minutes: number;
    position: string;
    lineups?: number;
  };
  goals: { total: number | null; assists: number | null };
  shots: { total: number | null; on: number | null };
  passes: { total: number | null; accuracy: string | null; key: number | null };
  dribbles: { attempts: number | null; success: number | null };
  tackles: { total: number | null; interceptions: number | null; blocks: number | null };
  duels: { total: number | null; won: number | null };
  cards: { yellow: number; red: number };
  penalty: { saved: number | null; missed: number | null };
  goals_conceded?: number | null;
}

// ─── Map Helpers ─────────────────────────────────────────────────────────────
function mapToSearchResult(r: ApiPlayerResponse): PlayerSearchResult {
  const stat = r.statistics[0] ?? ({} as ApiStatistics);
  return {
    id: r.player.id,
    name: r.player.name,
    photo: r.player.photo,
    nationality: r.player.nationality,
    age: r.player.age,
    club: stat.team?.name ?? "Unknown",
    clubLogo: stat.team?.logo ?? "",
    league: stat.league?.name ?? "Unknown",
    leagueLogo: stat.league?.logo ?? "",
    position: normalizePosition(stat.games?.position ?? ""),
  };
}

function mapToPlayerData(r: ApiPlayerResponse, season: number): PlayerData {
  // Use first statistics entry (primary club/league)
  const stat = r.statistics[0] ?? ({} as ApiStatistics);
  const g = stat.games ?? {};
  const goals = stat.goals ?? {};
  const shots = stat.shots ?? {};
  const passes = stat.passes ?? {};
  const dribbles = stat.dribbles ?? {};
  const tackles = stat.tackles ?? {};
  const duels = stat.duels ?? {};

  const position = normalizePosition(g.position ?? "");

  const playerStats: PlayerStats = {
    appearances: g.appearences ?? 0,
    minutesPlayed: g.minutes ?? 0,
    goals: goals.total ?? 0,
    assists: goals.assists ?? 0,
    shots: shots.total ?? 0,
    shotsOnTarget: shots.on ?? 0,
    dribbles: dribbles.attempts ?? 0,
    dribblesSucceeded: dribbles.success ?? 0,
    keyPasses: passes.key ?? 0,
    passAccuracy: parseFloat(passes.accuracy ?? "0") || 0,
    passesTotal: passes.total ?? 0,
    tackles: tackles.total ?? 0,
    interceptions: tackles.interceptions ?? 0,
    blocks: tackles.blocks ?? 0,
    aerialDuelsWon: duels.won ?? 0,
    aerialDuelsTotal: duels.total ?? 0,
    // GK
    saves: stat.penalty?.saved ?? undefined,
    goalsConceded: stat.goals_conceded ?? undefined,
    penaltiesSaved: stat.penalty?.saved ?? undefined,
  };

  return {
    id: r.player.id,
    name: r.player.name,
    firstname: r.player.firstname,
    lastname: r.player.lastname,
    photo: r.player.photo,
    age: r.player.age,
    nationality: r.player.nationality,
    height: r.player.height,
    weight: r.player.weight,
    position,
    club: stat.team?.name ?? "Unknown",
    clubLogo: stat.team?.logo ?? "",
    league: stat.league?.name ?? "Unknown",
    leagueLogo: stat.league?.logo ?? "",
    leagueCountry: stat.league?.country ?? "",
    season,
    stats: playerStats,
  };
}

function normalizePosition(raw: string): Position {
  const p = raw?.toLowerCase() ?? "";
  if (p.includes("attacker") || p.includes("forward") || p === "f") return "Forward";
  if (p.includes("midfielder") || p === "m") return "Midfielder";
  if (p.includes("goalkeeper") || p === "g") return "Goalkeeper";
  if (p.includes("defender") || p === "d") return "Defender";
  return "Midfielder"; // sensible default
}
