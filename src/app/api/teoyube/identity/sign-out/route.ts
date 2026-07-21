import { NextResponse } from "next/server";
import { CSRF_COOKIE, disabledResponse, runtimeOrNull, safeApiError, sameOrigin, sessionToken, SESSION_COOKIE } from "@/server/http/memory-route-helpers";

export async function POST(request: Request) {
  const runtime = runtimeOrNull();
  if (!runtime) return disabledResponse();
  if (!sameOrigin(request)) return safeApiError(new Error("Request verification failed."));
  try {
    await runtime.identity.signOut(sessionToken(request), request.headers.get("x-teoyube-csrf") || "");
    const response = NextResponse.json({ signedOut: true }, { headers: { "cache-control": "no-store" } });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
    response.cookies.set(CSRF_COOKIE, "", { httpOnly: false, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
    return response;
  } catch (error) { return safeApiError(error); }
}
