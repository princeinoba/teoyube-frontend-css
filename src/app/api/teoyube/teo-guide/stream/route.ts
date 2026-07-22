import { z } from "zod";
import { TEO_GUIDE_LIMITS } from "@/domain/teo-guide/orchestration-contracts";
import { createTeoGuideClientResponse } from "@/features/teo-guide/application/teo-guide-client-response";
import { enforceRateLimit, readJsonObject, safeApiError, sameOrigin } from "@/server/http/memory-route-helpers";
import { guardedLiveTeoGuideService } from "@/server/live-ai/guarded-live-teo-guide-service";
import { deterministicTeoGuideOrchestrator } from "@/server/teo-guide/deterministic-orchestrator";
import { createTeoGuideContextFromRequest } from "@/server/teo-guide/request-context";

export const dynamic = "force-dynamic";

const streamRequestSchema = z.object({
  input: z.string().min(1).max(TEO_GUIDE_LIMITS.inputCharacters * 2),
  conversationId: z.string().trim().min(8).max(160).regex(/^[a-z0-9._:-]+$/i),
  locale: z.string().trim().min(2).max(32).regex(/^[a-z0-9-]+$/i).default("en"),
  mode: z.enum(["deterministic", "live_if_authorized"]).default("live_if_authorized")
}).strict();

type PublicStreamEvent =
  | Readonly<{ type: "progress"; stage: "safety_and_plan" | "source_validation" | "response_validation" }>
  | Readonly<{ type: "approved_section"; section: Readonly<{ kind: string; label: string; body: string; sourceIds: readonly string[] }> }>
  | Readonly<{ type: "fallback"; reasonCode: string }>
  | Readonly<{ type: "complete"; client: ReturnType<typeof createTeoGuideClientResponse>; liveAi: Readonly<Record<string, unknown>> }>;

function line(event: PublicStreamEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export async function POST(request: Request) {
  if (!sameOrigin(request) || !enforceRateLimit(request)) return safeApiError(new Error("Request verification failed."));
  try {
    const body = streamRequestSchema.parse(await readJsonObject(request));
    const context = await createTeoGuideContextFromRequest(request, { conversationId: body.conversationId, locale: body.locale });
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          if (request.signal.aborted) { controller.close(); return; }
          controller.enqueue(line({ type: "progress", stage: "safety_and_plan" }));
          const deterministic = await deterministicTeoGuideOrchestrator.run({ input: body.input, context });
          if (request.signal.aborted) { controller.close(); return; }
          controller.enqueue(line({ type: "progress", stage: "source_validation" }));
          const guided = await guardedLiveTeoGuideService.run({ request: { input: body.input, context }, deterministic, mode: body.mode, abortSignal: request.signal });
          if (request.signal.aborted) { controller.close(); return; }
          for (const event of guided.events) {
            if (event.type === "approved_section") controller.enqueue(line({ type: "approved_section", section: event.section }));
          }
          if (guided.fallbackReason) controller.enqueue(line({ type: "fallback", reasonCode: guided.fallbackReason }));
          controller.enqueue(line({ type: "progress", stage: "response_validation" }));
          const client = createTeoGuideClientResponse(body.input, guided.response, { externalProcessingConsent: guided.externalProcessingConsent, fallbackReason: guided.fallbackReason });
          controller.enqueue(line({
            type: "complete",
            client,
            liveAi: Object.freeze({
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
            })
          }));
          controller.close();
        } catch {
          if (!request.signal.aborted) controller.enqueue(line({ type: "fallback", reasonCode: "guarded_stream_unavailable" }));
          controller.close();
        }
      },
      cancel() {
        // The Request signal owns cancellation; no provider content or write survives disconnect.
      }
    });
    return new Response(stream, {
      headers: {
        "cache-control": "no-store",
        "content-type": "application/x-ndjson; charset=utf-8",
        "x-content-type-options": "nosniff",
        "x-teoyube-stream": "validated-sections-only"
      }
    });
  } catch (error) {
    return safeApiError(error);
  }
}
