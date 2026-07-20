import { NextResponse } from "next/server";
import { runTeoyubeSearch } from "../../../../lib/phase112Productization";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const input = typeof body.input === "string" ? body.input.slice(0, 2_000) : "I feel confused about my purpose";
  return NextResponse.json(runTeoyubeSearch(input), { headers: { "cache-control": "no-store" } });
}
