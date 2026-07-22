import type { AuthorizationContext } from "../../domain/identity/identity-contracts";
import type { ConsentGrant, PurposeId, UserMemoryRecord } from "../../domain/memory/memory-contracts";
import type { TeoGuideContext } from "../../domain/teo-guide/orchestration-contracts";
import { authorizeRead, runtimeOrNull } from "../http/memory-route-helpers";

const PURPOSES: readonly PurposeId[] = Object.freeze([
  "preference_continuity",
  "journey_continuity",
  "sensitive_spiritual_storage",
  "testimony_book_continuity"
]);

function stringField(record: UserMemoryRecord, field: string): string | undefined {
  const value = record.content[field];
  return typeof value === "string" ? value : undefined;
}

function numberField(record: UserMemoryRecord, field: string): number | undefined {
  const value = record.content[field];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringListField(record: UserMemoryRecord, field: string): readonly string[] {
  const value = record.content[field];
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? Object.freeze([...value]) : Object.freeze([]);
}

async function optionalAuthorization(request: Request): Promise<Readonly<{ authorization?: AuthorizationContext; consents: readonly ConsentGrant[]; journey?: TeoGuideContext["currentJourney"] }>> {
  const runtime = runtimeOrNull();
  if (!runtime) return Object.freeze({ consents: Object.freeze([]) });
  let authorization: AuthorizationContext;
  try {
    authorization = await authorizeRead(request, runtime);
  } catch {
    return Object.freeze({ consents: Object.freeze([]) });
  }
  const grants = await Promise.all(PURPOSES.map((purpose) => runtime.memory.effectiveConsent(authorization, purpose)));
  const consents = Object.freeze(grants.filter((grant): grant is ConsentGrant => Boolean(grant)));
  let journey: TeoGuideContext["currentJourney"];
  if (consents.some((grant) => grant.purposeId === "journey_continuity" && grant.status === "granted" && (grant.scope.includes("memory:read") || grant.scope.includes("memory:*")))) {
    const records = await runtime.memory.list(authorization, { purposeId: "journey_continuity", layer: "journey_state", limit: 1 });
    const record = records[0];
    if (record) {
      journey = Object.freeze({
        journeyId: stringField(record, "journeyId") || record.id,
        stage: stringField(record, "stage") || "unknown",
        revision: numberField(record, "revision") || record.version,
        scriptureReferences: stringListField(record, "scriptureReferences"),
        status: stringField(record, "status") === "completed" ? "completed" : "active"
      });
    }
  }
  return Object.freeze({ authorization, consents, ...(journey ? { journey } : {}) });
}

export async function createTeoGuideContextFromRequest(request: Request, input: Readonly<{ conversationId: string; locale: string }>): Promise<TeoGuideContext> {
  const identity = await optionalAuthorization(request);
  return Object.freeze({
    conversationId: input.conversationId,
    route: "/teo-guide",
    locale: input.locale,
    now: new Date().toISOString(),
    ...(identity.authorization ? { authorization: identity.authorization } : {}),
    effectiveConsents: identity.consents,
    turns: Object.freeze([]),
    ...(identity.journey ? { currentJourney: identity.journey } : {})
  });
}
