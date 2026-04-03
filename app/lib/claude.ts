/**
 * Anthropic Claude client for football player valuation.
 * Uses claude-sonnet-4-20250514 with position-aware analysis prompts.
 */

import Anthropic from "@anthropic-ai/sdk";
import { PlayerData, Position, RadarDataPoint, ValuationResponse } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Position-Specific Metrics Descriptions ───────────────────────────────────
const POSITION_METRICS: Record<Position, string> = {
  Forward: `
Key metrics for forwards:
- Goals & xG (expected goals): Direct output and efficiency
- Shots on target %: Clinical finishing
- Dribbles completed: 1v1 ability
- Conversion rate (goals/shots): Finishing quality
- Assists & key passes: Attacking creativity
- Movement off the ball: Positional intelligence (inferred from minutes/appearances)`,

  Midfielder: `
Key metrics for midfielders:
- Key passes & chances created: Creativity and vision
- Pass accuracy: Technical quality
- Progressive passes & carries: Ball progression
- Assists: Direct goal contributions
- Interceptions & tackles: Defensive work rate
- Dribbles: Ability to break lines
- Appearances/minutes: Fitness and importance to the team`,

  Defender: `
Key metrics for defenders:
- Tackles won & interceptions: Defensive actions
- Aerial duels won %: Aerial ability
- Blocks: Shot-stopping ability
- Pass accuracy & long pass accuracy: Building from the back
- Clean sheets (team stat, weighted): Defensive solidity
- Defensive errors: Reliability
Note: A defender who scores 2 goals is not necessarily a good or bad player — goals are NOT the primary metric.`,

  Goalkeeper: `
Key metrics for goalkeepers:
- Saves & save percentage: Shot-stopping
- Clean sheets: Defensive solidity
- Goals prevented vs xG faced (if available): Performance above expected
- Penalty saves: High-pressure moments
- Distribution accuracy: Modern goalkeeper requirement
- Goals conceded: Raw output`,
};

// ─── League Prestige Mapping ──────────────────────────────────────────────────
// Used to contextualize the player's league in the valuation
const LEAGUE_PRESTIGE: Record<string, string> = {
  "Premier League": "tier-1 (highest prestige, global reach)",
  "La Liga": "tier-1 (elite, global reach)",
  "Bundesliga": "tier-1 (elite)",
  "Serie A": "tier-1 (elite)",
  "Ligue 1": "tier-1 (top European)",
  "Eredivisie": "tier-2 (strong European)",
  "Primeira Liga": "tier-2 (strong European)",
  "Super Lig": "tier-2",
  "Championship": "tier-2 (English second division)",
  "Bundesliga 2": "tier-2 (German second division)",
};

function getLeaguePrestige(league: string): string {
  for (const [key, value] of Object.entries(LEAGUE_PRESTIGE)) {
    if (league.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return "tier-3 or lower (limited global exposure)";
}

// ─── Build Claude Prompt ──────────────────────────────────────────────────────
function buildValuationPrompt(player: PlayerData): string {
  const s = player.stats;
  const leaguePrestige = getLeaguePrestige(player.league);

  // Build position-specific stats block
  const statsBlock = buildStatsBlock(player);

  const contractInfo =
    player.contractYearsRemaining !== undefined && player.salary !== undefined
      ? `
CONTRACT INFORMATION (provided by user — improves precision):
- Monthly salary: €${player.salary.toLocaleString()}
- Contract years remaining: ${player.contractYearsRemaining} year(s)
- Annual salary cost: ~€${(player.salary * 12).toLocaleString()}`
      : player.contractYearsRemaining !== undefined
      ? `- Contract years remaining: ${player.contractYearsRemaining} year(s)`
      : player.salary !== undefined
      ? `- Monthly salary: €${player.salary.toLocaleString()} / Annual: ~€${(player.salary * 12).toLocaleString()}`
      : "Not provided — factor in uncertainty around contract situation";

  return `You are an elite football player valuation analyst combining Transfermarkt methodology with advanced statistics and market intelligence.

PLAYER PROFILE:
- Name: ${player.name}
- Age: ${player.age}
- Nationality: ${player.nationality}
- Position: ${player.position}
- Club: ${player.club}
- League: ${player.league} (${leaguePrestige})
- Season: ${player.season}/${player.season + 1}
${player.height ? `- Height: ${player.height}` : ""}${player.weight ? ` | Weight: ${player.weight}` : ""}

${statsBlock}

CONTRACT & SALARY:
${contractInfo}

POSITION-SPECIFIC ANALYSIS GUIDELINES:
${POSITION_METRICS[player.position]}

TASK: Produce a comprehensive market value estimate with the following structure. Respond in valid JSON only — no markdown, no code blocks, just the raw JSON object.

{
  "valuationMin": <number in millions EUR>,
  "valuationMax": <number in millions EUR>,
  "valuationMid": <number in millions EUR>,
  "currency": "EUR",
  "factors": [
    {
      "name": "<factor name>",
      "score": <0-100>,
      "weight": <0-100>,
      "description": "<1-2 sentence explanation>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>", "..."],
  "weaknesses": ["<weakness 1>", "..."],
  "similarPlayers": [
    {
      "name": "<player name>",
      "club": "<club>",
      "transferFee": "<e.g. €72M>",
      "year": <year>,
      "reason": "<why this is a comparable>"
    }
  ],
  "verdict": "<2-3 paragraph plain-language explanation of the valuation>",
  "confidenceScore": <0-100>,
  "confidenceReason": "<why you are more or less confident>",
  "radarData": [
    {
      "metric": "<metric name>",
      "playerValue": <0-100 normalized>,
      "leagueAvg": <0-100 normalized>
    }
  ]
}

REQUIREMENTS:
1. factors: Include exactly 6 factors — "Age Curve", "Performance Level", "Contract Situation", "League Level", "Profile Rarity", "Marketability". Weights must sum to 100.
2. radarData: Include exactly 6 metrics relevant to ${player.position}. Normalize both playerValue and leagueAvg to 0-100 scale where 100 = world class, 50 = league average.
3. similarPlayers: Include 3 real comparable transfers from the last 5 years.
4. valuationMin and valuationMax should reflect realistic market uncertainty (typically ±15-25% of mid).
5. Use position-specific logic — do NOT penalize defenders for low goal counts.
6. If contract/salary data is missing, note the uncertainty in the verdict and widen the range slightly.
7. Ensure the verdict is engaging, specific, and cites actual stats.`;
}

function buildStatsBlock(player: PlayerData): string {
  const s = player.stats;
  const lines: string[] = [
    `SEASON STATISTICS (${player.season}/${player.season + 1}):`,
    `- Appearances: ${s.appearances} | Minutes: ${s.minutesPlayed}`,
  ];

  if (player.position === "Goalkeeper") {
    lines.push(
      `- Goals conceded: ${s.goalsConceded ?? "N/A"}`,
      `- Saves: ${s.saves ?? "N/A"}`,
      `- Penalties saved: ${s.penaltiesSaved ?? "N/A"}`,
      `- Pass accuracy: ${s.passAccuracy}%`
    );
  } else if (player.position === "Defender") {
    lines.push(
      `- Tackles: ${s.tackles} | Interceptions: ${s.interceptions} | Blocks: ${s.blocks}`,
      `- Aerial duels won: ${s.aerialDuelsWon ?? "N/A"} / ${s.aerialDuelsTotal ?? "N/A"}`,
      `- Pass accuracy: ${s.passAccuracy}% | Total passes: ${s.passesTotal}`,
      `- Goals: ${s.goals} | Assists: ${s.assists}` // still show but contextualized
    );
  } else if (player.position === "Midfielder") {
    lines.push(
      `- Goals: ${s.goals} | Assists: ${s.assists}`,
      `- Key passes: ${s.keyPasses} | Pass accuracy: ${s.passAccuracy}% | Total passes: ${s.passesTotal}`,
      `- Dribbles attempted: ${s.dribbles} | Succeeded: ${s.dribblesSucceeded}`,
      `- Tackles: ${s.tackles} | Interceptions: ${s.interceptions}`
    );
  } else {
    // Forward
    lines.push(
      `- Goals: ${s.goals} | Assists: ${s.assists}`,
      `- Shots: ${s.shots} | On target: ${s.shotsOnTarget}`,
      `- Dribbles attempted: ${s.dribbles} | Succeeded: ${s.dribblesSucceeded}`,
      `- Key passes: ${s.keyPasses} | Pass accuracy: ${s.passAccuracy}%`
    );
  }

  return lines.join("\n");
}

// ─── Main Valuation Function ──────────────────────────────────────────────────
export async function valuatePlayer(player: PlayerData): Promise<ValuationResponse> {
  const prompt = buildValuationPrompt(player);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Strip any accidental markdown code blocks
  const raw = content.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

  let parsed: ValuationResponse;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Claude returned non-JSON response");
    parsed = JSON.parse(jsonMatch[0]);
  }

  // Ensure currency field
  parsed.currency = "EUR";
  return parsed;
}
