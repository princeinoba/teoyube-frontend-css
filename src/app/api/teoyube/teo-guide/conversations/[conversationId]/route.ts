import { authorizeMutation, authorizeRead, runtimeOrNull, safeApiError } from "@/server/http/memory-route-helpers";
import { teoGuideConversations } from "@/server/teo-guide/conversation-repository";

export const dynamic = "force-dynamic";

function safeId(value: string): string {
  if (!/^[a-z0-9._:-]{8,160}$/i.test(value)) throw new Error("Conversation is unavailable.");
  return value;
}

export async function GET(request: Request, route: Readonly<{ params: Promise<Readonly<{ conversationId: string }>> }>) {
  const runtime = runtimeOrNull();
  if (!runtime) return Response.json({ error: "Authenticated conversation inspection is disabled for this preview environment." }, { status: 503, headers: { "cache-control": "no-store" } });
  try {
    await authorizeRead(request, runtime);
    const record = teoGuideConversations.inspect(safeId((await route.params).conversationId));
    if (!record) return Response.json({ error: "Conversation is unavailable." }, { status: 404, headers: { "cache-control": "no-store" } });
    return Response.json({ conversation: record }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return safeApiError(error);
  }
}

export async function DELETE(request: Request, route: Readonly<{ params: Promise<Readonly<{ conversationId: string }>> }>) {
  const runtime = runtimeOrNull();
  if (!runtime) return Response.json({ error: "Authenticated conversation deletion is disabled for this preview environment." }, { status: 503, headers: { "cache-control": "no-store" } });
  try {
    await authorizeMutation(request, runtime);
    return Response.json({ deleted: teoGuideConversations.delete(safeId((await route.params).conversationId)) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return safeApiError(error);
  }
}
