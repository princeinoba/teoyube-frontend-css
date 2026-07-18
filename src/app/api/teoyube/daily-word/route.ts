import { NextResponse } from "next/server";
import { createPhase11DailyWordContext } from "@/lib/phase11Productization";

export async function GET(req: Request) {
  const url = new URL(req.url);
  return NextResponse.json(createPhase11DailyWordContext(url.searchParams.get("seed") || undefined));
}
