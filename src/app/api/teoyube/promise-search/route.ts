import { NextResponse } from "next/server";
import { runPhase11TigSurface } from "@/lib/phase11Productization";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input = typeof body.input === "string" ? body.input : "I feel stuck and need purpose.";
  return NextResponse.json(runPhase11TigSurface("promise_search", input, { category: body.category }));
}
