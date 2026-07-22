import { z } from "zod";
import { authorizePreWrite } from "@/domain/safety/safety-engine";
import { authorizeMutation, enforceRateLimit, readJsonObject, runtimeOrNull, safeApiError } from "@/server/http/memory-route-helpers";
import { teoGuideActionProposals } from "@/server/teo-guide/action-proposal-repository";

export const dynamic = "force-dynamic";

const decisionSchema = z.object({
  proposalId: z.string().trim().min(8).max(160),
  expectedRevision: z.number().int().min(1),
  decision: z.enum(["confirm", "reject"])
}).strict();

export async function POST(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return Response.json({ error: "Authenticated action confirmation is disabled for this preview environment." }, { status: 503, headers: { "cache-control": "no-store" } });
  if (!enforceRateLimit(request)) return safeApiError(new Error("Request verification failed."));
  try {
    const context = await authorizeMutation(request, runtime);
    const decision = decisionSchema.parse(await readJsonObject(request));
    const current = teoGuideActionProposals.get(decision.proposalId);
    if (!current) throw new Error("Action proposal is unavailable.");
    if (decision.decision === "confirm") {
      const purpose = current.kind === "journey_action" ? "journey_continuity" : current.kind === "testimony_candidate" ? "testimony_book_continuity" : "sensitive_spiritual_storage";
      const consent = await runtime.memory.effectiveConsent(context, purpose);
      const preWrite = authorizePreWrite({
        action: current.kind === "journey_action" ? "journey.advance" : "memory.write",
        authenticated: true,
        authorized: true,
        effectiveConsent: consent?.status === "granted",
        purposeMatches: true,
        explicitUserConfirmation: true,
        sameUser: true,
        sourceValidationPassed: current.sourceIds.length > 0
      });
      if (!preWrite.allowed) throw new Error(preWrite.reason);
    }
    return Response.json(teoGuideActionProposals.decide(context, decision), { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return safeApiError(error);
  }
}
