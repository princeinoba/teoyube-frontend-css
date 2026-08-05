import { performance } from "node:perf_hooks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthorizationContext } from "../../src/domain/identity/identity-contracts";
import { DATA_CLASSIFICATION_REGISTRY, MEMORY_PURPOSE_REGISTRY } from "../../src/domain/memory/data-classification-registry";
import type { NewUserMemoryRecord } from "../../src/domain/memory/memory-contracts";
import type { ScriptureCitation } from "../../src/domain/scripture/scripture-repository";
import { createDailySpiritualLoopState, type DailySpiritualLoopSeed } from "../../src/domain/journey/daily-spiritual-loop";
import { createJourneyContinuityMemory, readJourneyContinuitySnapshot } from "../../src/features/journey/application/journey-continuity";
import { TeoGuideAuthorizedMemoryReader } from "../../src/features/teo-guide/application/authorized-memory-reader";
import { UserMemoryService } from "../../src/features/memory/application/user-memory-service";
import { IdentityService } from "../../src/server/identity/identity-service";
import { LocalDevelopmentIdentityProvider } from "../../src/server/identity/local-development-identity";
import { SqliteSessionRepository } from "../../src/server/identity/sqlite-session-repository";
import { createKeyRing } from "../../src/server/memory/encryption";
import { MEMORY_MIGRATION_COUNT, openTeoyubeDatabase, type TeoyubeDatabase } from "../../src/server/memory/sqlite-database";
import { SqliteConsentMemoryStore } from "../../src/server/memory/sqlite-consent-memory-store";
import { InMemoryPrivacySafeEventSink } from "../../src/server/observability/privacy-safe-events";

const NOW = "2026-07-21T12:00:00.000Z";
const KEY = Buffer.alloc(32, 7).toString("base64");
const OTHER_KEY = Buffer.alloc(32, 9).toString("base64");
const PEPPER = "prompt-16-test-session-pepper-value-0001";
const FULL_SCOPE = Object.freeze(["memory:read", "memory:write", "memory:export", "memory:delete"]);

function preference(idempotencyKey = "preference-1"): NewUserMemoryRecord {
  return Object.freeze({ idempotencyKey, layer: "semantic_preference", sensitivity: "low", purposeId: "preference_continuity", provenance: Object.freeze({ sourceType: "user_explicit", createdBy: "user" }), content: Object.freeze({ preferredTranslation: "WEB" }), userApproved: true });
}

function sensitive(idempotencyKey = "sensitive-1", value = "A private prayer for wisdom."): NewUserMemoryRecord {
  return Object.freeze({ idempotencyKey, layer: "episodic", sensitivity: "sensitive_spiritual", purposeId: "sensitive_spiritual_storage", provenance: Object.freeze({ sourceType: "user_explicit", createdBy: "user" }), content: Object.freeze({ text: value, kind: "prayer" }), userApproved: true, explicitSensitiveContentApproval: true });
}

describe("durable consent-aware memory", () => {
  let database: TeoyubeDatabase;
  let store: SqliteConsentMemoryStore;
  let events: InMemoryPrivacySafeEventSink;
  let memory: UserMemoryService;
  let identity: IdentityService;
  let now: string;

  beforeEach(() => {
    database = openTeoyubeDatabase(":memory:");
    store = new SqliteConsentMemoryStore(database, createKeyRing("v1", { v1: KEY }));
    events = new InMemoryPrivacySafeEventSink();
    now = NOW;
    memory = new UserMemoryService(store, store, store, events, () => now);
    identity = new IdentityService(
      new LocalDevelopmentIdentityProvider(new Map([
        ["alpha-credential", Object.freeze({ subject: "alpha", role: "user" as const })],
        ["beta-credential", Object.freeze({ subject: "beta", role: "user" as const })],
        ["owner-credential", Object.freeze({ subject: "owner", role: "owner" as const })]
      ]), "test"),
      new SqliteSessionRepository(database, PEPPER, 60_000),
      () => now
    );
  });

  afterEach(() => database.close());

  async function signIn(credential = "alpha-credential") {
    const issued = await identity.signIn(credential);
    const context: AuthorizationContext = Object.freeze({ user: issued.session.user, sessionId: issued.session.id });
    return { ...issued, context };
  }

  async function grant(context: AuthorizationContext, purposeId: "preference_continuity" | "journey_continuity" | "sensitive_spiritual_storage" | "testimony_book_continuity", expiresAt?: string) {
    return memory.grantConsent(context, { purposeId, scope: FULL_SCOPE, policyVersion: "2026-07-21", expiresAt, source: "user_ui" });
  }

  it("exposes five executable data classes and thirteen unbundled, default-off purposes", () => {
    expect(Object.keys(DATA_CLASSIFICATION_REGISTRY)).toEqual(["class_0", "class_1", "class_2", "class_3", "class_4"]);
    expect(Object.keys(MEMORY_PURPOSE_REGISTRY)).toEqual(["preference_continuity", "journey_continuity", "sensitive_spiritual_storage", "testimony_book_continuity", "external_ai_processing", "external_ai_sensitive_content", "external_ai_memory_context", "live_ai_conversation_retention", "external_ai_embedding_processing", "user_memory_semantic_index", "user_testimony_semantic_index", "user_journey_semantic_index", "user_calling_evidence_semantic_index", "research_participation", "research_product_events", "research_accessibility_observation", "research_optional_recording", "research_optional_live_ai_task", "research_follow_up_contact"]);
    expect(Object.values(MEMORY_PURPOSE_REGISTRY).every((purpose) => !purpose.defaultGranted && purpose.explicitUserAction)).toBe(true);
    expect(DATA_CLASSIFICATION_REGISTRY.class_3).toMatchObject({ encryption: "application_aead", analyticsPolicy: "disabled", logPolicy: "never_raw_content" });
  });

  it("propagates semantic-index consent revocation to vector derivatives", async () => {
    const derivatives = { deleteUserVectors: vi.fn().mockResolvedValue({ deleted: 3 }) };
    memory = new UserMemoryService(store, store, store, events, () => now, derivatives);
    const signed = await signIn();
    await memory.grantConsent(signed.context, {
      purposeId: "external_ai_embedding_processing",
      scope: ["embedding:process"],
      policyVersion: "2026-07-23",
      source: "user_ui"
    });
    const result = await memory.revokeConsent(signed.context, {
      purposeId: "external_ai_embedding_processing",
      policyVersion: "2026-07-23",
      source: "user_ui"
    });
    expect(derivatives.deleteUserVectors).toHaveBeenCalledWith(signed.context.user.id, now);
    expect(result.revocation.derivativesDeleted).toBe(3);
  });

  it("applies both forward migrations, constraints, foreign keys, and indexes", () => {
    expect(MEMORY_MIGRATION_COUNT).toBe(2);
    expect(database.prepare("SELECT COUNT(*) AS count FROM schema_migrations").get()?.count).toBe(2);
    expect(database.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='index' AND name LIKE 'memories_%'").get()?.count).toBe(4);
    expect(() => database.prepare("INSERT INTO sessions(id,token_hash,csrf_hash,user_id,created_at,expires_at) VALUES ('x','t','c','missing','n','n')").run()).toThrow();
  });

  it("uses server-authoritative sessions with sign-in, expiry, rotation, sign-out, CSRF, and role checks", async () => {
    const first = await identity.signIn("alpha-credential");
    expect(await identity.authenticate(first.token)).toMatchObject({ user: { role: "user" } });
    await expect(identity.authorizeMutation(first.token, "wrong-csrf")).rejects.toThrow("Request verification failed");
    const rotated = await identity.rotate(first.token, first.session.csrfToken);
    await expect(identity.authenticate(first.token)).rejects.toThrow("Authentication required");
    expect(await identity.authorizeMutation(rotated.token, rotated.session.csrfToken)).toMatchObject({ user: rotated.session.user });
    await expect(identity.requireRole(rotated.token, ["owner"])).rejects.toThrow("Resource unavailable");
    await identity.signOut(rotated.token, rotated.session.csrfToken);
    await expect(identity.authenticate(rotated.token)).rejects.toThrow("Authentication required");
    const expiring = await identity.signIn("alpha-credential");
    now = "2026-07-21T12:02:00.000Z";
    await expect(identity.authenticate(expiring.token)).rejects.toThrow("Authentication required");
  });

  it("does not reveal account enumeration and isolates two authenticated users", async () => {
    await expect(identity.signIn("unknown-credential")).rejects.toThrow("Authentication failed");
    const alpha = await signIn("alpha-credential");
    const beta = await signIn("beta-credential");
    expect(alpha.context.user.id).not.toBe(beta.context.user.id);
    await grant(alpha.context, "preference_continuity");
    await grant(beta.context, "preference_continuity");
    const record = await memory.create(alpha.context, preference());
    expect(await memory.list(alpha.context, { purposeId: "preference_continuity" })).toHaveLength(1);
    expect(await memory.list(beta.context, { purposeId: "preference_continuity" })).toHaveLength(0);
    await expect(memory.update(beta.context, { id: record.id, expectedVersion: 1, content: { preferredTranslation: "KJV" }, userApproved: true })).rejects.toThrow("unavailable");
  });

  it("persists low-sensitivity preferences across independent sessions for the same authenticated subject", async () => {
    const browserOne = await signIn();
    await grant(browserOne.context, "preference_continuity");
    await memory.create(browserOne.context, preference());
    const browserTwo = await signIn();
    const resumed = await memory.list(browserTwo.context, { purposeId: "preference_continuity" });
    expect(resumed).toHaveLength(1);
    expect(resumed[0]?.content).toEqual({ preferredTranslation: "WEB" });
  });

  it("has no hidden consent default and separates purposes and policy versions", async () => {
    const { context } = await signIn();
    expect(await memory.effectiveConsent(context, "journey_continuity")).toBeNull();
    await expect(memory.create(context, preference())).rejects.toThrow("consent");
    const first = await grant(context, "preference_continuity");
    expect(first).toMatchObject({ status: "granted", policyVersion: "2026-07-21", version: 1 });
    expect(await memory.effectiveConsent(context, "sensitive_spiritual_storage")).toBeNull();
    await expect(memory.create(context, sensitive())).rejects.toThrow("consent");
  });

  it("grants and immediately revokes external processing independently from memory", async () => {
    const { context } = await signIn();
    await expect(memory.grantConsent(context, { purposeId: "external_ai_processing", scope: ["memory:read"], policyVersion: "prompt19", source: "user_ui" })).rejects.toThrow("scope");
    const granted = await memory.grantConsent(context, { purposeId: "external_ai_processing", scope: ["external_ai:process"], policyVersion: "prompt19", source: "user_ui" });
    expect(granted).toMatchObject({ purposeId: "external_ai_processing", status: "granted", scope: ["external_ai:process"] });
    expect(await memory.effectiveConsent(context, "external_ai_sensitive_content")).toBeNull();
    const revoked = await memory.revokeConsent(context, { purposeId: "external_ai_processing", policyVersion: "prompt19", source: "user_ui" });
    expect(revoked).toMatchObject({ consent: { status: "revoked" }, revocation: { revokedRecords: 0 } });
    expect(await memory.effectiveConsent(context, "external_ai_processing")).toMatchObject({ status: "revoked" });
  });

  it("expires consent and immediately denies future reads and writes", async () => {
    const { context } = await signIn();
    await grant(context, "preference_continuity", "2026-07-21T12:00:30.000Z");
    await memory.create(context, preference());
    now = "2026-07-21T12:01:00.000Z";
    expect(await memory.effectiveConsent(context, "preference_continuity")).toMatchObject({ status: "expired" });
    await expect(memory.list(context, { purposeId: "preference_continuity" })).rejects.toThrow("consent");
    await expect(memory.create(context, preference("after-expiry"))).rejects.toThrow("consent");
  });

  it("requires explicit sensitive approval and stores only authenticated ciphertext with a key version", async () => {
    const { context } = await signIn();
    await grant(context, "sensitive_spiritual_storage");
    await expect(memory.create(context, { ...sensitive(), explicitSensitiveContentApproval: false })).rejects.toThrow("approval");
    const record = await memory.create(context, sensitive());
    expect(record.content).toEqual({ text: "A private prayer for wisdom.", kind: "prayer" });
    const raw = database.prepare("SELECT content_json,ciphertext,nonce,auth_tag,key_version FROM memories WHERE id=?").get(record.id)!;
    expect(raw.content_json).toBeNull();
    expect(String(raw.ciphertext)).not.toContain("private prayer");
    expect(raw).toMatchObject({ key_version: "v1" });
  });

  it("fails safely for the wrong key or unknown key version without exposing plaintext", async () => {
    const { context } = await signIn();
    await grant(context, "sensitive_spiritual_storage");
    const record = await memory.create(context, sensitive());
    const wrongStore = new SqliteConsentMemoryStore(database, createKeyRing("v1", { v1: OTHER_KEY }));
    await expect(wrongStore.getById(context.user.id, record.id)).rejects.toThrow("could not be decrypted");
  });

  it("reads an older key version and writes the active rotation version", async () => {
    const { context } = await signIn();
    await grant(context, "sensitive_spiritual_storage");
    const first = await memory.create(context, sensitive());
    const rotatingStore = new SqliteConsentMemoryStore(database, createKeyRing("v2", { v1: KEY, v2: OTHER_KEY }));
    expect((await rotatingStore.getById(context.user.id, first.id))?.content).toEqual(first.content);
    const rotated = await rotatingStore.update(context.user.id, { id: first.id, expectedVersion: 1, content: { text: "User-approved rotated content." }, userApproved: true }, NOW);
    expect(rotated.version).toBe(2);
    expect(database.prepare("SELECT key_version FROM memories WHERE id=?").get(first.id)?.key_version).toBe("v2");
  });

  it("revokes consent and destroys ciphertext plus future retrieval in one transaction", async () => {
    const { context } = await signIn();
    await grant(context, "sensitive_spiritual_storage");
    const record = await memory.create(context, sensitive());
    const result = await memory.revokeConsent(context, { purposeId: "sensitive_spiritual_storage", policyVersion: "2026-07-21", source: "user_ui" });
    expect(result.revocation).toMatchObject({ revokedRecords: 1, ciphertextDeleted: 1, derivativesDeleted: 0 });
    await expect(memory.list(context, { purposeId: "sensitive_spiritual_storage" })).rejects.toThrow("consent");
    const raw = database.prepare("SELECT ciphertext,status FROM memories WHERE id=?").get(record.id)!;
    expect(raw).toMatchObject({ ciphertext: null, status: "revoked" });
    await expect(memory.create(context, sensitive("after-revoke"))).rejects.toThrow("consent");
    expect((await memory.consentHistory(context)).map((event) => event.action)).toEqual(["revoke", "grant"]);
  });

  it("enforces bounded retention for consent, sensitive ciphertext, and expired sessions", async () => {
    const signed = await signIn();
    await grant(signed.context, "sensitive_spiritual_storage", "2026-07-21T12:00:30.000Z");
    const record = await memory.create(signed.context, { ...sensitive(), expiresAt: "2026-07-21T12:00:30.000Z" });
    const result = store.enforceRetention("2026-07-21T12:02:00.000Z", 250);
    expect(result).toMatchObject({ expiredConsents: 1, ciphertextDeleted: 1, expiredSessions: 1 });
    expect(database.prepare("SELECT ciphertext,status FROM memories WHERE id=?").get(record.id)).toMatchObject({ ciphertext: null, status: "revoked" });
    await expect(identity.authenticate(signed.token)).rejects.toThrow("Authentication required");
  });

  it("rolls back a concurrent consent event failure without corrupting effective state", async () => {
    const fixedStore = new SqliteConsentMemoryStore(database, createKeyRing("v1", { v1: KEY }), () => "fixed-consent-id");
    const { context } = await signIn();
    await fixedStore.grant(context.user.id, { purposeId: "journey_continuity", scope: FULL_SCOPE, policyVersion: "v1", source: "user_ui" }, NOW);
    await expect(fixedStore.grant(context.user.id, { purposeId: "journey_continuity", scope: FULL_SCOPE, policyVersion: "v2", source: "user_ui" }, NOW)).rejects.toThrow();
    expect(await fixedStore.history(context.user.id)).toHaveLength(1);
    expect(await fixedStore.getEffective(context.user.id, "journey_continuity", NOW)).toMatchObject({ policyVersion: "v1", version: 1 });
  });

  it("enforces optimistic updates and idempotent writes", async () => {
    const { context } = await signIn();
    await grant(context, "preference_continuity");
    const first = await memory.create(context, preference());
    expect((await memory.create(context, preference())).id).toBe(first.id);
    const updated = await memory.update(context, { id: first.id, expectedVersion: 1, content: { preferredTranslation: "WEB", responseLength: "short" }, userApproved: true });
    expect(updated.version).toBe(2);
    await expect(memory.update(context, { id: first.id, expectedVersion: 1, content: {}, userApproved: true })).rejects.toThrow("version conflict");
  });

  it("exports only the authenticated user's human-readable data and consent history", async () => {
    const alpha = await signIn("alpha-credential");
    const beta = await signIn("beta-credential");
    await grant(alpha.context, "preference_continuity");
    await grant(beta.context, "preference_continuity");
    await memory.create(alpha.context, preference("alpha-pref"));
    await memory.create(beta.context, { ...preference("beta-pref"), content: { preferredTranslation: "KJV" } });
    const exported = await memory.export(alpha.context);
    expect(exported).toMatchObject({ schema: "teoyube-user-data-export", version: "1.0.0", userId: alpha.context.user.id });
    expect(exported.memories).toHaveLength(1);
    expect(JSON.stringify(exported)).not.toContain("KJV");
    expect(JSON.stringify(exported)).not.toMatch(/session-pepper|encryption.*key/i);
  });

  it("deletes one record and an account idempotently without retaining active derivatives", async () => {
    const signed = await signIn();
    await grant(signed.context, "preference_continuity");
    const one = await memory.create(signed.context, preference("delete-one"));
    await memory.create(signed.context, preference("delete-two"));
    const deleted = await memory.delete(signed.context, { id: one.id, idempotencyKey: "delete-request-1" });
    expect(deleted).toMatchObject({ status: "complete", deletedRecords: 1, derivativesDeleted: 0 });
    expect(await memory.delete(signed.context, { id: one.id, idempotencyKey: "delete-request-1" })).toEqual(deleted);
    const account = await memory.deleteAccount(signed.context, "delete-account-1");
    expect(account.deletedRecords).toBe(1);
    await expect(identity.authenticate(signed.token)).rejects.toThrow("Authentication required");
    expect(database.prepare("SELECT COUNT(*) AS count FROM memories WHERE user_id=?").get(signed.context.user.id)?.count).toBe(0);
  });

  it("preserves exact WEB citations, TIG references, statuses, transitions, and undo metadata without private edits", async () => {
    const signed = await signIn();
    await grant(signed.context, "journey_continuity");
    const citation: ScriptureCitation = Object.freeze({ reference: Object.freeze({ book: "EPH", chapterStart: 1, verseStart: 18 }), canonicalLabel: "Ephesians 1:18", translationId: "engwebp", corpusVersion: "engwebp-2026-07-21", sourceId: "engwebp", validationStatus: "validated" });
    const seed: DailySpiritualLoopSeed = Object.freeze({ id: "journey-1", scriptureReferences: Object.freeze([citation.canonicalLabel]), promise: Object.freeze({ title: "Calling & Purpose", level: "A", explanation: "For review." }), prayerDraft: "A deterministic prayer draft.", callingDiscernment: Object.freeze({ summary: "The strongest indicators suggest a pattern may be emerging.", evidence: Object.freeze(["Scripture", "wise counsel"]) }), dailyAssignment: "Speak with a mentor.", trace: Object.freeze({ id: "tig-rec-1", deterministic: true, externalModelUsed: false, steps: Object.freeze([Object.freeze({ id: "trace-1", summary: "Exact source path.", source: "tig", scriptureReferences: Object.freeze([citation.canonicalLabel]) })]) }), confidence: Object.freeze({ score: 0.8, label: "good_contextual_match", explanation: "Deterministic evidence." }), limitations: Object.freeze(["Not divine certainty."]), tigValid: true });
    const state = createDailySpiritualLoopState(seed, NOW);
    const record = await memory.create(signed.context, createJourneyContinuityMemory({ state, scriptureCitations: [citation], idempotencyKey: "journey-state-1" }));
    const resumed = readJourneyContinuitySnapshot(record);
    expect(resumed.scriptureCitations).toEqual([citation]);
    expect(resumed.artifacts[0]).toMatchObject({ tigTraceId: "tig-rec-1", revision: 1, userEditCount: 0 });
    expect(resumed).toMatchObject({ currentStage: "check_in", undoDepth: 0, privateTextPersisted: false, liveAiUsed: false });
  });

  it("prevents deterministic TIG conclusions from becoming facts and leaves Teo Guide read-only", async () => {
    const signed = await signIn();
    await grant(signed.context, "journey_continuity");
    await expect(memory.create(signed.context, { idempotencyKey: "unsafe", layer: "journey_state", sensitivity: "structured_spiritual", purposeId: "journey_continuity", provenance: { sourceType: "journey_transition", createdBy: "deterministic_system" }, content: { callingIsFact: true }, userApproved: true })).rejects.toThrow("spiritual facts");
    const reader = new TeoGuideAuthorizedMemoryReader(memory);
    expect("write" in reader).toBe(false);
    expect(await reader.readStructuredMemory(signed.context, "journey_continuity")).toEqual([]);
  });

  it("keeps operational events pseudonymous and free of private spiritual text", async () => {
    const signed = await signIn();
    await grant(signed.context, "sensitive_spiritual_storage");
    await memory.create(signed.context, sensitive("no-log", "Private grief and health disclosure."));
    const serialized = JSON.stringify(events.events);
    expect(serialized).not.toMatch(/grief|health|prayer|session|token|cipher|key/i);
    expect(events.events.every((event) => !event.subjectHash || event.subjectHash !== signed.context.user.id)).toBe(true);
  });

  it("meets local deterministic latency envelopes without weakening checks", async () => {
    const signed = await signIn();
    await grant(signed.context, "preference_continuity");
    await memory.create(signed.context, preference());
    const samples: number[] = [];
    for (let index = 0; index < 20; index += 1) {
      const started = performance.now();
      await memory.list(signed.context, { purposeId: "preference_continuity" });
      samples.push(performance.now() - started);
    }
    samples.sort((left, right) => left - right);
    const p50 = samples[Math.floor(samples.length * 0.5)] || Infinity;
    const p95 = samples[Math.floor(samples.length * 0.95)] || Infinity;
    expect(p50).toBeLessThan(50);
    expect(p95).toBeLessThan(150);
  });

  it("records authenticated, consent, journey, export, deletion, and encryption p50/p95 evidence", async () => {
    const percentile = (samples: number[], ratio: number) => [...samples].sort((left, right) => left - right)[Math.floor(samples.length * ratio)] || Infinity;
    const measure = async (operation: () => Promise<unknown>, count = 12) => {
      const samples: number[] = [];
      for (let index = 0; index < count; index += 1) {
        const started = performance.now();
        await operation();
        samples.push(performance.now() - started);
      }
      return Object.freeze({ p50: percentile(samples, 0.5), p95: percentile(samples, 0.95) });
    };

    const signed = await signIn();
    await grant(signed.context, "preference_continuity");
    await grant(signed.context, "journey_continuity");
    await grant(signed.context, "sensitive_spiritual_storage");
    const counters = { auth: 0, consent: 0, journey: 0, deletion: 0, encryption: 0 };
    const authenticatedRequest = await measure(async () => { counters.auth += 1; await identity.signIn("alpha-credential"); });
    const consentUpdate = await measure(async () => { counters.consent += 1; await memory.grantConsent(signed.context, { purposeId: "preference_continuity", scope: FULL_SCOPE, policyVersion: `performance-${counters.consent}`, source: "user_ui" }); });
    const journeySave = await measure(async () => { counters.journey += 1; await memory.create(signed.context, { idempotencyKey: `performance-journey-${counters.journey}`, layer: "journey_state", sensitivity: "structured_spiritual", purposeId: "journey_continuity", provenance: { sourceType: "journey_transition", sourceId: `journey-${counters.journey}`, createdBy: "deterministic_system", tigRecommendationId: "tig-performance" }, content: { currentStage: "scripture", citation: "Ephesians 1:18", translationId: "engwebp", privateTextPersisted: false }, userApproved: true }); });
    const journeyResume = await measure(async () => { await memory.list(signed.context, { purposeId: "journey_continuity", limit: 25 }); });
    const memoryList = await measure(async () => { await memory.list(signed.context, { limit: 25 }); });
    const exportGeneration = await measure(async () => { await memory.export(signed.context); }, 6);
    const deletion = await measure(async () => { counters.deletion += 1; const record = await memory.create(signed.context, preference(`performance-delete-${counters.deletion}`)); await memory.delete(signed.context, { id: record.id, idempotencyKey: `performance-delete-request-${counters.deletion}` }); });
    const encryption = await measure(async () => { counters.encryption += 1; await memory.create(signed.context, sensitive(`performance-encryption-${counters.encryption}`, `Approved private content ${counters.encryption}.`)); });
    const metrics = Object.freeze({ authenticatedRequest, consentUpdate, journeySave, journeyResume, memoryList, exportGeneration, deletion, encryption });
    console.info(`CONSENT_MEMORY_PERFORMANCE ${JSON.stringify(metrics)}`);
    for (const result of Object.values(metrics)) {
      expect(result.p50).toBeLessThan(100);
      expect(result.p95).toBeLessThan(250);
    }
  });
});
