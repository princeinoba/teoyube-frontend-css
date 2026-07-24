import { createHash } from "node:crypto";
import type { AuthorizationContext } from "../../domain/identity/identity-contracts";
import type { PurposeId } from "../../domain/memory/memory-contracts";
import { MEMORY_PURPOSE_REGISTRY } from "../../domain/memory/data-classification-registry";
import { MEMORY_LIMITS } from "../../features/memory";
import { getMemoryRuntime, type MemoryRuntime } from "../memory/memory-runtime";

export const SESSION_COOKIE = "teoyube_session";
export const CSRF_COOKIE = "teoyube_csrf";

const windows = new Map<string, { startedAt: number; count: number }>();

function tokenFromRequest(request: Request): string {
  const cookies = request.headers.get("cookie") || "";
  for (const item of cookies.split(";")) {
    const [name, ...parts] = item.trim().split("=");
    if (name === SESSION_COOKIE) return decodeURIComponent(parts.join("="));
  }
  return "";
}

export function runtimeOrNull(): MemoryRuntime | null { return getMemoryRuntime(); }

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host") || requestUrl.host;
    const protocol = request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(":", "");
    return originUrl.host === host && originUrl.protocol === `${protocol}:`;
  } catch {
    return false;
  }
}

export function enforceRateLimit(request: Request): boolean {
  const token = tokenFromRequest(request) || request.headers.get("x-forwarded-for") || "anonymous";
  const key = createHash("sha256").update("memory-rate").update(token).digest("hex");
  const current = Date.now();
  const existing = windows.get(key);
  if (!existing || current - existing.startedAt >= 60_000) {
    windows.set(key, { startedAt: current, count: 1 });
    return true;
  }
  existing.count += 1;
  return existing.count <= MEMORY_LIMITS.requestsPerMinute;
}

export async function readJsonObject(request: Request): Promise<Readonly<Record<string, unknown>>> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") throw new Error("Request content type is invalid.");
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MEMORY_LIMITS.apiBodyBytes) throw new Error("Request body is too large.");
  const raw = await request.text();
  if (Buffer.byteLength(raw) > MEMORY_LIMITS.apiBodyBytes) throw new Error("Request body is too large.");
  const parsed: unknown = raw ? JSON.parse(raw) : {};
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Request body is invalid.");
  return parsed as Record<string, unknown>;
}

export function assertAllowedFields(
  value: Readonly<Record<string, unknown>>,
  allowedFields: readonly string[]
): void {
  const allowed = new Set(allowedFields);
  const unexpected = Object.keys(value).filter((key) => !allowed.has(key));
  if (unexpected.length) throw new Error("Request contains unsupported fields.");
}

export async function authorizeRead(request: Request, runtime: MemoryRuntime): Promise<AuthorizationContext> {
  const session = await runtime.identity.authenticate(tokenFromRequest(request));
  return Object.freeze({ user: session.user, sessionId: session.id });
}

export async function authorizeMutation(request: Request, runtime: MemoryRuntime): Promise<AuthorizationContext> {
  if (!sameOrigin(request)) throw new Error("Request verification failed.");
  return runtime.identity.authorizeMutation(tokenFromRequest(request), request.headers.get("x-teoyube-csrf") || "");
}

export function sessionToken(request: Request): string { return tokenFromRequest(request); }

export function purposeId(value: unknown): PurposeId {
  if (typeof value !== "string" || !(value in MEMORY_PURPOSE_REGISTRY)) throw new Error("Purpose is invalid.");
  return value as PurposeId;
}

export function safeApiError(error: unknown): Response {
  const message = error instanceof Error && /limit|too large|conflict|consent|approval|eligible|unavailable|verification|required/i.test(error.message)
    ? error.message
    : "The request could not be completed.";
  const rateLimited = /request limit was reached/i.test(message);
  const status = /Authentication required/.test(message) ? 401 : /verification|consent|approval|eligible/.test(message) ? 403 : rateLimited ? 429 : /too large/.test(message) ? 413 : /conflict/.test(message) ? 409 : 400;
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "cache-control": "no-store",
        ...(rateLimited ? { "retry-after": "60" } : {})
      }
    }
  );
}

export function disabledResponse(): Response {
  return Response.json({ error: "Durable memory is disabled for this preview environment." }, { status: 503, headers: { "cache-control": "no-store" } });
}
