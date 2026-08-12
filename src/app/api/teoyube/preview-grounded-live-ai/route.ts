import { createHash } from "node:crypto";
import { z } from "zod";
import {
  assertAllowedFields,
  readJsonObject,
  sameOrigin,
} from "@/server/http/memory-route-helpers";
import {
  isPreviewGroundedLiveAiRuntime,
  PREVIEW_GROUNDED_LIMITS,
  previewGroundedLiveAiService,
} from "@/server/live-ai/preview-grounded-live-ai";
import {
  previewGroundedEvaluationCase,
  requestMatchesLockedCase,
} from "@/server/live-ai/preview-grounded-evaluation-dataset";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const windows = new Map<string, { startedAt: number; count: number }>();
const requestSchema = z.object({
  caseId: z.string().trim().min(1).max(96).regex(/^[a-z0-9-]+$/),
  query: z.string().trim().min(1).max(PREVIEW_GROUNDED_LIMITS.maximumQueryCharacters),
  intent: z.enum(["general", "scripture", "canon", "promise", "lexicon", "calling", "prayer"]),
}).strict();

function response(status: number, body: unknown): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "private, no-store" },
  });
}

function rateLimit(request: Request): boolean {
  const subject = request.headers.get("x-forwarded-for") || "preview-evaluation";
  const key = createHash("sha256").update("preview-grounded-live-ai").update(subject).digest("hex");
  const current = Date.now();
  const existing = windows.get(key);
  if (!existing || current - existing.startedAt >= 60_000) {
    windows.set(key, { startedAt: current, count: 1 });
    return true;
  }
  existing.count += 1;
  return existing.count <= PREVIEW_GROUNDED_LIMITS.perSubjectRequestsPerMinute;
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (!origin || !sameOrigin(request)) {
    return response(403, { ok: false, reason: "same_origin_required", persisted: false });
  }
  if (!rateLimit(request)) {
    return response(429, { ok: false, reason: "rate_limit", persisted: false });
  }
  if (!isPreviewGroundedLiveAiRuntime()) {
    return response(503, { ok: false, reason: "preview_runtime_disabled", persisted: false });
  }
  try {
    const body = await readJsonObject(request);
    assertAllowedFields(body, ["caseId", "query", "intent"]);
    const input = requestSchema.parse(body);
    const fixture = previewGroundedEvaluationCase(input.caseId);
    if (!fixture || !requestMatchesLockedCase(fixture, input)) {
      return response(403, { ok: false, reason: "locked_dataset_mismatch", persisted: false });
    }
    const result = await previewGroundedLiveAiService().run({
      ...input,
      requiredCitationIds: fixture.requiredCitationIds,
    });
    const status = result.ok ? 200 : 422;
    return response(status, result);
  } catch (error) {
    const hardStop = error instanceof Error && /provider_authentication_failed|approved_model_unavailable/.test(error.message);
    if (hardStop) return response(503, { ok: false, reason: error instanceof Error ? error.message : "provider_hard_stop", persisted: false });
    return response(400, { ok: false, reason: "invalid_request", persisted: false });
  }
}
