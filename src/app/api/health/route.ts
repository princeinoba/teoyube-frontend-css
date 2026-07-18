import { NextResponse } from "next/server";
import { createHealthPayload } from "@/config/health";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(createHealthPayload(), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
