import { NextResponse } from "next/server";
import { CSRF_COOKIE, disabledResponse, enforceRateLimit, runtimeOrNull, safeApiError, sameOrigin, sessionToken, SESSION_COOKIE } from "@/server/http/memory-route-helpers";

export async function POST(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  if (!sameOrigin(request) || !enforceRateLimit(request)) return safeApiError(new Error("Request verification failed."));
  try {
    const issued = await runtime.identity.rotate(sessionToken(request), request.headers.get("x-teoyube-csrf") || "");
    const response = NextResponse.json({ session: issued.session }, { headers: { "cache-control": "no-store" } });
    response.cookies.set(SESSION_COOKIE, issued.token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(issued.session.expiresAt) });
    response.cookies.set(CSRF_COOKIE, issued.session.csrfToken, { httpOnly: false, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(issued.session.expiresAt) });
    return response;
  } catch (error) { return safeApiError(error); }
}
