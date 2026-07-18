import { NextResponse } from "next/server";
import {
  runPhase11TigSurface,
  type Phase11ProductSurface
} from "@/lib/phase11Productization";

const allowedSurfaces: Phase11ProductSurface[] = [
  "canon",
  "daily_word",
  "promise_search",
  "prayer",
  "calling_compass",
  "journey",
  "journal",
  "book",
  "personalization",
  "tig_graph",
  "ai_companion"
];

function isSurface(value: unknown): value is Phase11ProductSurface {
  return typeof value === "string" && allowedSurfaces.includes(value as Phase11ProductSurface);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const surface = isSurface(body.surface) ? body.surface : "ai_companion";
    const input = typeof body.input === "string" ? body.input : undefined;
    const context =
      body.context && typeof body.context === "object" && !Array.isArray(body.context)
        ? body.context
        : {};

    return NextResponse.json(runPhase11TigSurface(surface, input, context));
  } catch (error) {
    return NextResponse.json(
      {
        error: "Local TIG production failed safely.",
        details: error instanceof Error ? error.message : "Unknown local error.",
        noExternalServicesRequired: true
      },
      { status: 400 }
    );
  }
}
