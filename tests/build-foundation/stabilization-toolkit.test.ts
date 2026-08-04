import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync, spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const toolkit = require("../../scripts/stabilization/stabilization-toolkit.cjs") as {
  CAPABILITIES: string[];
  INCIDENT_SCHEMA_VERSION: string;
  KNOWN_BLOCKER_IDS: string[];
  SESSION_SCHEMA_VERSION: string;
  evaluateStabilization(input: {
    sessions: SessionRecord[];
    incidents: IncidentRecord[];
    ownerCloseoutConfirmed?: boolean;
  }): StabilizationStatus;
  exportRedactedAggregate(root: string): { target: string; output: Record<string, unknown> };
  persistIncident(root: string, draft: IncidentRecord): { target: string; record: IncidentRecord; updated: boolean };
  persistSession(root: string, draft: SessionRecord): { target: string; record: SessionRecord };
  validateIncidentRecord(record: IncidentRecord, options?: { allowMissingRecordHash?: boolean }): IncidentRecord;
  validateSessionRecord(record: SessionRecord, options?: { allowMissingRecordHash?: boolean }): SessionRecord;
};

type SafeAction = {
  actionId: string;
  capability: string;
  route: string;
  expectedBehavior: string;
  actualBehavior: string;
  result: "pass" | "issue_found" | "blocked" | "skipped";
  safeErrorCode: string | null;
  automated: false;
};

type SessionRecord = {
  schemaVersion: string;
  sessionId: string;
  ownerConfirmed: boolean;
  startedAt: string;
  endedAt: string;
  calendarDate: string;
  runtime: string;
  browser: string;
  viewport: string;
  routes: string[];
  capabilities: string[];
  actions: SafeAction[];
  expectedOutcome: string;
  actualOutcome: string;
  result: string;
  issueIds: string[];
  blockerObservations: string[];
  restartRequired: boolean;
  rollbackExercised: boolean;
  returnToNextVerified: boolean;
  citationIssue: boolean;
  memoryOrConsentIssue: boolean;
  visualIssue: boolean;
  safetyIssue: boolean;
  dataLossIssue: boolean;
  crossUserIssue: boolean;
  safeErrorCodes: string[];
  notes: string;
  sensitiveContentIncluded: boolean;
  recordedBy: string;
  automated: boolean;
  createdAt: string;
  recordHash?: string;
  [key: string]: unknown;
};

type IncidentRecord = {
  schemaVersion: string;
  incidentId: string;
  sessionId: string;
  occurredAt: string;
  route: string;
  capability: string;
  summary: string;
  severity: string;
  safeErrorCode: string;
  reproductionSteps: string[];
  expectedBehavior: string;
  actualBehavior: string;
  visualImpact: string;
  dataImpact: string;
  securityPrivacyImpact: string;
  scriptureCitationImpact: string;
  safetyImpact: string;
  workaround: string;
  restartResult: string;
  rollbackResult: string;
  status: string;
  resolutionCommit: string | null;
  ownerConfirmed: boolean;
  dataLoss: boolean;
  crossUserAccess: boolean;
  citationCorruption: boolean;
  unsafeGuidance: boolean;
  protectedVisualRegression: boolean;
  criticalRuntimeFailure: boolean;
  sensitiveContentIncluded: boolean;
  reportedBy: string;
  createdAt: string;
  updatedAt: string | null;
  recordHash?: string;
  [key: string]: unknown;
};

type StabilizationStatus = {
  status: string;
  calendarDaysRecorded: number;
  meaningfulSessionsRecorded: number;
  coverageMissing: string[];
  blockerObservationsMissing: string[];
  disqualifyingIncidentCount: number;
  criteria: Record<string, boolean>;
};

const temporaryRoots: string[] = [];
const repositoryRoot = path.resolve(import.meta.dirname, "..", "..");

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

function isoForDate(date: string, hour: string) {
  return `${date}T${hour}-04:00`;
}

function action(capability: string, index: number): SafeAction {
  return {
    actionId: `ACTION_${index}`,
    capability,
    route: "/",
    expectedBehavior: "The selected control completes its documented safe action.",
    actualBehavior: "The selected control completed its documented safe action.",
    result: "pass",
    safeErrorCode: null,
    automated: false
  };
}

function sessionDraft({
  id = "STAB-SESSION-20260804-A",
  date = "2026-08-04",
  capabilities = ["today_guided_loop"],
  blockerObservations = [] as string[],
  rollbackExercised = false,
  returnToNextVerified = false
} = {}): SessionRecord {
  return {
    schemaVersion: toolkit.SESSION_SCHEMA_VERSION,
    sessionId: id,
    ownerConfirmed: true,
    startedAt: isoForDate(date, "09:00:00"),
    endedAt: isoForDate(date, "09:30:00"),
    calendarDate: date,
    runtime: "next-canonical",
    browser: "Synthetic Browser 1",
    viewport: "1440x900",
    routes: ["/"],
    capabilities,
    actions: capabilities.map(action),
    expectedOutcome: "The explicitly selected capabilities complete without losing context.",
    actualOutcome: "The explicitly selected capabilities completed without losing context.",
    result: "pass",
    issueIds: [],
    blockerObservations,
    restartRequired: false,
    rollbackExercised,
    returnToNextVerified,
    citationIssue: false,
    memoryOrConsentIssue: false,
    visualIssue: false,
    safetyIssue: false,
    dataLossIssue: false,
    crossUserIssue: false,
    safeErrorCodes: [],
    notes: "Synthetic privacy-safe fixture only.",
    sensitiveContentIncluded: false,
    recordedBy: "owner",
    automated: false,
    createdAt: isoForDate(date, "09:35:00")
  };
}

function incidentDraft(overrides: Partial<IncidentRecord> = {}): IncidentRecord {
  return {
    schemaVersion: toolkit.INCIDENT_SCHEMA_VERSION,
    incidentId: "STAB-INCIDENT-20260804-A",
    sessionId: "STAB-SESSION-20260804-A",
    occurredAt: "2026-08-04T09:20:00-04:00",
    route: "/",
    capability: "today_guided_loop",
    summary: "A synthetic product behavior differed from the expected behavior.",
    severity: "medium",
    safeErrorCode: "SYNTHETIC_BEHAVIOR_DIFFERENCE",
    reproductionSteps: ["Open the safe synthetic test state.", "Activate the documented control."],
    expectedBehavior: "The safe synthetic state completes.",
    actualBehavior: "The safe synthetic state reports a bounded issue.",
    visualImpact: "None recorded.",
    dataImpact: "None recorded.",
    securityPrivacyImpact: "None recorded.",
    scriptureCitationImpact: "None recorded.",
    safetyImpact: "None recorded.",
    workaround: "No workaround recorded.",
    restartResult: "Not required.",
    rollbackResult: "Not required.",
    status: "open",
    resolutionCommit: null,
    ownerConfirmed: true,
    dataLoss: false,
    crossUserAccess: false,
    citationCorruption: false,
    unsafeGuidance: false,
    protectedVisualRegression: false,
    criticalRuntimeFailure: false,
    sensitiveContentIncluded: false,
    reportedBy: "owner",
    createdAt: "2026-08-04T09:40:00-04:00",
    updatedAt: null,
    ...overrides
  };
}

function readySessions() {
  const dates = [
    "2026-08-01",
    "2026-08-02",
    "2026-08-03",
    "2026-08-04",
    "2026-08-05",
    "2026-08-06",
    "2026-08-07"
  ];
  return Array.from({ length: 10 }, (_, index) =>
    toolkit.validateSessionRecord(
      sessionDraft({
        id: `STAB-SESSION-READY-${index + 1}`,
        date: dates[index % dates.length],
        capabilities: index === 0 ? [...toolkit.CAPABILITIES] : ["today_guided_loop"],
        blockerObservations: index === 0 ? [...toolkit.KNOWN_BLOCKER_IDS] : [],
        rollbackExercised: index === 0,
        returnToNextVerified: index === 0
      }),
      { allowMissingRecordHash: true }
    )
  );
}

describe("Phase 3A privacy-safe stabilization toolkit", () => {
  it("accepts a strict owner-confirmed safe session and creates a deterministic hash", () => {
    const draft = sessionDraft();
    const first = toolkit.validateSessionRecord(draft, { allowMissingRecordHash: true });
    const second = toolkit.validateSessionRecord(draft, { allowMissingRecordHash: true });
    expect(first.recordHash).toMatch(/^[a-f0-9]{64}$/);
    expect(first.recordHash).toBe(second.recordHash);
  });

  it("rejects prohibited fields and normalized aliases", () => {
    const prohibited = { ...sessionDraft(), prayerText: "not permitted" };
    const alias = { ...sessionDraft(), prayer_text: "not permitted" };
    expect(() => toolkit.validateSessionRecord(prohibited, { allowMissingRecordHash: true })).toThrow(
      /Prohibited field/
    );
    expect(() => toolkit.validateSessionRecord(alias, { allowMissingRecordHash: true })).toThrow(
      /Prohibited field/
    );
  });

  it("rejects unknown fields", () => {
    const record = { ...sessionDraft(), unexpectedField: "safe-looking but unsupported" };
    expect(() => toolkit.validateSessionRecord(record, { allowMissingRecordHash: true })).toThrow(
      /unknown fields/
    );
  });

  it("rejects overlong notes", () => {
    const record = sessionDraft();
    record.notes = "x".repeat(2001);
    expect(() => toolkit.validateSessionRecord(record, { allowMissingRecordHash: true })).toThrow(
      /notes/
    );
  });

  it("rejects recognizable secrets without echoing them", () => {
    const secret = `sk-${"a".repeat(32)}`;
    const record = sessionDraft();
    record.notes = secret;
    expect(() => toolkit.validateSessionRecord(record, { allowMissingRecordHash: true })).toThrow(
      /Recognizable secret/
    );

    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "teoyube-stab-secret-"));
    temporaryRoots.push(temp);
    const input = path.join(temp, "unsafe.json");
    fs.writeFileSync(input, JSON.stringify(record));
    const result = spawnSync(
      process.execPath,
      [path.join(repositoryRoot, "scripts/stabilization/runStabilizationCommand.cjs"), "record", "--file", input],
      { cwd: repositoryRoot, encoding: "utf8" }
    );
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).not.toContain(secret);
  });

  it("rejects invalid dates and end times that do not follow start times", () => {
    const invalidDate = sessionDraft();
    invalidDate.calendarDate = "2026-02-30";
    expect(() => toolkit.validateSessionRecord(invalidDate, { allowMissingRecordHash: true })).toThrow(
      /valid calendar date/
    );
    const invalidOrder = sessionDraft();
    invalidOrder.endedAt = invalidOrder.startedAt;
    expect(() => toolkit.validateSessionRecord(invalidOrder, { allowMissingRecordHash: true })).toThrow(
      /must be after/
    );
  });

  it("rejects duplicate session IDs on disk", () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "teoyube-stab-duplicate-"));
    temporaryRoots.push(temp);
    const record = sessionDraft();
    toolkit.persistSession(temp, record);
    expect(() => toolkit.persistSession(temp, record)).toThrow(/already exists/);
  });

  it("prevents automated test runs from masquerading as meaningful owner sessions", () => {
    const record = sessionDraft();
    record.automated = true;
    expect(() => toolkit.validateSessionRecord(record, { allowMissingRecordHash: true })).toThrow(
      /automated/
    );
  });

  it("requires explicit owner confirmation", () => {
    const record = sessionDraft();
    record.ownerConfirmed = false;
    expect(() => toolkit.validateSessionRecord(record, { allowMissingRecordHash: true })).toThrow(
      /ownerConfirmed/
    );
  });

  it("fails readiness with fewer than seven days", () => {
    const sessions = readySessions().map((record) => ({ ...record, calendarDate: "2026-08-01" }));
    const status = toolkit.evaluateStabilization({ sessions, incidents: [] });
    expect(status.calendarDaysRecorded).toBe(1);
    expect(status.criteria.minimumCalendarDays).toBe(false);
    expect(status.status).toBe("WAITING_OWNER");
  });

  it("fails readiness with fewer than ten sessions", () => {
    const status = toolkit.evaluateStabilization({ sessions: readySessions().slice(0, 9), incidents: [] });
    expect(status.meaningfulSessionsRecorded).toBe(9);
    expect(status.criteria.minimumMeaningfulSessions).toBe(false);
  });

  it("fails readiness when a required capability is missing", () => {
    const sessions = readySessions().map((record) => ({
      ...record,
      capabilities: record.capabilities.filter((capability) => capability !== "promise_search")
    }));
    const status = toolkit.evaluateStabilization({ sessions, incidents: [] });
    expect(status.coverageMissing).toContain("promise_search");
    expect(status.criteria.requiredCapabilityCoverage).toBe(false);
  });

  it("blocks unresolved critical incidents", () => {
    const incident = toolkit.validateIncidentRecord(incidentDraft({ severity: "critical" }), {
      allowMissingRecordHash: true
    });
    const status = toolkit.evaluateStabilization({ sessions: readySessions(), incidents: [incident] });
    expect(status.status).toBe("BLOCKED_INCIDENT");
    expect(status.disqualifyingIncidentCount).toBe(1);
  });

  it.each([
    ["cross-user", { crossUserAccess: true }],
    ["citation", { citationCorruption: true }],
    ["unsafe guidance", { unsafeGuidance: true }]
  ])("blocks an unresolved %s incident", (_name, overrides) => {
    const incident = toolkit.validateIncidentRecord(incidentDraft(overrides), {
      allowMissingRecordHash: true
    });
    const status = toolkit.evaluateStabilization({ sessions: readySessions(), incidents: [incident] });
    expect(status.status).toBe("BLOCKED_INCIDENT");
  });

  it("requires static rollback evidence independently of capability labels", () => {
    const sessions = readySessions().map((record) => ({ ...record, rollbackExercised: false }));
    const status = toolkit.evaluateStabilization({ sessions, incidents: [] });
    expect(status.criteria.staticRollbackEvidence).toBe(false);
    expect(status.status).toBe("WAITING_OWNER");
  });

  it("requires return-to-Next evidence independently of capability labels", () => {
    const sessions = readySessions().map((record) => ({ ...record, returnToNextVerified: false }));
    const status = toolkit.evaluateStabilization({ sessions, incidents: [] });
    expect(status.criteria.returnToNextEvidence).toBe(false);
    expect(status.status).toBe("WAITING_OWNER");
  });

  it("reaches READY_FOR_CLOSEOUT mechanically but never PASS without owner closeout", () => {
    const status = toolkit.evaluateStabilization({ sessions: readySessions(), incidents: [] });
    expect(status.status).toBe("READY_FOR_CLOSEOUT");
    expect(status.criteria.ownerCloseoutConfirmed).toBe(false);
  });

  it("keeps published schemas strict and aligned with validator capability and route contracts", () => {
    const sessionSchema = JSON.parse(
      fs.readFileSync(
        path.join(repositoryRoot, "docs/stabilization/schemas/session-record.schema.json"),
        "utf8"
      )
    ) as {
      additionalProperties: boolean;
      required: string[];
      properties: { schemaVersion: { const: string } };
      $defs: { capability: { enum: string[] }; route: { enum: string[] } };
    };
    const incidentSchema = JSON.parse(
      fs.readFileSync(
        path.join(repositoryRoot, "docs/stabilization/schemas/incident-record.schema.json"),
        "utf8"
      )
    ) as {
      additionalProperties: boolean;
      required: string[];
      properties: { schemaVersion: { const: string }; route: { $ref: string }; capability: { $ref: string } };
    };
    expect(sessionSchema.additionalProperties).toBe(false);
    expect(incidentSchema.additionalProperties).toBe(false);
    expect(sessionSchema.required).toContain("recordHash");
    expect(incidentSchema.required).toContain("recordHash");
    expect(sessionSchema.$defs.capability.enum).toEqual(toolkit.CAPABILITIES);
    expect(sessionSchema.$defs.route.enum).toHaveLength(23);
    expect(incidentSchema.properties.route.$ref).toContain("session-record.schema.json");
    expect(incidentSchema.properties.capability.$ref).toContain("session-record.schema.json");
  });

  it("exports only a redacted aggregate and omits session narratives", () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "teoyube-stab-export-"));
    temporaryRoots.push(temp);
    const record = sessionDraft();
    record.notes = "SYNTHETIC_NARRATIVE_MARKER_MUST_NOT_EXPORT";
    toolkit.persistSession(temp, record);
    const exported = toolkit.exportRedactedAggregate(temp);
    const output = JSON.stringify(exported.output);
    expect(output).not.toContain("SYNTHETIC_NARRATIVE_MARKER_MUST_NOT_EXPORT");
    expect(output).not.toContain('"notes"');
    expect(output).not.toContain('"actions"');
    expect(output).not.toContain('"expectedOutcome"');
    expect(fs.existsSync(exported.target)).toBe(true);
  });

  it("updates incidents only from an explicit full record and never auto-closes them", () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "teoyube-stab-incident-"));
    temporaryRoots.push(temp);
    const first = toolkit.persistIncident(temp, incidentDraft());
    expect(first.updated).toBe(false);
    const update = incidentDraft({ status: "investigating", updatedAt: "2026-08-04T10:00:00-04:00" });
    const second = toolkit.persistIncident(temp, update);
    expect(second.updated).toBe(true);
    expect(second.record.status).toBe("investigating");
    expect(second.record.resolutionCommit).toBeNull();
  });

  it("keeps actual record paths ignored and outside runtime/client source", () => {
    expect(() =>
      execFileSync("git", ["check-ignore", "-q", ".var/stabilization/sessions/example.json"], {
        cwd: repositoryRoot
      })
    ).not.toThrow();
    const runtimeManifest = JSON.parse(
      fs.readFileSync(path.join(repositoryRoot, "config/runtime/runtime-source-manifest.json"), "utf8")
    ) as { exactPaths: string[]; prefixes: string[] };
    expect([...runtimeManifest.exactPaths, ...runtimeManifest.prefixes]).not.toContain(
      ".var/stabilization/"
    );
    expect(() =>
      execFileSync("git", ["grep", "-n", "scripts/stabilization", "--", "src"], {
        cwd: repositoryRoot,
        stdio: "pipe"
      })
    ).toThrow();
  });
});
