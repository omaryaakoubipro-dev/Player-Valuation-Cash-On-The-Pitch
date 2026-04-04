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

  if (!body.playerName?.trim()) {
    return NextResponse.json({ error: "playerName is required" }, { status: 400 });
  }
  if (typeof body.salary !== "number" || body.salary <= 0) {
    return NextResponse.json({ error: "salary must be a positive number" }, { status: 400 });
  }
  if (typeof body.contractYearsRemaining !== "number" || body.contractYearsRemaining < 0) {
    return NextResponse.json(
      { error: "contractYearsRemaining must be a non-negative number" },
      { status: 400 }
    );
  }

  try {
    const valuation = await valuatePlayer(body);
    return NextResponse.json({ valuation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Valuation failed";
    console.error("[/api/valuation]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
