import { NextRequest, NextResponse } from "next/server";
import { valuatePlayer } from "@/app/lib/claude";
import { ValuationRequest } from "@/app/lib/types";

export async function POST(request: NextRequest) {
  let body: ValuationRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.player) {
    return NextResponse.json({ error: "player data is required" }, { status: 400 });
  }

  // Attach optional salary/contract to the player object
  const player = {
    ...body.player,
    salary: body.salary ?? body.player.salary,
    contractYearsRemaining:
      body.contractYearsRemaining ?? body.player.contractYearsRemaining,
  };

  try {
    const valuation = await valuatePlayer(player);
    return NextResponse.json({ valuation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Valuation failed";
    console.error("[/api/valuation]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
