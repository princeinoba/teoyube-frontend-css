import { NextResponse } from "next/server";
import { createPhase11SeedSummary } from "@/lib/phase11Productization";

export async function GET() {
  return NextResponse.json(createPhase11SeedSummary());
}
