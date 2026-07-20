import { NextResponse } from "next/server";
import { ScriptureRepositoryError, canonicalScriptureRepository } from "../../../../server/scripture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_024;

type RequestBody = Readonly<Record<string, unknown>>;

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

function isRecord(value: unknown): value is RequestBody {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return errorResponse(413, "query_too_large", "The Scripture request is too large.");
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body) || typeof body.action !== "string") {
    return errorResponse(400, "invalid_request", "A valid Scripture action is required.");
  }

  if (body.action === "corpus_info") {
    const info = await canonicalScriptureRepository.getCorpusInfo();
    return NextResponse.json({
      ok: true,
      corpus: {
        id: info.id,
        translationId: info.translationId,
        corpusVersion: info.corpusVersion,
        corpusChecksum: info.corpusChecksum,
        displayPolicy: info.displayPolicy,
        referenceCoverage: info.referenceCoverage,
        verseCoverage: info.verseCoverage,
        readiness: info.readiness,
        limitations: info.limitations
      }
    }, { headers: { "Cache-Control": "no-store" } });
  }

  if (body.action === "parse") {
    if (typeof body.reference !== "string") return errorResponse(400, "invalid_request", "A Scripture reference string is required.");
    return NextResponse.json({ ok: true, results: canonicalScriptureRepository.parseReferences(body.reference) }, { headers: { "Cache-Control": "no-store" } });
  }

  if (body.action === "search") {
    if (typeof body.query !== "string") return errorResponse(400, "invalid_request", "A Scripture search string is required.");
    if (body.limit !== undefined && (typeof body.limit !== "number" || !Number.isInteger(body.limit))) {
      return errorResponse(400, "invalid_request", "The result limit must be an integer.");
    }
    try {
      const results = await canonicalScriptureRepository.search({
        text: body.query,
        ...(body.translationId === undefined ? {} : { translationId: typeof body.translationId === "string" ? body.translationId : "__INVALID__" }),
        ...(body.limit === undefined ? {} : { limit: body.limit })
      });
      return NextResponse.json({ ok: true, results }, { headers: { "Cache-Control": "no-store" } });
    } catch (caught) {
      if (caught instanceof ScriptureRepositoryError) {
        return errorResponse(caught.code === "query_too_large" ? 413 : 422, caught.code, caught.message);
      }
      return errorResponse(500, "scripture_service_unavailable", "The local Scripture reference service is unavailable.");
    }
  }

  return errorResponse(400, "invalid_request", "The Scripture action is not supported.");
}
