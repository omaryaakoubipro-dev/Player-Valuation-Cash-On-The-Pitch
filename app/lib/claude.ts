/**
 * Anthropic Claude client for football player valuation.
 * Uses claude-sonnet-4-20250514 with the built-in web_search tool to fetch
 * live player stats from FBref, Transfermarkt, WhoScored, etc., then
 * produces a detailed market value analysis.
 */

import Anthropic from "@anthropic-ai/sdk";
import { ValuationRequest, ValuationResponse, Position } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Position-Specific Metric Guidelines ─────────────────────────────────────
const POSITION_METRICS: Record<Position, string> = {
  Forward: `
Key metrics for forwards (search these specifically):
- Goals, xG (expected goals), shots on target %
- Dribbles completed, conversion rate (goals/shots)
- Assists & key passes, movement off the ball`,

  Midfielder: `
Key metrics for midfielders (search these specifically):
- Key passes, progressive passes, progressive carries
- Assists, pass accuracy, chances created
- Interceptions & tackles (for box-to-box/defensive mids)
- Distance covered / pressing stats`,

  Defender: `
Key metrics for defenders (search these specifically):
- Tackles won, interceptions, blocks
- Aerial duels won %
- Pass accuracy, long pass accuracy
- Clean sheets (team stat, weighted)
- Defensive errors
NOTE: A defender who scores 2 goals is NOT a bad player — goals are not the primary metric.`,

  Goalkeeper: `
Key metrics for goalkeepers (search these specifically):
- Saves & save percentage
- Clean sheets
- Goals prevented vs xG faced (PSxG)
- Penalty saves
- Distribution accuracy / progressive passing`,
};

// ─── Build the full prompt ────────────────────────────────────────────────────
function buildPrompt(req: ValuationRequest): string {
  return `You are an elite football player valuation analyst. Your task is to research and value ${req.playerName}.

CONTRACT & SALARY (provided by user):
- Monthly salary: €${req.salary.toLocaleString()} (≈ €${(req.salary * 12).toLocaleString()}/year)
- Contract years remaining: ${req.contractYearsRemaining}

RESEARCH INSTRUCTIONS:
1. Search the web for "${req.playerName} stats 2024-25 season" to find their current stats from FBref, WhoScored, or SofaScore.
2. Search for "${req.playerName} Transfermarkt" to find their current club, age, nationality, market value, and contract details.
3. Search for "${req.playerName} position" to confirm their position if needed.

POSITION-SPECIFIC METRICS TO LOOK FOR:
(You will determine the position from your searches, then apply the right metrics)
- Forward: goals, xG, shots on target, dribbles, conversion rate
- Midfielder: key passes, progressive passes, assists, interceptions, pass accuracy
- Defender: tackles, interceptions, aerial duels, blocks, pass accuracy
- Goalkeeper: saves, save %, clean sheets, xGA vs goals conceded, distribution

VALUATION TASK:
After researching, produce a comprehensive market value estimate. Return a single valid JSON object — no markdown, no code fences, just raw JSON.

{
  "playerInfo": {
    "name": "<full name>",
    "age": <number>,
    "nationality": "<country>",
    "position": "<Forward|Midfielder|Defender|Goalkeeper>",
    "club": "<current club>",
    "league": "<league name>",
    "season": "<e.g. 2024/25>",
    "height": "<e.g. 180 cm or null>",
    "stats": {
      "appearances": <number or null>,
      "minutesPlayed": <number or null>,
      "goals": <number or null>,
      "assists": <number or null>,
      "shots": <number or null>,
      "shotsOnTarget": <number or null>,
      "xG": <number or null>,
      "xA": <number or null>,
      "keyPasses": <number or null>,
      "passAccuracy": <number 0-100 or null>,
      "progressivePasses": <number or null>,
      "progressiveCarries": <number or null>,
      "dribbles": <number or null>,
      "dribblesSucceeded": <number or null>,
      "tackles": <number or null>,
      "interceptions": <number or null>,
      "blocks": <number or null>,
      "aerialDuelsWon": <number or null>,
      "aerialDuelsTotal": <number or null>,
      "cleanSheets": <number or null>,
      "saves": <number or null>,
      "savePercentage": <number or null>,
      "goalsConceded": <number or null>,
      "penaltiesSaved": <number or null>
    }
  },
  "valuationMin": <number in millions EUR>,
  "valuationMax": <number in millions EUR>,
  "valuationMid": <central estimate in millions EUR>,
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
      "club": "<club at time of transfer>",
      "transferFee": "<e.g. €72M>",
      "year": <year>,
      "reason": "<why comparable>"
    }
  ],
  "verdict": "<2-3 paragraph plain-language valuation explanation citing actual stats>",
  "confidenceScore": <0-100>,
  "confidenceReason": "<why more or less confident>",
  "radarData": [
    {
      "metric": "<metric name>",
      "playerValue": <0-100 normalised>,
      "leagueAvg": <0-100 normalised>
    }
  ],
  "sourcesConsulted": ["<e.g. FBref>", "<Transfermarkt>", "..."]
}

REQUIREMENTS:
1. factors: Exactly 6 — "Age Curve", "Performance Level", "Contract Situation", "League Level", "Profile Rarity", "Marketability". Weights must sum to 100.
2. radarData: Exactly 6 position-relevant metrics, normalised 0-100 (100 = world class, 50 = league average).
3. similarPlayers: 3 real comparable transfers from the last 5 years.
4. Contract situation: ${req.contractYearsRemaining} years remaining and €${(req.salary * 12).toLocaleString()}/yr salary are already known — factor them directly.
5. Use position-specific logic — do NOT penalise defenders for low goal counts.
6. The verdict must cite actual stats you found.`;
}

// ─── Main Valuation Function ──────────────────────────────────────────────────
export async function valuatePlayer(
  req: ValuationRequest
): Promise<ValuationResponse> {
  const prompt = buildPrompt(req);

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: prompt },
  ];

  // Agentic loop — Claude may call web_search multiple times before answering.
  // For web_search_20250305 (server-side tool), Anthropic executes the searches
  // and returns the results as web_search_tool_result blocks in the same response.
  // We keep looping until stop_reason === "end_turn".
  const MAX_ITERATIONS = 12;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages,
    });

    // Add the full assistant response (including any tool_use + tool_result blocks)
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      // Extract the final text block
      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("Claude returned no text in final response");
      }

      const raw = textBlock.text
        .trim()
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "");

      let parsed: ValuationResponse;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Claude returned non-JSON response");
        parsed = JSON.parse(match[0]);
      }

      parsed.currency = "EUR";
      return parsed;
    }

    // stop_reason === "tool_use": Claude called web_search.
    // Results are already in response.content as web_search_tool_result blocks.
    // Just loop — the next request includes the full conversation with results.
  }

  throw new Error("Valuation loop exceeded maximum iterations");
}
