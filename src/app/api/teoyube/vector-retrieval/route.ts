import { z } from "zod";
import {
  assertAllowedFields,
  enforceRateLimit,
  readJsonObject,
  safeApiError,
  sameOrigin
} from "@/server/http/memory-route-helpers";
import {
  evaluateManagedVectorPreviewQueryPolicy,
  isManagedVectorPreviewRuntime,
  managedVectorPreviewRuntime,
  MANAGED_VECTOR_PREVIEW_LIMITS
} from "@/server/retrieval/preview-managed-retrieval";
import { documentContentType } from "@/server/retrieval/retrieval-query-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestSchema = z.object({
  query: z.string().trim().min(1).max(MANAGED_VECTOR_PREVIEW_LIMITS.queryCharacters),
  intent: z.enum(["general", "scripture", "canon", "promise", "lexicon", "calling", "prayer"]).default("general"),
  externalProcessingConsent: z.literal(true)
}).strict();

function noStore(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request): Promise<Response> {
  if (!sameOrigin(request) || !enforceRateLimit(request)) {
    return safeApiError(new Error("Request verification failed."));
  }
  if (!isManagedVectorPreviewRuntime()) {
    return noStore(503, { error: "Managed vector retrieval is disabled for this environment." });
  }
  try {
    const body = await readJsonObject(request);
    assertAllowedFields(body, ["query", "intent", "externalProcessingConsent"]);
    const input = requestSchema.parse(body);
    const policy = evaluateManagedVectorPreviewQueryPolicy(input);
    if (!policy.accepted) {
      return noStore(422, {
        ok: false,
        providerCalled: false,
        persisted: false,
        reason: policy.reason
      });
    }
    const result = await managedVectorPreviewRuntime().retrieve({ query: input.query, intent: input.intent });
    return noStore(200, {
      ok: true,
      runtime: "managed-vector-preview-canary",
      provider: result.pathsUsed.includes("vector") ? "upstash/openai-embeddings" : "deterministic",
      generationUsed: false,
      persisted: false,
      queryDisposition: result.queryDisposition,
      pathsUsed: result.pathsUsed,
      fallback: result.fallback,
      latencyMs: result.latencyMs,
      sources: result.sources.slice(0, MANAGED_VECTOR_PREVIEW_LIMITS.topK).map((source) => ({
        documentId: source.documentId,
        contentType: documentContentType(source.documentId),
        title: source.title,
        reference: source.canonicalReference?.canonicalLabel,
        citations: source.scriptureCitations.map((citation) => citation.canonicalLabel),
        trustLevel: source.trustLevel,
        fusedScore: source.fusedScore,
        content: source.content
      })),
      limitations: result.limitations
    });
  } catch {
    return noStore(503, {
      error: "Managed vector retrieval is temporarily unavailable.",
      fallback: "deterministic",
      persisted: false
    });
  }
}
