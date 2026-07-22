import { liveAiStatusResponse } from "@/server/live-ai/live-ai-status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return liveAiStatusResponse(request);
}
