import { enforceRateLimit, safeApiError, sameOrigin } from "../http/memory-route-helpers";
import { createTeoGuideContextFromRequest } from "../teo-guide/request-context";
import { LIVE_AI_MODELS, readLiveAiRuntimeConfiguration } from "./model-configuration";

function hasConsent(context: Awaited<ReturnType<typeof createTeoGuideContextFromRequest>>, purposeId: string, scope: string): boolean {
  const current = Date.parse(context.now);
  return context.effectiveConsents.some((grant) => grant.purposeId === purposeId
    && grant.status === "granted"
    && grant.scope.includes(scope)
    && (!grant.expiresAt || Date.parse(grant.expiresAt) > current));
}

export async function liveAiStatusResponse(request: Request): Promise<Response> {
  if (!sameOrigin(request) || !enforceRateLimit(request)) return safeApiError(new Error("Request verification failed."));
  const configuration = readLiveAiRuntimeConfiguration();
  const context = await createTeoGuideContextFromRequest(request, { conversationId: `teo-status-${crypto.randomUUID()}`, locale: "en" });
  return Response.json({
    liveAiConfigured: configuration.enabled,
    deterministicAvailable: true,
    provider: configuration.enabled ? "openai" : undefined,
    approvedModels: configuration.enabled ? { light: LIVE_AI_MODELS.light.id, standard: LIVE_AI_MODELS.standard.id, advanced: "disabled" } : undefined,
    externalProcessingConsent: hasConsent(context, "external_ai_processing", "external_ai:process"),
    sensitiveContentConsent: hasConsent(context, "external_ai_sensitive_content", "external_ai:sensitive_content"),
    memoryContextConsent: hasConsent(context, "external_ai_memory_context", "external_ai:memory_context"),
    conversationRetentionConsent: hasConsent(context, "live_ai_conversation_retention", "external_ai:conversation_retention"),
    store: false,
    zeroDataRetentionClaimed: false,
    secretValuesExposed: false
  }, { headers: { "cache-control": "no-store" } });
}
