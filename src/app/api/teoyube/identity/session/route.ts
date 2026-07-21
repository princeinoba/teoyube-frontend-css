import { authorizeRead, disabledResponse, runtimeOrNull, safeApiError } from "@/server/http/memory-route-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  try {
    const context = await authorizeRead(request, runtime);
    return Response.json({ authenticated: true, user: context.user }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return safeApiError(error); }
}
