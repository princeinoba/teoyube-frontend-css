import { assertAllowedFields, authorizeMutation, disabledResponse, enforceRateLimit, readJsonObject, runtimeOrNull, safeApiError } from "@/server/http/memory-route-helpers";

export async function POST(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  if (!enforceRateLimit(request)) return safeApiError(new Error("The request limit was reached."));
  try {
    const context = await authorizeMutation(request, runtime);
    const body = await readJsonObject(request);
    assertAllowedFields(body, ["idempotencyKey", "confirm"]);
    if (typeof body.idempotencyKey !== "string" || body.confirm !== "DELETE MY TEOYUBE DATA") throw new Error("Deletion confirmation is required.");
    return Response.json({ deletion: await runtime.memory.deleteAccount(context, body.idempotencyKey) }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return safeApiError(error); }
}
