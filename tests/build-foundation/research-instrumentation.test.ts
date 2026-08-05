import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createKeyRing } from "../../src/server/memory/encryption";
import {
  ResearchBoundaryError,
  type RecordResearchEventCommand,
  type ResearchEventRepository
} from "../../src/domain/research/research-contracts";
import {
  RESEARCH_EVENT_COUNT,
  listResearchEventDefinitions
} from "../../src/domain/research/research-event-registry";
import {
  assertNoProhibitedResearchData,
  validateRecordResearchEventCommand
} from "../../src/domain/research/research-event-validator";
import {
  EncryptedFileResearchEventRepository,
  InMemoryResearchConsentReader,
  InMemoryResearchEventRepository,
  InMemoryResearchOperationalSink,
  NullResearchOperationalSink,
  ResearchActionObserver,
  ResearchEventService,
  ResearchSessionEnvelopeService,
  readResearchRuntimeConfiguration,
  verifyResearchEventHash
} from "../../src/server/research";

const NOW = "2026-08-04T18:00:00.000Z";
const LATER = "2026-08-04T18:30:00.000Z";
const EXPIRY = "2026-08-04T19:00:00.000Z";
const key = new Uint8Array(32).fill(7);

type Fixture = ReturnType<typeof createFixture>;

function createFixture(options?: Readonly<{ enabled?: boolean; repository?: ResearchEventRepository; cohort?: "synthetic_ordinary" | "synthetic_expert"; participantId?: `synthetic-${string}` }>) {
  const consent = new InMemoryResearchConsentReader();
  const participantId = options?.participantId ?? "synthetic-participant-001";
  consent.set(participantId, "research_participation", true, "consent-participation");
  consent.set(participantId, "research_product_events", true, "consent-events");
  const envelope = new ResearchSessionEnvelopeService(key, "research-key-1", () => NOW);
  const token = envelope.issueSynthetic({
    studyId: "teoyube-phase4b-synthetic",
    participantId,
    sessionId: "synthetic-session-001",
    issuedAt: NOW,
    expiresAt: EXPIRY,
    allowedTaskIds: [
      "orientation", "scripture-boundary", "action-reversibility", "calling-boundary",
      "testimony-boundary", "memory-consent", "teo-guide", "retrieval-continuity",
      "accessibility", "safety-stop", "session-close"
    ],
    consentRecordIds: {
      research_participation: "consent-participation",
      research_product_events: "consent-events",
      research_accessibility_observation: "consent-accessibility",
      research_optional_live_ai_task: "consent-live-ai",
      external_ai_processing: "consent-external-ai"
    },
    recordingAllowed: false,
    liveAiTaskAllowed: true,
    accessibilityObservationAllowed: true,
    cohort: options?.cohort ?? "synthetic_ordinary"
  });
  const repository = options?.repository ?? new InMemoryResearchEventRepository();
  const operational = new InMemoryResearchOperationalSink();
  const service = new ResearchEventService(
    Object.freeze({ enabled: options?.enabled ?? true, studyId: "teoyube-phase4b-synthetic", studyAllowed: true, syntheticOnly: true }),
    envelope,
    consent,
    repository,
    operational,
    () => LATER
  );
  return { participantId, consent, envelope, token, repository, operational, service };
}

function command(fixture: Fixture, overrides: Partial<RecordResearchEventCommand> = {}): RecordResearchEventCommand {
  const eventName = overrides.eventName ?? "research_source_inspected";
  const isRating = eventName === "research_clarity_rating_recorded" || eventName === "research_trust_rating_recorded";
  return Object.freeze({
    envelopeToken: fixture.token,
    eventId: overrides.eventId ?? "event-001",
    eventName,
    taskId: overrides.taskId ?? "scripture-boundary",
    timestamp: overrides.timestamp ?? LATER,
    route: overrides.route ?? "search",
    capability: overrides.capability ?? "source-inspection",
    result: overrides.result ?? "success",
    completionStatus: overrides.completionStatus ?? "completed",
    moderatorRescueCount: overrides.moderatorRescueCount ?? 0,
    safeIssueCode: overrides.safeIssueCode ?? null,
    sourceIds: overrides.sourceIds ?? ["WEB:Ephesians.1.18"],
    scenarioId: overrides.scenarioId ?? "scenario-orientation-01",
    accessibilityMode: overrides.accessibilityMode ?? "not_volunteered",
    rating: overrides.rating === undefined ? (isRating ? 4 : null) : overrides.rating,
    durationBucket: overrides.durationBucket ?? "30s_to_2m"
  });
}

describe("Phase 4B research mode and consent", () => {
  it("defaults research mode off and exposes no study metadata", () => {
    expect(readResearchRuntimeConfiguration({})).toEqual({ enabled: false, studyId: null, studyAllowed: false, syntheticOnly: false });
  });

  it("mode off writes no event and emits no operational event", async () => {
    const fixture = createFixture({ enabled: false });
    await expect(fixture.service.recordSafely(command(fixture))).resolves.toEqual({ recorded: false, safeCode: "research_mode_disabled" });
    expect(await fixture.repository.list({ studyId: "teoyube-phase4b-synthetic" })).toHaveLength(0);
    expect(fixture.operational.events).toHaveLength(0);
  });

  it("mode on without an allowlisted study fails closed", () => {
    expect(readResearchRuntimeConfiguration({
      TEOYUBE_RESEARCH_MODE_ENABLED: "true",
      TEOYUBE_RESEARCH_STUDY_ID: "unknown-study"
    })).toEqual({ enabled: true, studyId: "unknown-study", studyAllowed: false, syntheticOnly: false });
  });

  it("requires separate participation and product-event consent", async () => {
    const fixture = createFixture();
    fixture.consent.set(fixture.participantId, "research_product_events", false);
    await expect(fixture.service.record(command(fixture))).rejects.toMatchObject({ safeCode: "research_consent_missing_research_product_events" });
  });

  it("blocks future events immediately after consent revocation", async () => {
    const fixture = createFixture();
    await fixture.service.record(command(fixture));
    fixture.consent.set(fixture.participantId, "research_product_events", false);
    await expect(fixture.service.record(command(fixture, { eventId: "event-002" }))).rejects.toMatchObject({ safeCode: "research_consent_missing_research_product_events" });
  });

  it("requires research and existing external-AI consent for live-AI tasks", async () => {
    const fixture = createFixture();
    fixture.consent.set(fixture.participantId, "research_optional_live_ai_task", true, "consent-live-ai");
    await expect(fixture.service.record(command(fixture, {
      eventId: "event-live",
      eventName: "research_live_ai_task_completed",
      taskId: "teo-guide",
      capability: "teo-guide-live"
    }))).rejects.toMatchObject({ safeCode: "research_consent_missing_external_ai_processing" });
    fixture.consent.set(fixture.participantId, "external_ai_processing", true, "consent-external-ai");
    await expect(fixture.service.record(command(fixture, {
      eventId: "event-live",
      eventName: "research_live_ai_task_completed",
      taskId: "teo-guide",
      capability: "teo-guide-live"
    }))).resolves.toMatchObject({ eventName: "research_live_ai_task_completed" });
  });

  it("keeps optional recording independent from product-event collection", async () => {
    const fixture = createFixture();
    await expect(fixture.service.record(command(fixture))).resolves.toMatchObject({ eventName: "research_source_inspected" });
  });
});

describe("Phase 4B event schema and privacy", () => {
  it("registers and validates every one of the 66 allowed events", () => {
    expect(RESEARCH_EVENT_COUNT).toBe(66);
    const fixture = createFixture();
    for (const [index, definition] of listResearchEventDefinitions().entries()) {
      const isRating = definition.ratingRequired;
      expect(validateRecordResearchEventCommand(command(fixture, {
        eventId: `event-${String(index).padStart(3, "0")}`,
        eventName: definition.name,
        taskId: definition.group === "accessibility" ? "accessibility" : definition.group === "teo_guide_ai" ? "teo-guide" : "orientation",
        rating: isRating ? 3 : null,
        sourceIds: []
      })).eventName).toBe(definition.name);
    }
  });

  it("rejects unknown events and unknown fields", () => {
    const fixture = createFixture();
    expect(() => validateRecordResearchEventCommand(command(fixture, { eventName: "research_every_click" }))).toThrowError(ResearchBoundaryError);
    expect(() => validateRecordResearchEventCommand({ ...command(fixture), arbitrary: true })).toThrowError(/research_unknown_field/);
  });

  it.each(["prayerText", "journalText", "reflectionText", "testimonyText", "scriptureText", "holinessScore", "faithScore", "spiritualRank", "divineFavor"])(
    "rejects prohibited field %s at any nesting depth",
    (field) => expect(() => assertNoProhibitedResearchData({ safe: { nested: { [field]: "blocked" } } })).toThrowError(/research_prohibited_field/)
  );

  it.each([
    "person@example.com", "+1 (416) 555-0199", "sk-proj-abcdefghijklmnop", "Bearer abcdefghijklmnopqrstuvwxyz",
    "43.6532,-79.3832", "raw\nmultiline content"
  ])("rejects prohibited value pattern without retaining it", (value) => {
    expect(() => assertNoProhibitedResearchData({ safeIssueCode: value })).toThrowError(/research_prohibited_value/);
  });

  it("rejects free-form notes and raw search input", () => {
    const fixture = createFixture();
    expect(() => validateRecordResearchEventCommand({ ...command(fixture), notes: "private" })).toThrowError(/research_prohibited_field/);
    expect(() => validateRecordResearchEventCommand({ ...command(fixture), rawQuery: "purpose" })).toThrowError(/research_prohibited_field/);
  });

  it("bounds clarity and trust ratings to the defined 1-5 scale", () => {
    const fixture = createFixture();
    expect(() => validateRecordResearchEventCommand(command(fixture, { eventName: "research_clarity_rating_recorded", rating: 6 }))).toThrowError(/research_rating_invalid/);
    expect(validateRecordResearchEventCommand(command(fixture, { eventName: "research_trust_rating_recorded", rating: 5 })).rating).toBe(5);
  });
});

describe("Phase 4B session isolation and integrity", () => {
  it("rejects real participant IDs during Phase 4B", () => {
    const fixture = createFixture();
    expect(() => fixture.envelope.issueSynthetic({
      studyId: "teoyube-phase4b-synthetic",
      participantId: "synthetic-valid",
      sessionId: "synthetic-session",
      issuedAt: NOW,
      expiresAt: EXPIRY,
      allowedTaskIds: ["orientation"],
      consentRecordIds: {},
      recordingAllowed: false,
      liveAiTaskAllowed: false,
      accessibilityObservationAllowed: false,
      cohort: "synthetic_ordinary"
    })).not.toThrow();
    expect(() => fixture.envelope.issueSynthetic({
      studyId: "teoyube-phase4b-synthetic",
      participantId: "actual-person" as `synthetic-${string}`,
      sessionId: "synthetic-session",
      issuedAt: NOW,
      expiresAt: EXPIRY,
      allowedTaskIds: ["orientation"],
      consentRecordIds: {},
      recordingAllowed: false,
      liveAiTaskAllowed: false,
      accessibilityObservationAllowed: false,
      cohort: "synthetic_ordinary"
    })).toThrowError(/research_real_participant_not_authorized/);
  });

  it("rejects forged, expired, and revoked envelopes", () => {
    const fixture = createFixture();
    const [payload, signature] = fixture.token.split(".");
    const forgedSignature = `${signature[0] === "a" ? "b" : "a"}${signature.slice(1)}`;
    expect(() => fixture.envelope.verify(`${payload}.${forgedSignature}`, LATER)).toThrowError(/research_envelope_signature_invalid/);
    expect(() => fixture.envelope.verify(fixture.token, "2026-08-04T20:00:00.000Z")).toThrowError(/research_envelope_expired/);
    fixture.envelope.revoke(fixture.token);
    expect(() => fixture.envelope.verify(fixture.token, LATER)).toThrowError(/research_envelope_revoked/);
  });

  it("prevents one envelope from reading another participant", async () => {
    const first = createFixture();
    await first.service.record(command(first));
    const second = createFixture({ repository: first.repository, participantId: "synthetic-participant-002" });
    await second.service.record(command(second, { eventId: "event-002" }));
    const own = await second.service.listForEnvelope(second.token);
    expect(own).toHaveLength(1);
    expect(own.every((event) => event.participantId === second.participantId)).toBe(true);
  });

  it("rejects duplicate IDs and detects hash tampering", async () => {
    const fixture = createFixture();
    const record = await fixture.service.record(command(fixture));
    await expect(fixture.repository.append(record)).rejects.toMatchObject({ safeCode: "research_event_duplicate" });
    expect(verifyResearchEventHash({ ...record, result: "failure" })).toBe(false);
    expect(await fixture.repository.verifyIntegrity("teoyube-phase4b-synthetic")).toBe(true);
  });
});

describe("Phase 4B deletion, export, and storage", () => {
  it("deletes participant events idempotently and excludes them from regenerated export", async () => {
    const fixture = createFixture();
    await fixture.service.record(command(fixture));
    const first = await fixture.service.deleteParticipant(fixture.token);
    const second = await fixture.service.deleteParticipant(fixture.token);
    expect(first.deletedEvents).toBe(1);
    expect(second.idempotent).toBe(true);
    const exported = await fixture.repository.exportStudy("teoyube-phase4b-synthetic", "synthetic_ordinary", LATER);
    expect(exported.events).toHaveLength(0);
    expect(exported.participantIds).not.toContain(fixture.participantId);
    expect(exported.deletionStatus).toHaveLength(1);
    expect(JSON.stringify(exported.deletionStatus)).not.toContain(fixture.participantId);
  });

  it("keeps ordinary and expert cohort exports separate", async () => {
    const repository = new InMemoryResearchEventRepository();
    const ordinary = createFixture({ repository, cohort: "synthetic_ordinary" });
    const expert = createFixture({ repository, cohort: "synthetic_expert", participantId: "synthetic-expert-001" });
    await ordinary.service.record(command(ordinary, { eventId: "ordinary-event" }));
    await expert.service.record(command(expert, { eventId: "expert-event" }));
    const ordinaryExport = await repository.exportStudy("teoyube-phase4b-synthetic", "synthetic_ordinary", LATER);
    const expertExport = await repository.exportStudy("teoyube-phase4b-synthetic", "synthetic_expert", LATER);
    expect(ordinaryExport.events.every((event) => event.cohort === "synthetic_ordinary")).toBe(true);
    expect(expertExport.events.every((event) => event.cohort === "synthetic_expert")).toBe(true);
  });

  it("stores local research events encrypted and removes active participant data", async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), "teoyube-research-"));
    try {
      const ring = createKeyRing("test-key", { "test-key": Buffer.alloc(32, 9).toString("base64") });
      const repository = new EncryptedFileResearchEventRepository(temporary, ring, () => LATER);
      const fixture = createFixture({ repository });
      const writeStartedAt = performance.now();
      await fixture.service.record(command(fixture));
      const writeLatencyMs = performance.now() - writeStartedAt;
      const eventDirectory = path.join(temporary, "events", "teoyube-phase4b-synthetic", fixture.participantId);
      const fileName = (await import("node:fs/promises")).readdir(eventDirectory).then((files) => files[0]);
      const eventFile = path.join(eventDirectory, await fileName);
      const stored = await readFile(eventFile, "utf8");
      const storedBytes = (await stat(eventFile)).size;
      console.info(`RESEARCH_STORAGE_PERFORMANCE ${JSON.stringify({ writeLatencyMs, storedBytes })}`);
      expect(writeLatencyMs).toBeLessThan(1_000);
      expect(storedBytes).toBeLessThan(32_768);
      expect(stored).not.toContain("research_source_inspected");
      expect(stored).not.toContain("WEB:Ephesians.1.18");
      expect(await repository.verifyIntegrity("teoyube-phase4b-synthetic")).toBe(true);
      await fixture.service.deleteParticipant(fixture.token);
      expect(await repository.list({ studyId: "teoyube-phase4b-synthetic", participantId: fixture.participantId })).toHaveLength(0);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });

  it("exports only fixed redacted fields and never a spiritual aggregate score", async () => {
    const fixture = createFixture();
    await fixture.service.record(command(fixture));
    const exported = await fixture.repository.exportStudy("teoyube-phase4b-synthetic", "synthetic_ordinary", LATER);
    const serialized = JSON.stringify(exported);
    for (const prohibited of ["prayerText", "rawQuery", "email", "holinessScore", "faithScore", "spiritualRank", "divineFavor"]) {
      expect(serialized).not.toContain(prohibited);
    }
  });
});

describe("Phase 4B product integration and failure isolation", () => {
  it.each([
    ["research_source_inspected", "scripture-boundary"],
    ["research_action_rejected", "action-reversibility"],
    ["research_action_undone", "action-reversibility"],
    ["research_memory_deleted", "memory-consent"],
    ["research_search_completed", "retrieval-continuity"],
    ["research_promise_search_completed", "retrieval-continuity"],
    ["research_deterministic_mode_used", "teo-guide"],
    ["research_provider_fallback_observed", "teo-guide"]
  ])("records approved fixed event %s without raw input", async (eventName, taskId) => {
    const fixture = createFixture();
    const result = await fixture.service.record(command(fixture, { eventName, taskId, eventId: `event-${eventName}` }));
    expect(result.eventName).toBe(eventName);
    expect(Object.keys(result)).not.toContain("rawQuery");
  });

  it("does not break a successful product action when event storage fails", async () => {
    const repository = new InMemoryResearchEventRepository();
    repository.append = async () => { throw new Error("synthetic write failure"); };
    const fixture = createFixture({ repository });
    const observer = new ResearchActionObserver(fixture.service);
    await expect(observer.runProductAction(async () => "product-success", () => command(fixture))).resolves.toBe("product-success");
    expect(fixture.operational.events.at(-1)?.name).toBe("research_event_failed");
  });

  it("allows a no-vendor operational sink", async () => {
    const fixture = createFixture();
    const service = new ResearchEventService(
      { enabled: true, studyId: "teoyube-phase4b-synthetic", studyAllowed: true, syntheticOnly: true },
      fixture.envelope,
      fixture.consent,
      fixture.repository,
      new NullResearchOperationalSink(),
      () => LATER
    );
    await expect(service.record(command(fixture))).resolves.toMatchObject({ eventName: "research_source_inspected" });
  });
});
