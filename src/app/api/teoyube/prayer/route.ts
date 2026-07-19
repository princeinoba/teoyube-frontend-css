import { NextResponse } from "next/server";
import { createPrayerReplyDto } from "../../../../features/prayer/application/prayer-service";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const input = typeof body.input === "string" ? body.input : "Help me pray through my current season.";
  return NextResponse.json({
    reply: createPrayerReplyDto(input),
    noExternalServicesRequired: true,
    noPersistenceEnabled: true
  });
}
