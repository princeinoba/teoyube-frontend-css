import { NextResponse } from "next/server";
import { createTeoGuideResponse } from "@/lib/phase112Productization";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const prompt =
    typeof body.prompt === "string"
      ? body.prompt
      : typeof body.input === "string"
        ? body.input
        : "Give me a Scripture-grounded next step.";

  return NextResponse.json(createTeoGuideResponse(prompt));
}

