import type { DeleteMemoryCommand, MemoryProvenance, NewUserMemoryRecord, UpdateMemoryCommand } from "@/domain/memory/memory-contracts";
import { assertAllowedFields, authorizeMutation, authorizeRead, disabledResponse, enforceRateLimit, purposeId, readJsonObject, runtimeOrNull, safeApiError } from "@/server/http/memory-route-helpers";

export const dynamic = "force-dynamic";

function object(value: unknown): Readonly<Record<string, unknown>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Memory request is invalid.");
  return value as Record<string, unknown>;
}

function newRecord(body: Readonly<Record<string, unknown>>): NewUserMemoryRecord {
  assertAllowedFields(body, [
    "idempotencyKey",
    "layer",
    "sensitivity",
    "purposeId",
    "provenance",
    "content",
    "userApproved",
    "explicitSensitiveContentApproval",
    "expiresAt"
  ]);
  if (typeof body.idempotencyKey !== "string" || !["episodic", "semantic_preference", "journey_state"].includes(String(body.layer)) || !["low", "structured_spiritual", "sensitive_spiritual"].includes(String(body.sensitivity)) || typeof body.userApproved !== "boolean") throw new Error("Memory request is invalid.");
  const provenance = object(body.provenance);
  assertAllowedFields(provenance, [
    "sourceType",
    "sourceId",
    "scriptureCitations",
    "createdBy",
    "tigRecommendationId",
    "tigExplanationReferences",
    "reversibleTransitionRevision"
  ]);
  if (!["user_explicit", "journey_transition", "user_confirmed_summary", "import"].includes(String(provenance.sourceType)) || !["user", "deterministic_system"].includes(String(provenance.createdBy))) throw new Error("Memory provenance is invalid.");
  return Object.freeze({
    idempotencyKey: body.idempotencyKey,
    layer: body.layer as NewUserMemoryRecord["layer"],
    sensitivity: body.sensitivity as NewUserMemoryRecord["sensitivity"],
    purposeId: purposeId(body.purposeId),
    provenance: provenance as MemoryProvenance,
    content: object(body.content),
    userApproved: body.userApproved,
    explicitSensitiveContentApproval: body.explicitSensitiveContentApproval === true,
    expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : undefined
  });
}

export async function GET(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  try {
    const context = await authorizeRead(request, runtime);
    const params = new URL(request.url).searchParams;
    const purpose = params.get("purpose");
    const layer = params.get("layer");
    const limit = Number(params.get("limit") || 50);
    return Response.json({ memories: await runtime.memory.list(context, { purposeId: purpose ? purposeId(purpose) : undefined, layer: ["episodic", "semantic_preference", "journey_state"].includes(String(layer)) ? layer as "episodic" | "semantic_preference" | "journey_state" : undefined, limit }) }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return safeApiError(error); }
}

export async function POST(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  if (!enforceRateLimit(request)) return safeApiError(new Error("The request limit was reached."));
  try {
    const context = await authorizeMutation(request, runtime);
    const record = await runtime.memory.create(context, newRecord(await readJsonObject(request)));
    return Response.json({ memory: record }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) { return safeApiError(error); }
}

export async function PATCH(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  if (!enforceRateLimit(request)) return safeApiError(new Error("The request limit was reached."));
  try {
    const context = await authorizeMutation(request, runtime);
    const body = await readJsonObject(request);
    assertAllowedFields(body, ["id", "expectedVersion", "content", "userApproved"]);
    if (typeof body.id !== "string" || typeof body.expectedVersion !== "number" || typeof body.userApproved !== "boolean") throw new Error("Memory request is invalid.");
    const command: UpdateMemoryCommand = Object.freeze({ id: body.id, expectedVersion: body.expectedVersion, content: object(body.content), userApproved: body.userApproved });
    return Response.json({ memory: await runtime.memory.update(context, command) }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return safeApiError(error); }
}

export async function DELETE(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  if (!enforceRateLimit(request)) return safeApiError(new Error("The request limit was reached."));
  try {
    const context = await authorizeMutation(request, runtime);
    const body = await readJsonObject(request);
    assertAllowedFields(body, ["id", "purposeId", "allSensitive", "idempotencyKey"]);
    if (typeof body.idempotencyKey !== "string") throw new Error("Deletion request is invalid.");
    const command: DeleteMemoryCommand = Object.freeze({ id: typeof body.id === "string" ? body.id : undefined, purposeId: body.purposeId ? purposeId(body.purposeId) : undefined, allSensitive: body.allSensitive === true, idempotencyKey: body.idempotencyKey });
    return Response.json({ deletion: await runtime.memory.delete(context, command) }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return safeApiError(error); }
}
