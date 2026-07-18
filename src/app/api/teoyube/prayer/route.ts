import { NextResponse } from "next/server";
import { runPhase11TigSurface } from "@/lib/phase11Productization";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input = typeof body.input === "string" ? body.input : "Help me pray through my current season.";
  return NextResponse.json(runPhase11TigSurface("prayer", input, { tone: body.tone }));
}
