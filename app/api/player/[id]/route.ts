import { NextRequest, NextResponse } from "next/server";
import { fetchPlayerData } from "@/app/lib/api-football";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const playerId = parseInt(id, 10);

  if (isNaN(playerId)) {
    return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
  }

  try {
    const player = await fetchPlayerData(playerId);
    return NextResponse.json({ player });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch player data";
    console.error("[/api/player]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
