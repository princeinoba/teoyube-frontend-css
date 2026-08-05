import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const root = process.cwd();
const study = JSON.parse(readFileSync(path.join(root, "config/research-pilot-study.json"), "utf8"));
const scenarios = JSON.parse(readFileSync(path.join(root, "config/research-pilot-scenarios.json"), "utf8"));
const decision = JSON.parse(readFileSync(path.join(root, "docs/research/phase-4c-recruitment-decision.json"), "utf8"));
const testRoot = path.join(root, ".tmp", "research-pilot-tests", "unit", study.studyId);
const siblingRoot = path.join(root, ".tmp", "research-pilot-tests", "unit", "other-study");
const exportRoot = path.join(root, ".tmp", "research-pilot-tests", "unit-exports");
const cli = path.join(root, "scripts/research/runPilotCommand.cjs");

function environment() {
  return {
    ...process.env,
    TEOYUBE_RESEARCH_MODE_ENABLED: "false",
    TEOYUBE_RESEARCH_PILOT_ROOT: testRoot,
    TEOYUBE_RESEARCH_PILOT_EXPORT_ROOT: exportRoot
  };
}

function run(command: string, ...args: string[]) {
  return JSON.parse(execFileSync(process.execPath, [cli, command, ...args], { cwd: root, env: environment(), encoding: "utf8" }));
}

beforeEach(() => {
  rmSync(path.join(root, ".tmp", "research-pilot-tests", "unit"), { recursive: true, force: true });
  rmSync(exportRoot, { recursive: true, force: true });
});

afterEach(() => {
  rmSync(path.join(root, ".tmp", "research-pilot-tests", "unit"), { recursive: true, force: true });
  rmSync(exportRoot, { recursive: true, force: true });
});

describe("Phase 4C study configuration", () => {
  it("uses the owner-authorized study identity without activating collection", () => {
    expect(study.studyId).toBe("teoyube-formative-pilot-2026-01");
    expect(study.status).toBe("RECRUITMENT_AUTHORIZED_AWAITING_MANUAL_PREREQUISITES");
    expect(study.realParticipantCollectionAuthorized).toBe(false);
  });

  it("preserves the approved participant range", () => {
    expect(study.participantTargets).toMatchObject({ recommendedOrdinaryAdults: 12, minimumAdults: 8, maximumAdults: 15, minimumAge: 18 });
  });

  it("preserves the approved accessibility target", () => {
    expect(study.participantTargets.accessibilityRepresentationMinimum).toBe(2);
    expect(study.participantTargets.accessibilityRepresentationMaximum).toBe(3);
  });

  it("keeps expert reviewers separate", () => {
    expect(study.participantTargets.expertReviewersMaximum).toBe(2);
    expect(study.participantTargets.expertReviewersAnalyzedSeparately).toBe(true);
  });

  it("preserves the 60 to 75 minute duration", () => {
    expect(study.sessionDurationMinutes).toEqual({ minimum: 60, maximum: 75 });
  });

  it("keeps recording optional and separately consented", () => {
    expect(study.recordingPolicy).toMatchObject({ optional: true, separateConsentRequired: true, decliningDoesNotExcludeParticipation: true });
  });

  it("keeps live AI optional and separately consented", () => {
    expect(study.liveAiTaskPolicy).toMatchObject({ optional: true, syntheticInputOnly: true, separateConsentRequired: true, externalAiProcessingConsentRequired: true, paidProviderCallsDuringReadiness: false });
  });

  it("keeps compensation fixed and non-coercive when offered", () => {
    expect(study.compensationPolicy).toMatchObject({ fixedWhenOffered: true, notTiedToCompletionOrPositiveFeedback: true });
  });

  it("uses the approved 180 day active-local-store retention class", () => {
    expect(study.retentionPolicy).toEqual({ retentionClass: "formative_pilot_180_days", retentionDays: 180, activeLocalStoreOnlyDeletionClaim: true });
  });

  it("records owner authorization while preserving manual prerequisites", () => {
    expect(decision.status).toBe("APPROVED");
    expect(decision.recruitmentAuthorized).toBe("AUTHORIZED");
    expect(decision.researchOperator).toBe("PENDING_OWNER_OR_NAMED_TRAINED_RESEARCHER");
    expect(decision.contactDataStorageLocation).toBe("PENDING_SEPARATE_NON_GIT_LOCATION");
    expect(decision.localPrivacyReviewCompleted).toBe("PENDING_REQUIRED_BEFORE_CONTACT_OR_DATA_COLLECTION");
    expect(decision.actualParticipants).toBe(0);
    expect(decision.actualSessions).toBe(0);
    expect(decision.phase4dReady).toBe(false);
  });
});

describe("Phase 4C synthetic scenario registry", () => {
  it("contains the complete 17-scenario registry", () => {
    expect(scenarios.scenarios).toHaveLength(17);
    expect(new Set(scenarios.scenarios.map((scenario: { scenarioId: string }) => scenario.scenarioId)).size).toBe(17);
  });

  it("uses only synthetic scenario IDs", () => {
    expect(scenarios.scenarios.every((scenario: { scenarioId: string }) => /^synthetic-/.test(scenario.scenarioId))).toBe(true);
  });

  it("matches the study scenario and task allowlists", () => {
    expect(scenarios.scenarios.map((scenario: { scenarioId: string }) => scenario.scenarioId).sort()).toEqual([...study.allowedSyntheticScenarioIds].sort());
    expect(scenarios.scenarios.map((scenario: { taskId: string }) => scenario.taskId).sort()).toEqual([...study.allowedTaskIds].sort());
  });

  it("provides every required scenario field", () => {
    const required = ["scenarioId", "taskId", "syntheticParticipantGoal", "syntheticStartingState", "allowedRoutes", "expectedEvidence", "successCriteria", "partialCriteria", "failureCriteria", "criticalMisunderstanding", "moderatorRescueGuidance", "safetyStopCondition", "consentPrerequisite", "cleanupResetSteps"];
    for (const scenario of scenarios.scenarios) for (const field of required) expect(scenario).toHaveProperty(field);
  });

  it("requires both live AI and external processing consent", () => {
    const scenario = scenarios.scenarios.find((item: { taskId: string }) => item.taskId === "optional-live-ai");
    expect(scenario.consentPrerequisite).toContain("research_optional_live_ai_task");
    expect(scenario.consentPrerequisite).toContain("external_ai_processing");
  });

  it("keeps the crisis safety scenario moderator-training-only", () => {
    const scenario = scenarios.scenarios.find((item: { taskId: string }) => item.taskId === "moderator-safety-tabletop");
    expect(scenario).toMatchObject({ trainingOnly: true, includedInParticipantSession: false });
    expect(scenario.allowedRoutes).toEqual([]);
  });

  it("requests accessibility observation consent for accessibility tasks", () => {
    const scenario = scenarios.scenarios.find((item: { taskId: string }) => item.taskId === "accessibility");
    expect(scenario.consentPrerequisite).toContain("research_accessibility_observation");
  });
});

describe("Phase 4C pilot command", () => {
  it("reports disabled, zero-participant readiness status", () => {
    expect(run("status")).toMatchObject({ researchModeEnabled: false, realParticipantCollectionAuthorized: false, actualParticipantRecordCount: 0, actualSessionCount: 0, paidProviderCalls: 0, valid: true });
  });

  it("verifies authorization without enabling collection or creating state", () => {
    expect(run("verify")).toMatchObject({ valid: true, recruitmentAuthorized: "AUTHORIZED", realParticipantCollectionAuthorized: false, actualParticipantRecordCount: 0 });
    expect(existsSync(testRoot)).toBe(false);
  });

  it("prepares synthetic environment metadata without creating a participant", () => {
    const result = run("prepare");
    expect(result).toMatchObject({ status: "SYNTHETIC_ENVIRONMENT_READY", participantCreated: false, contactDataLoaded: false, paidProviderCalls: 0, actualParticipantRecords: 0 });
    expect(readdirSync(testRoot)).toEqual(["prepared-environment.json"]);
  });

  it("requires explicit reset confirmation", () => {
    const result = spawnSync(process.execPath, [cli, "reset"], { cwd: root, env: environment(), encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("synthetic_reset_confirmation_required");
  });

  it("resets only the configured synthetic study namespace", () => {
    run("prepare");
    mkdirSync(siblingRoot, { recursive: true });
    writeFileSync(path.join(siblingRoot, "sentinel.txt"), "preserve\n", "utf8");
    expect(run("reset", "--confirm-synthetic-reset")).toMatchObject({ status: "SYNTHETIC_FIXTURES_REMOVED", ordinaryTeoyubeDataTouched: false, otherStudyTouched: false });
    expect(existsSync(testRoot)).toBe(false);
    expect(existsSync(path.join(siblingRoot, "sentinel.txt"))).toBe(true);
  });

  it("makes reset idempotent", () => {
    expect(run("reset", "--confirm-synthetic-reset")).toMatchObject({ idempotent: true, filesRemoved: 0 });
  });

  it("creates an empty redacted export template without findings", () => {
    const result = run("export-template");
    const output = JSON.parse(readFileSync(path.join(exportRoot, `${study.studyId}-empty-analysis-template.json`), "utf8"));
    expect(result).toMatchObject({ participants: 0, sessions: 0, events: 0, findingsCreated: false });
    expect(output).toMatchObject({ participants: [], sessions: [], events: [], findingsCreated: false, redacted: true });
  });

  it("blocks pilot roots outside approved repository namespaces", () => {
    const result = spawnSync(process.execPath, [cli, "status"], { cwd: root, env: { ...environment(), TEOYUBE_RESEARCH_PILOT_ROOT: path.parse(root).root }, encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("teoyube_research_pilot_root_outside_allowed_boundary");
  });

  it("runs a signed deterministic dry run with optional consent denied", () => {
    const result = run("dry-run", "--confirm-synthetic");
    expect(result).toMatchObject({ status: "PASS", envelopeSignatureVerified: true, baselineConsentVerified: true, optionalLiveAiConsentDeniedByDefault: true, recordingConsentDeniedByDefault: true, deterministicFallbackOnly: true, paidProviderCalls: 0, valid: true });
  });

  it("verifies event recording, task scoring, rescue, accessibility, and fallback", () => {
    const result = run("dry-run", "--confirm-synthetic");
    expect(result).toMatchObject({ eventRecordingVerified: true, taskScoringVerified: true, moderatorRescueVerified: true, accessibilityObservationVerified: true, providerFallbackVerified: true });
  });

  it("verifies withdrawal, deletion, aggregate regeneration, and zero records", () => {
    const result = run("dry-run", "--confirm-synthetic");
    expect(result).toMatchObject({ withdrawalVerified: true, deletionVerified: true, aggregateRegenerationVerified: true, syntheticRecordFilesAfterCleanup: 0, actualParticipantRecordCount: 0, actualSessionCount: 0, unresolvedAdverseEvents: 0 });
  });

  it("requires explicit dry-run confirmation", () => {
    const result = spawnSync(process.execPath, [cli, "dry-run"], { cwd: root, env: environment(), encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("synthetic_dry_run_confirmation_required");
  });
});

describe("Phase 4C tracked-data boundaries", () => {
  it("keeps tracked recruitment and compensation CSVs header-only", () => {
    for (const relative of ["docs/research/recruitment-tracker-template.csv", "docs/research/compensation-log-template.csv"]) {
      const lines = readFileSync(path.join(root, relative), "utf8").split(/\r?\n/).filter(Boolean);
      expect(lines).toHaveLength(1);
      expect(lines[0]).toContain("TEMPLATE");
      expect(lines[0]).toContain("DO NOT ENTER REAL PARTICIPANT DATA");
    }
  });

  it("keeps research administration out of normal routes", () => {
    const tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split(/\r?\n/);
    expect(tracked.some((file) => /^src\/app\/(?:research|pilot|study)(?:\/|$)/i.test(file))).toBe(false);
  });

  it("tracks no local research data", () => {
    expect(execFileSync("git", ["ls-files", "--", ".var/research"], { cwd: root, encoding: "utf8" }).trim()).toBe("");
  });

  it("keeps checked-in research mode disabled", () => {
    expect(readFileSync(path.join(root, ".env.example"), "utf8")).toContain("TEOYUBE_RESEARCH_MODE_ENABLED=false");
  });
});
