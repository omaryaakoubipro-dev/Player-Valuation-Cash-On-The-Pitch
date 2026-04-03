import { NextRequest, NextResponse } from "next/server";
import { searchPlayers } from "@/app/lib/api-football";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const leagueParam = request.nextUrl.searchParams.get("league");

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  const leagueId = leagueParam ? parseInt(leagueParam, 10) : NaN;
  if (isNaN(leagueId)) {
    return NextResponse.json(
      { error: "A valid league ID is required" },
      { status: 400 }
    );
  }

  try {
    const players = await searchPlayers(q.trim(), leagueId);
    return NextResponse.json({ players });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    console.error("[/api/search]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
