// ─── Position ────────────────────────────────────────────────────────────────
export type Position = "Forward" | "Midfielder" | "Defender" | "Goalkeeper";

// ─── Player info returned by Claude after web search ─────────────────────────
export interface PlayerStats {
  appearances?: number;
  minutesPlayed?: number;
  goals?: number;
  assists?: number;
  shots?: number;
  shotsOnTarget?: number;
  xG?: number;
  xA?: number;
  dribbles?: number;
  dribblesSucceeded?: number;
  keyPasses?: number;
  passAccuracy?: number;
  progressivePasses?: number;
  progressiveCarries?: number;
  tackles?: number;
  interceptions?: number;
  blocks?: number;
  aerialDuelsWon?: number;
  aerialDuelsTotal?: number;
  cleanSheets?: number;
  saves?: number;
  savePercentage?: number;
  goalsConceded?: number;
  penaltiesSaved?: number;
}

export interface PlayerInfo {
  name: string;
  age: number;
  nationality: string;
  position: Position;
  club: string;
  league: string;
  season: string; // e.g. "2024/25"
  height?: string;
  stats: PlayerStats;
}

// ─── Valuation request ────────────────────────────────────────────────────────
export interface ValuationRequest {
  playerName: string;
  salary: number;           // monthly in EUR
  contractYearsRemaining: number;
}

// ─── Valuation response (from Claude) ────────────────────────────────────────
export interface ValuationFactor {
  name: string;
  score: number;      // 0-100
  weight: number;     // 0-100, all weights sum to 100
  description: string;
}

export interface SimilarPlayer {
  name: string;
  club: string;
  transferFee: string;
  year: number;
  reason: string;
}

export interface RadarDataPoint {
  metric: string;
  playerValue: number;  // 0-100 normalised
  leagueAvg: number;    // 0-100 normalised
}

export interface ValuationResponse {
  playerInfo: PlayerInfo;

  valuationMin: number;   // millions EUR
  valuationMax: number;
  valuationMid: number;
  currency: "EUR";

  factors: ValuationFactor[];

  strengths: string[];
  weaknesses: string[];

  similarPlayers: SimilarPlayer[];

  verdict: string;
  confidenceScore: number;    // 0-100
  confidenceReason: string;

  radarData: RadarDataPoint[];

  sourcesConsulted: string[];  // e.g. ["FBref", "Transfermarkt", "WhoScored"]
}

// ─── App loading state ────────────────────────────────────────────────────────
export type LoadingStep = "idle" | "analyzing" | "done" | "error";
