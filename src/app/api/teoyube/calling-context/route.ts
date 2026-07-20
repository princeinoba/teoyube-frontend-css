import { NextResponse } from "next/server";
import { createCallingCompassClientContext } from "../../../../features/calling/application/calling-compass-service";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.slice(0, 2_000) : "calling purpose";
  return NextResponse.json(createCallingCompassClientContext(query));
}
