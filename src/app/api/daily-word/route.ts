import { NextResponse } from "next/server";
import { getDailyWord } from "@/lib/teoyubeData";

export async function GET() {
  return NextResponse.json(getDailyWord());
}
