import { z } from "zod";
import { createTeoGuideResponse } from "@/lib/phase112Productization";
import { createDeterministicTeoGuideMessage } from "@/domain/teo-guide/teo-guide-message";
import { TEO_GUIDE_LIMITS } from "@/domain/teo-guide/orchestration-contracts";
import { createTeoGuideClientResponse } from "@/features/teo-guide/application/teo-guide-client-response";
import { enforceRateLimit, readJsonObject, safeApiError, sameOrigin } from "@/server/http/memory-route-helpers";
import { deterministicTeoGuideOrchestrator } from "@/server/teo-guide/deterministic-orchestrator";
import { createTeoGuideContextFromRequest } from "@/server/teo-guide/request-context";
import { guardedLiveTeoGuideService } from "@/server/live-ai/guarded-live-teo-guide-service";
import { liveAiStatusResponse } from "@/server/live-ai/live-ai-status";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  input: z.string().max(TEO_GUIDE_LIMITS.inputCharacters * 2).optional(),
  prompt: z.string().max(TEO_GUIDE_LIMITS.inputCharacters * 2).optional(),
  conversationId: z.string().trim().min(8).max(160).regex(/^[a-z0-9._:-]+$/i).optional(),
  locale: z.string().trim().min(2).max(32).regex(/^[a-z0-9-]+$/i).optional(),
  mode: z.enum(["deterministic", "live_if_authorized"]).optional()
}).strict();

export async function GET(request: Request) {
  return liveAiStatusResponse(request);
}

export async function POST(request: Request) {
  if (!sameOrigin(request) || !enforceRateLimit(request)) return safeApiError(new Error("Request verification failed."));
  try {
    const body = requestSchema.parse(await readJsonObject(request));
    const input = body.input || body.prompt || "Give me a Scripture-grounded next step.";
    const conversationId = body.conversationId || `teo-session-${crypto.randomUUID()}`;
    const context = await createTeoGuideContextFromRequest(request, { conversationId, locale: body.locale || "en" });
    const orchestration = await deterministicTeoGuideOrchestrator.run({ input, context });
    const guided = await guardedLiveTeoGuideService.run({ request: { input, context }, deterministic: orchestration, mode: body.mode || "live_if_authorized", abortSignal: request.signal });
    const compatibility = createTeoGuideResponse(input);
    return Response.json({
      ...compatibility,
      guideMessage: createDeterministicTeoGuideMessage(input),
      client: createTeoGuideClientResponse(input, guided.response, { externalProcessingConsent: guided.externalProcessingConsent, fallbackReason: guided.fallbackReason }),
      orchestration,
      liveAi: {
        generationMode: guided.generationMode,
        fallbackReason: guided.fallbackReason,
        providerCalls: guided.providerCalls,
        memoryIncluded: guided.memoryIncluded,
        externalProcessingConsent: guided.externalProcessingConsent,
        sensitiveContentConsent: guided.sensitiveContentConsent,
        memoryContextConsent: guided.memoryContextConsent,
        usage: guided.usage,
        store: false,
        durableWritePerformed: false
      }
    }, { headers: { "cache-control": "no-store", "x-teoyube-runtime": guided.generationMode === "live" ? "guarded-live-orchestration" : "deterministic-orchestration" } });
  } catch (error) {
    return safeApiError(error);
  }
}
