import { NextResponse } from "next/server";
import { CSRF_COOKIE, disabledResponse, enforceRateLimit, readJsonObject, runtimeOrNull, safeApiError, sameOrigin, SESSION_COOKIE } from "@/server/http/memory-route-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  if (!sameOrigin(request) || !enforceRateLimit(request)) return safeApiError(new Error("Request verification failed."));
  try {
    const body = await readJsonObject(request);
    if (typeof body.credential !== "string" || body.credential.length > 256) throw new Error("Authentication failed.");
    const issued = await runtime.identity.signIn(body.credential);
    const response = NextResponse.json({ session: issued.session }, { headers: { "cache-control": "no-store" } });
    response.cookies.set(SESSION_COOKIE, issued.token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(issued.session.expiresAt) });
    response.cookies.set(CSRF_COOKIE, issued.session.csrfToken, { httpOnly: false, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(issued.session.expiresAt) });
    return response;
  } catch (error) { return safeApiError(error); }
}
