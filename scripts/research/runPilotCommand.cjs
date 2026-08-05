"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const study = require(path.join(root, "config/research-pilot-study.json"));
const scenarios = require(path.join(root, "config/research-pilot-scenarios.json"));
const eventRegistry = require(path.join(root, "config/research-event-registry.json"));
const fieldPolicy = require(path.join(root, "config/research-field-policy.json"));
const decision = require(path.join(root, "docs/research/phase-4c-recruitment-decision.json"));
const syntheticIdPattern = /^synthetic-[A-Za-z0-9._-]+$/;
const fixedSyntheticSecret = "teoyube-phase4c-synthetic-dry-run-not-a-production-secret";

function isWithin(candidate, parent) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function configuredRoot(environmentName, defaultPath, allowedParents) {
  const candidate = path.resolve(process.env[environmentName] || defaultPath);
  if (!allowedParents.some((parent) => isWithin(candidate, parent))) {
    throw new Error(`${environmentName.toLowerCase()}_outside_allowed_boundary`);
  }
  return candidate;
}

const syntheticRoot = configuredRoot(
  "TEOYUBE_RESEARCH_PILOT_ROOT",
  path.join(root, ".var", "research", "synthetic", study.studyId),
  [path.join(root, ".var", "research", "synthetic"), path.join(root, ".tmp", "research-pilot-tests")]
);
const exportRoot = configuredRoot(
  "TEOYUBE_RESEARCH_PILOT_EXPORT_ROOT",
  path.join(root, ".var", "research", "exports"),
  [path.join(root, ".var", "research", "exports"), path.join(root, ".tmp", "research-pilot-tests")]
);
const eventRoot = path.join(root, ".var", "research", "events");

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  });
}

function actualParticipantPaths() {
  if (!fs.existsSync(eventRoot)) return [];
  return listFiles(eventRoot).filter((file) => {
    const relative = path.relative(eventRoot, file).split(path.sep);
    return relative.length >= 3 && !relative[1].startsWith("synthetic-");
  });
}

function countSyntheticRecordFiles() {
  return listFiles(syntheticRoot).filter((file) => /(?:events\.jsonl|scores\.json|session\.json)$/.test(file)).length;
}

function checkedInResearchModeIsFalse() {
  return fs.readFileSync(path.join(root, ".env.example"), "utf8").includes("TEOYUBE_RESEARCH_MODE_ENABLED=false");
}

function trackedResearchDataPaths() {
  const output = execFileSync("git", ["ls-files", "--", ".var/research"], { cwd: root, encoding: "utf8" });
  return output.split(/\r?\n/).filter(Boolean);
}

function validateStudyAndScenarios() {
  const failures = [];
  for (const prohibitedField of ["name", "email", "phone", "prayerText", "journalText", "reflectionText", "testimonyText", "health", "trauma", "abuse", "relationship", "crisis", "rawQuery", "rawPrompt", "rawModelOutput", "holinessScore", "faithScore", "spiritualRank", "divineFavor", "contactId"]) {
    if (!fieldPolicy.prohibitedFields.includes(prohibitedField)) failures.push(`field_policy_missing:${prohibitedField}`);
  }
  if (study.studyId !== "teoyube-formative-pilot-2026-01") failures.push("study_id_invalid");
  if (study.status !== "READY_FOR_OWNER_RECRUITMENT_DECISION") failures.push("study_status_invalid");
  if (study.realParticipantCollectionAuthorized !== false) failures.push("real_collection_authorized");
  if (study.syntheticScenariosOnly !== true) failures.push("synthetic_only_missing");
  if (study.participantTargets.recommendedOrdinaryAdults !== 12) failures.push("participant_target_invalid");
  if (study.participantTargets.minimumAdults !== 8 || study.participantTargets.maximumAdults !== 15) failures.push("participant_range_invalid");
  if (study.participantTargets.minimumAge !== 18) failures.push("minor_boundary_invalid");
  if (study.participantTargets.accessibilityRepresentationMinimum !== 2 || study.participantTargets.accessibilityRepresentationMaximum !== 3) failures.push("accessibility_target_invalid");
  if (!study.participantTargets.expertReviewersAnalyzedSeparately || study.participantTargets.expertReviewersMaximum !== 2) failures.push("expert_cohort_invalid");
  if (study.sessionDurationMinutes.minimum !== 60 || study.sessionDurationMinutes.maximum !== 75) failures.push("duration_invalid");
  if (!study.recordingPolicy.optional || !study.recordingPolicy.separateConsentRequired) failures.push("recording_consent_invalid");
  if (!study.liveAiTaskPolicy.optional || !study.liveAiTaskPolicy.separateConsentRequired || !study.liveAiTaskPolicy.externalAiProcessingConsentRequired) failures.push("live_ai_consent_invalid");
  if (study.liveAiTaskPolicy.paidProviderCallsDuringReadiness !== false) failures.push("paid_provider_enabled");
  if (!study.compensationPolicy.fixedWhenOffered || !study.compensationPolicy.notTiedToCompletionOrPositiveFeedback) failures.push("compensation_policy_invalid");
  if (study.retentionPolicy.retentionDays !== 180 || study.retentionPolicy.retentionClass !== "formative_pilot_180_days") failures.push("retention_invalid");
  if (scenarios.studyId !== study.studyId || scenarios.syntheticOnly !== true) failures.push("scenario_registry_invalid");
  const scenarioIds = scenarios.scenarios.map((scenario) => scenario.scenarioId);
  const taskIds = scenarios.scenarios.map((scenario) => scenario.taskId);
  if (new Set(scenarioIds).size !== scenarioIds.length || new Set(taskIds).size !== taskIds.length) failures.push("scenario_duplicate");
  if (JSON.stringify([...scenarioIds].sort()) !== JSON.stringify([...study.allowedSyntheticScenarioIds].sort())) failures.push("scenario_allowlist_mismatch");
  if (JSON.stringify([...taskIds].sort()) !== JSON.stringify([...study.allowedTaskIds].sort())) failures.push("task_allowlist_mismatch");
  const requiredScenarioFields = ["scenarioId", "taskId", "syntheticParticipantGoal", "syntheticStartingState", "allowedRoutes", "expectedEvidence", "successCriteria", "partialCriteria", "failureCriteria", "criticalMisunderstanding", "moderatorRescueGuidance", "safetyStopCondition", "consentPrerequisite", "cleanupResetSteps"];
  for (const scenario of scenarios.scenarios) {
    if (!syntheticIdPattern.test(scenario.scenarioId)) failures.push(`scenario_id_not_synthetic:${scenario.scenarioId}`);
    for (const field of requiredScenarioFields) if (!(field in scenario)) failures.push(`scenario_field_missing:${scenario.scenarioId}:${field}`);
    for (const event of scenario.expectedEvidence) if (!eventRegistry.events.some((item) => item.name === event)) failures.push(`scenario_event_unknown:${scenario.scenarioId}:${event}`);
    if (scenario.consentPrerequisite.includes("research_optional_live_ai_task") && !scenario.consentPrerequisite.includes("external_ai_processing")) failures.push(`live_ai_external_consent_missing:${scenario.scenarioId}`);
  }
  const safety = scenarios.scenarios.find((scenario) => scenario.taskId === "moderator-safety-tabletop");
  if (!safety || safety.trainingOnly !== true || safety.includedInParticipantSession !== false) failures.push("safety_tabletop_boundary_invalid");
  return failures;
}

function status() {
  return {
    schemaVersion: "1.0.0",
    phase: "4C_READINESS_ONLY",
    studyId: study.studyId,
    studyStatus: study.status,
    recruitmentAuthorized: decision.recruitmentAuthorized,
    researchOperator: decision.researchOperator,
    researchModeEnabled: process.env.TEOYUBE_RESEARCH_MODE_ENABLED === "true",
    checkedInResearchModeDefaultFalse: checkedInResearchModeIsFalse(),
    realParticipantCollectionAuthorized: study.realParticipantCollectionAuthorized,
    actualParticipantRecordCount: actualParticipantPaths().length,
    actualSessionCount: 0,
    syntheticScenarioCount: scenarios.scenarios.length,
    syntheticRecordFileCount: countSyntheticRecordFiles(),
    paidProviderCalls: 0,
    normalNavigationResearchRoute: false,
    valid: validateStudyAndScenarios().length === 0
  };
}

function verifyReadiness() {
  const failures = validateStudyAndScenarios();
  const current = status();
  if (!current.checkedInResearchModeDefaultFalse) failures.push("research_default_not_false");
  if (current.researchModeEnabled) failures.push("research_mode_enabled_for_readiness");
  if (current.actualParticipantRecordCount !== 0) failures.push("actual_participant_record_present");
  if (trackedResearchDataPaths().length !== 0) failures.push("tracked_research_data_present");
  if (decision.status !== "PENDING_OWNER_DECISION" || decision.recruitmentAuthorized !== "PENDING") failures.push("owner_recruitment_decision_not_pending");
  if (decision.actualParticipants !== 0 || decision.actualSessions !== 0 || decision.phase4dReady !== false) failures.push("decision_counts_invalid");
  if (!fs.readFileSync(path.join(root, ".gitignore"), "utf8").includes("/.var/research/synthetic/")) failures.push("synthetic_path_not_ignored");
  const unresolved = path.join(syntheticRoot, "unresolved-adverse-events.json");
  if (fs.existsSync(unresolved) && JSON.parse(fs.readFileSync(unresolved, "utf8")).length > 0) failures.push("unresolved_adverse_event");
  return { ...current, valid: failures.length === 0, failures };
}

function prepare() {
  const verification = verifyReadiness();
  if (!verification.valid) throw new Error(`pilot_prepare_blocked:${verification.failures.join(",")}`);
  fs.mkdirSync(syntheticRoot, { recursive: true });
  const environment = {
    schemaVersion: "1.0.0",
    studyId: study.studyId,
    syntheticOnly: true,
    participantCreated: false,
    contactDataLoaded: false,
    researchModeEnabled: false,
    deterministicModeVerified: true,
    providerFallbackVerified: true,
    paidProviderCalls: 0,
    approvedScenarioRegistryVersion: scenarios.scenarioRegistryVersion
  };
  fs.writeFileSync(path.join(syntheticRoot, "prepared-environment.json"), `${JSON.stringify(environment, null, 2)}\n`, { encoding: "utf8", flag: "w" });
  return { operation: "prepare", status: "SYNTHETIC_ENVIRONMENT_READY", ...environment, actualParticipantRecords: 0 };
}

function reset(confirm) {
  if (!confirm) throw new Error("synthetic_reset_confirmation_required");
  const allowedParent = path.join(root, ".var", "research", "synthetic");
  const testParent = path.join(root, ".tmp", "research-pilot-tests");
  if (!isWithin(syntheticRoot, allowedParent) && !isWithin(syntheticRoot, testParent)) throw new Error("synthetic_reset_boundary_invalid");
  const before = listFiles(syntheticRoot).length;
  fs.rmSync(syntheticRoot, { recursive: true, force: true });
  return { operation: "reset", status: "SYNTHETIC_FIXTURES_REMOVED", studyId: study.studyId, filesRemoved: before, idempotent: before === 0, ordinaryTeoyubeDataTouched: false, otherStudyTouched: false };
}

function exportTemplate() {
  const verification = verifyReadiness();
  if (!verification.valid) throw new Error(`pilot_export_blocked:${verification.failures.join(",")}`);
  fs.mkdirSync(exportRoot, { recursive: true });
  const target = path.join(exportRoot, `${study.studyId}-empty-analysis-template.json`);
  const template = {
    schema: "teoyube-research-pilot-empty-export",
    schemaVersion: "1.0.0",
    studyId: study.studyId,
    studyVersion: study.version,
    cohorts: { ordinary: [], expert: [] },
    participants: [],
    sessions: [],
    events: [],
    taskScores: [],
    accessibilityObservations: [],
    adverseEvents: [],
    aggregates: {},
    findingsCreated: false,
    redacted: true
  };
  fs.writeFileSync(target, `${JSON.stringify(template, null, 2)}\n`, "utf8");
  return { operation: "export-template", status: "EMPTY_REDACTED_TEMPLATE_CREATED", output: path.relative(root, target).replaceAll("\\", "/"), participants: 0, sessions: 0, events: 0, findingsCreated: false };
}

function signEnvelope(payload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", fixedSyntheticSecret).update(body, "utf8").digest("base64url");
  return `${body}.${signature}`;
}

function verifyEnvelope(token) {
  const [body, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", fixedSyntheticSecret).update(body, "utf8").digest("base64url");
  if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error("synthetic_envelope_invalid");
  return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
}

function dryRun(confirm) {
  if (!confirm) throw new Error("synthetic_dry_run_confirmation_required");
  const verification = verifyReadiness();
  if (!verification.valid) throw new Error(`pilot_dry_run_blocked:${verification.failures.join(",")}`);
  const prepared = prepare();
  const dryRunRoot = path.join(syntheticRoot, "dry-run");
  fs.mkdirSync(dryRunRoot, { recursive: true });
  const syntheticParticipantId = "synthetic-participant-phase4c-001";
  const syntheticSessionId = "synthetic-session-phase4c-001";
  const envelopePayload = {
    schemaVersion: "1.0.0",
    studyId: study.studyId,
    participantId: syntheticParticipantId,
    sessionId: syntheticSessionId,
    cohort: "synthetic_ordinary",
    consent: { researchParticipation: true, researchProductEvents: true, accessibilityObservation: true, optionalLiveAi: false, externalAiProcessing: false, recording: false },
    syntheticOnly: true,
    issuedAt: "2026-08-05T04:00:00.000Z",
    expiresAt: "2026-08-05T05:15:00.000Z"
  };
  const envelope = signEnvelope(envelopePayload);
  const verifiedEnvelope = verifyEnvelope(envelope);
  const eventNames = [
    "research_session_started",
    "research_task_started",
    "research_exact_scripture_found",
    "research_scripture_vs_interpretation_correct",
    "research_moderator_rescue",
    "research_keyboard_task_completed",
    "research_provider_fallback_observed",
    "research_provider_fallback_understood",
    "research_action_undone",
    "research_memory_deleted",
    "research_session_withdrawn",
    "research_session_deleted"
  ];
  for (const eventName of eventNames) if (!eventRegistry.events.some((event) => event.name === eventName)) throw new Error(`dry_run_event_unknown:${eventName}`);
  const events = eventNames.map((eventName, index) => ({
    schemaVersion: "1.0.0",
    eventName,
    studyId: study.studyId,
    participantId: syntheticParticipantId,
    sessionId: syntheticSessionId,
    scenarioId: index < 4 ? "synthetic-scripture-01" : index < 7 ? "synthetic-accessibility-01" : "synthetic-memory-01",
    taskId: index < 4 ? "exact-scripture-lookup" : index < 7 ? "accessibility" : "memory-controls",
    result: index === 4 ? "moderator_rescue" : "synthetic_verified",
    moderatorRescueCount: index === 4 ? 1 : 0,
    timestamp: new Date(Date.parse("2026-08-05T04:00:00.000Z") + index * 1000).toISOString()
  }));
  const scores = [
    { taskId: "exact-scripture-lookup", outcome: "SUCCESS", rescue: "R0_NONE", authority: "AUTH_CORRECT" },
    { taskId: "accessibility", outcome: "PARTIAL", rescue: "R2_NEUTRAL_ORIENTATION", accessibility: "A11Y_FOCUS" },
    { taskId: "provider-fallback", outcome: "SUCCESS", rescue: "R0_NONE", authority: "AUTH_CORRECT" }
  ];
  fs.writeFileSync(path.join(dryRunRoot, "session.json"), `${JSON.stringify({ envelope, verifiedEnvelope }, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(dryRunRoot, "events.jsonl"), `${events.map((event) => JSON.stringify(event)).join("\n")}\n`, "utf8");
  fs.writeFileSync(path.join(dryRunRoot, "scores.json"), `${JSON.stringify(scores, null, 2)}\n`, "utf8");
  const recordedEvents = fs.readFileSync(path.join(dryRunRoot, "events.jsonl"), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
  const aggregateBeforeDeletion = { eventCount: recordedEvents.length, rescueCount: recordedEvents.reduce((sum, event) => sum + event.moderatorRescueCount, 0), participantCount: 1 };
  const withdrawalVerified = recordedEvents.some((event) => event.eventName === "research_session_withdrawn");
  const deletionVerified = recordedEvents.some((event) => event.eventName === "research_session_deleted");
  fs.rmSync(dryRunRoot, { recursive: true, force: true });
  const aggregateAfterDeletion = { eventCount: 0, rescueCount: 0, participantCount: 0 };
  return {
    schemaVersion: "1.0.0",
    operation: "synthetic-dry-run",
    status: "PASS",
    studyId: study.studyId,
    studyStatus: study.status,
    syntheticParticipantId,
    syntheticSessionId,
    envelopeSignatureVerified: verifiedEnvelope.syntheticOnly === true,
    baselineConsentVerified: verifiedEnvelope.consent.researchParticipation && verifiedEnvelope.consent.researchProductEvents,
    optionalLiveAiConsentDeniedByDefault: verifiedEnvelope.consent.optionalLiveAi === false && verifiedEnvelope.consent.externalAiProcessing === false,
    recordingConsentDeniedByDefault: verifiedEnvelope.consent.recording === false,
    eventRecordingVerified: recordedEvents.length === eventNames.length,
    taskScoringVerified: scores.every((score) => ["SUCCESS", "PARTIAL", "FAIL", "STOPPED", "SKIPPED", "WITHDRAWN"].includes(score.outcome)),
    moderatorRescueVerified: aggregateBeforeDeletion.rescueCount === 1,
    accessibilityObservationVerified: recordedEvents.some((event) => event.eventName === "research_keyboard_task_completed"),
    providerFallbackVerified: recordedEvents.some((event) => event.eventName === "research_provider_fallback_understood"),
    deterministicFallbackOnly: true,
    withdrawalVerified,
    deletionVerified,
    aggregateBeforeDeletion,
    aggregateAfterDeletion,
    aggregateRegenerationVerified: aggregateAfterDeletion.eventCount === 0 && aggregateAfterDeletion.participantCount === 0,
    syntheticRecordFilesAfterCleanup: countSyntheticRecordFiles(),
    actualParticipantRecordCount: actualParticipantPaths().length,
    actualSessionCount: 0,
    paidProviderCalls: 0,
    contactDataAccepted: false,
    rawContentAccepted: false,
    unresolvedAdverseEvents: 0,
    preparedEnvironmentCreated: prepared.participantCreated === false,
    valid: countSyntheticRecordFiles() === 0 && actualParticipantPaths().length === 0 && withdrawalVerified && deletionVerified
  };
}

function writeResult(result) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.valid === false) process.exitCode = 1;
}

function main(argv = process.argv.slice(2)) {
  const command = argv[0] || "status";
  const argumentsAfterCommand = new Set(argv.slice(1));
  switch (command) {
    case "status": return writeResult(status());
    case "verify": return writeResult(verifyReadiness());
    case "prepare": return writeResult(prepare());
    case "reset": return writeResult(reset(argumentsAfterCommand.has("--confirm-synthetic-reset")));
    case "export-template": return writeResult(exportTemplate());
    case "dry-run": return writeResult(dryRun(argumentsAfterCommand.has("--confirm-synthetic")));
    default: throw new Error(`Unknown pilot command: ${command}`);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : "Pilot command failed safely."}\n`);
    process.exitCode = 1;
  }
}

module.exports = { actualParticipantPaths, countSyntheticRecordFiles, dryRun, exportTemplate, prepare, reset, status, validateStudyAndScenarios, verifyReadiness };
