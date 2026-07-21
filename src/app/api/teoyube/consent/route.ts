import type { GrantConsentCommand, RevokeConsentCommand } from "@/domain/memory/memory-contracts";
import { authorizeMutation, authorizeRead, disabledResponse, enforceRateLimit, purposeId, readJsonObject, runtimeOrNull, safeApiError } from "@/server/http/memory-route-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  try {
    const context = await authorizeRead(request, runtime);
    const purpose = new URL(request.url).searchParams.get("purpose");
    if (purpose) return Response.json({ effective: await runtime.memory.effectiveConsent(context, purposeId(purpose)), history: await runtime.memory.consentHistory(context) }, { headers: { "cache-control": "no-store" } });
    return Response.json({ history: await runtime.memory.consentHistory(context) }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return safeApiError(error); }
}

export async function POST(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  if (!enforceRateLimit(request)) return safeApiError(new Error("The request limit was reached."));
  try {
    const context = await authorizeMutation(request, runtime);
    const body = await readJsonObject(request);
    if (!Array.isArray(body.scope) || body.scope.some((item) => typeof item !== "string") || typeof body.policyVersion !== "string") throw new Error("Consent request is invalid.");
    const command: GrantConsentCommand = Object.freeze({ purposeId: purposeId(body.purposeId), scope: Object.freeze([...body.scope] as string[]), policyVersion: body.policyVersion, expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : undefined, source: "user_ui" });
    return Response.json({ consent: await runtime.memory.grantConsent(context, command) }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) { return safeApiError(error); }
}

export async function DELETE(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  try {
    const context = await authorizeMutation(request, runtime);
    const body = await readJsonObject(request);
    if (typeof body.policyVersion !== "string") throw new Error("Consent request is invalid.");
    const command: RevokeConsentCommand = Object.freeze({ purposeId: purposeId(body.purposeId), policyVersion: body.policyVersion, source: "user_ui" });
    return Response.json(await runtime.memory.revokeConsent(context, command), { headers: { "cache-control": "no-store" } });
  } catch (error) { return safeApiError(error); }
}
