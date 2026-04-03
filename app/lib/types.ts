// ─── Player Search Result ───────────────────────────────────────────────────
export interface PlayerSearchResult {
  id: number;
  name: string;
  photo: string;
  nationality: string;
  age: number;
  club: string;
  clubLogo: string;
  league: string;
  leagueLogo: string;
  position: string;
}

// ─── Full Player Data (from API-Football) ───────────────────────────────────
export type Position = "Forward" | "Midfielder" | "Defender" | "Goalkeeper";

export interface PlayerStats {
  // General
  appearances: number;
  minutesPlayed: number;

  // Attacking
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  xG?: number;
  dribbles: number;
  dribblesSucceeded: number;
  keyPasses: number;

  // Passing
  passAccuracy: number;
  passesTotal: number;
  longPassAccuracy?: number;
  progressivePasses?: number;

  // Defensive
  tackles: number;
  tacklesWon?: number;
  interceptions: number;
  blocks: number;
  aerialDuelsWon?: number;
  aerialDuelsTotal?: number;
  cleanSheets?: number;
  defensiveErrors?: number;

  // Goalkeeper
  saves?: number;
  savesTotal?: number;
  goalsConceded?: number;
  penaltiesSaved?: number;
}

export interface PlayerData {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  photo: string;
  age: number;
  nationality: string;
  position: Position;
  height?: string;
  weight?: string;

  club: string;
  clubLogo: string;
  league: string;
  leagueLogo: string;
  leagueCountry: string;
  season: number;

  stats: PlayerStats;

  // Optional user inputs
  salary?: number; // monthly in EUR
  contractYearsRemaining?: number;
}

// ─── Valuation Request ──────────────────────────────────────────────────────
export interface ValuationRequest {
  player: PlayerData;
  salary?: number;
  contractYearsRemaining?: number;
}

// ─── Valuation Response (from Claude) ───────────────────────────────────────
export interface ValuationFactor {
  name: string;
  score: number; // 0-100
  weight: number; // 0-100, how much this factor contributes
  description: string;
}

export interface SimilarPlayer {
  name: string;
  club: string;
  transferFee: string;
  year: number;
  reason: string;
}

export interface ValuationResponse {
  valuationMin: number; // in millions EUR
  valuationMax: number; // in millions EUR
  valuationMid: number; // central estimate
  currency: "EUR";

  factors: ValuationFactor[];

  strengths: string[];
  weaknesses: string[];

  similarPlayers: SimilarPlayer[];

  verdict: string;
  confidenceScore: number; // 0-100
  confidenceReason: string;

  // Radar chart data: position-specific metrics normalized 0-100
  radarData: RadarDataPoint[];
}

export interface RadarDataPoint {
  metric: string;
  playerValue: number; // 0-100 normalized
  leagueAvg: number; // 0-100 normalized
}

// ─── App State ───────────────────────────────────────────────────────────────
export type LoadingStep =
  | "idle"
  | "searching"
  | "fetching"
  | "analyzing"
  | "done"
  | "error";
