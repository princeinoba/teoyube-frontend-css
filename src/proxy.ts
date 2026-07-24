import { NextResponse, type NextRequest } from "next/server";
import { getMemoryRuntime } from "./server/memory/memory-runtime";

const OWNER_ROLES = Object.freeze(["owner", "admin"] as const);
const API_BODY_BYTES = 64 * 1024;

function localOwnerQaAccess(request: NextRequest): boolean {
  if (process.env.TEOYUBE_OWNER_QA_TEST_MODE !== "true") return false;
  if (request.nextUrl.pathname !== "/roadmap") return false;
  if (request.nextUrl.searchParams.get("qa") !== "1") return false;
  const hostname = request.nextUrl.hostname.toLowerCase();
  return hostname === "127.0.0.1" || hostname === "localhost";
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (!Number.isFinite(contentLength) || contentLength < 0 || contentLength > API_BODY_BYTES) {
      return NextResponse.json(
        { error: "The request body is too large." },
        { status: 413, headers: { "cache-control": "no-store" } }
      );
    }
    if (
      contentLength > 0 &&
      !request.headers.get("content-type")?.toLowerCase().startsWith("application/json")
    ) {
      return NextResponse.json(
        { error: "The request content type is unsupported." },
        { status: 415, headers: { "cache-control": "no-store" } }
      );
    }
    const supplied = request.headers.get("x-request-id") || "";
    const requestId = /^[a-z0-9._:-]{8,128}$/i.test(supplied)
      ? supplied
      : crypto.randomUUID();
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-teoyube-request-id", requestId);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("x-request-id", requestId);
    return response;
  }
  const runtime = getMemoryRuntime();
  if (!runtime) {
    return localOwnerQaAccess(request)
      ? NextResponse.next()
      : new NextResponse("Resource unavailable.", {
          status: 404,
          headers: { "cache-control": "no-store" }
        });
  }
  const token = request.cookies.get("teoyube_session")?.value || "";
  try {
    await runtime.identity.requireRole(token, OWNER_ROLES);
    return NextResponse.next();
  } catch {
    return new NextResponse("Resource unavailable.", { status: 404, headers: { "cache-control": "no-store" } });
  }
}

export const config = {
  matcher: ["/api/:path*", "/roadmap", "/dashboard", "/dev/:path*", "/tig/:path*", "/graph"]
};
