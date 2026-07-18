import { NextResponse } from "next/server";
import type { TIGAIRequest } from "../../../../src/lib/tig";
import { runTIGEngineSync } from "../../../../src/lib/tig";

const allowedModes = [
  "daily_word",
  "promise_search",
  "calling_compass",
  "prayer",
  "journal",
  "growth_journey",
  "ai_companion"
] as const;

type TIGRouteMode = (typeof allowedModes)[number];

type TIGRequestBody = {
  input?: unknown;
  mode?: unknown;
  context?: unknown;
  userId?: unknown;
  locale?: unknown;
  safety?: unknown;
};

function errorResponse(status: number, error: string, details: string) {
  return NextResponse.json({ error, details }, { status });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isValidMode(mode: unknown): mode is TIGRouteMode {
  return typeof mode === "string" && allowedModes.includes(mode as TIGRouteMode);
}

function normalizeLanguage(locale: unknown): TIGAIRequest["context"]["language"] {
  const language = typeof locale === "string" ? locale.slice(0, 2).toLowerCase() : "en";
  if (language === "es" || language === "fr" || language === "pt" || language === "sw") {
    return language;
  }
  return "en";
}

function createTIGRequest(body: TIGRequestBody): TIGAIRequest | NextResponse {
  if (typeof body.input !== "string") {
    return errorResponse(400, "Invalid TIG request", "input is required and must be a string.");
  }

  const input = body.input.trim();
  if (!input) {
    return errorResponse(400, "Invalid TIG request", "input must not be empty.");
  }

  if (!isValidMode(body.mode)) {
    return errorResponse(
      400,
      "Invalid TIG request",
      `mode is required and must be one of: ${allowedModes.join(", ")}.`
    );
  }

  const context = isObject(body.context) ? body.context : {};
  const request: TIGAIRequest = {
    id: `tig_api_${Date.now()}`,
    mode: body.mode,
    input,
    context: {
      ...context,
      userId: typeof body.userId === "string" ? body.userId : (context.userId as string | undefined),
      language: normalizeLanguage(body.locale || context.locale),
      audience: "GENERAL",
      locale: body.locale,
      safety: body.safety
    } as TIGAIRequest["context"],
    requestedAt: new Date().toISOString()
  };

  return request;
}

export async function POST(req: Request) {
  let body: TIGRequestBody;

  try {
    body = (await req.json()) as TIGRequestBody;
  } catch {
    return errorResponse(400, "Invalid TIG request", "Request body must be valid JSON.");
  }

  const request = createTIGRequest(body);
  if (request instanceof NextResponse) return request;

  try {
    const response = runTIGEngineSync(request);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return errorResponse(
      500,
      "TIG engine failed",
      error instanceof Error ? error.message : "Unknown TIG engine error."
    );
  }
}
