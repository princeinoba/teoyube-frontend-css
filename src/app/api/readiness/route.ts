import { NextResponse } from "next/server";
import { createReadinessPayload } from "@/config/readiness";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(createReadinessPayload(), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
