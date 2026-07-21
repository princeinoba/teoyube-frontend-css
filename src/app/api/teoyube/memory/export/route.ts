import { authorizeRead, disabledResponse, enforceRateLimit, runtimeOrNull, safeApiError } from "@/server/http/memory-route-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  if (!enforceRateLimit(request)) return safeApiError(new Error("The request limit was reached."));
  try {
    const context = await authorizeRead(request, runtime);
    return Response.json(await runtime.memory.export(context), { headers: { "cache-control": "no-store", "content-disposition": "attachment; filename=teoyube-user-data.json" } });
  } catch (error) { return safeApiError(error); }
}
