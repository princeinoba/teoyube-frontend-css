import { NextResponse, type NextRequest } from "next/server";
import { getMemoryRuntime } from "./server/memory/memory-runtime";

const OWNER_ROLES = Object.freeze(["owner", "admin"] as const);

export async function proxy(request: NextRequest) {
  const runtime = getMemoryRuntime();
  if (!runtime) return NextResponse.next();
  const token = request.cookies.get("teoyube_session")?.value || "";
  try {
    await runtime.identity.requireRole(token, OWNER_ROLES);
    return NextResponse.next();
  } catch {
    return new NextResponse("Resource unavailable.", { status: 404, headers: { "cache-control": "no-store" } });
  }
}

export const config = {
  matcher: ["/roadmap", "/dashboard", "/dev/:path*", "/tig/:path*", "/graph"]
};
