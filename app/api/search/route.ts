import { NextRequest, NextResponse } from "next/server";
import { searchPlayers } from "@/app/lib/api-football";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  try {
    const players = await searchPlayers(query.trim());
    return NextResponse.json({ players });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    console.error("[/api/search]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
