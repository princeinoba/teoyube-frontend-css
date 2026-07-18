import { NextResponse } from "next/server";
import { createPhase11PersonalizationPreview } from "@/lib/phase11Productization";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input = typeof body.input === "string" ? body.input : undefined;
  return NextResponse.json(createPhase11PersonalizationPreview(input, body.enabled === true));
}
