import { NextResponse } from "next/server";
import { runPhase11TigSurface } from "@/lib/phase11Productization";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input = typeof body.input === "string" ? body.input : "Help me continue a Scripture-grounded growth journey.";
  return NextResponse.json(runPhase11TigSurface("journey", input, { sessionOnlyProgress: true }));
}
