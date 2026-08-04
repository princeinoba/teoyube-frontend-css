"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const TOOLKIT_VERSION = "teoyube-stabilization-toolkit-1.0.0";
const POLICY_VERSION = "teoyube-stabilization-policy-1.0.0";
const SESSION_SCHEMA_VERSION = "teoyube-stabilization-session-1.0.0";
const INCIDENT_SCHEMA_VERSION = "teoyube-stabilization-incident-1.0.0";
const MINIMUM_DAYS = 7;
const MINIMUM_SESSIONS = 10;

const CAPABILITIES = Object.freeze([
  "today_guided_loop",
  "search",
  "promise_search",
  "canon",
  "promise_table",
  "daily_word",
  "prayer",
  "calling_compass",
  "journey",
  "journal_reflection",
  "testimony_candidate",
  "book_of_the_saint",
  "lexicon",
  "teo_guide_deterministic",
  "live_ai_local_preview_consent",
  "hybrid_retrieval_local_preview",
  "memory_inspection",
  "memory_export",
  "memory_deletion",
  "consent_revocation",
  "browser_restart_journey_resume",
  "next_restart",
  "static_rollback",
  "return_static_to_next",
  "runtime_verify",
  "recovery_verify"
]);

const ROUTES = Object.freeze([
  "/",
  "/book",
  "/calling-compass",
  "/canon",
  "/consent",
  "/daily-word",
  "/embedded-videos",
  "/explore",
  "/journal",
  "/journey",
  "/lexicon",
  "/personalization",
  "/prayer",
  "/privacy",
  "/profile",
  "/promise-search",
  "/promise-table",
  "/search",
  "/settings",
  "/tables",
  "/teo-guide",
  "/terms",
  "/testimony"
]);

const KNOWN_BLOCKER_IDS = Object.freeze([
  "STAB-BLOCKER-CANON-FOCUS",
  "STAB-BLOCKER-CALLING-PERF",
  "STAB-BLOCKER-CSS-BUDGET",
  "STAB-BLOCKER-PERF-EVIDENCE"
]);

const PROHIBITED_FIELD_KEYS = Object.freeze([
  "prayertext",
  "journaltext",
  "testimonytext",
  "checkintext",
  "reflectiontext",
  "memorytext",
  "healthdetails",
  "traumadetails",
  "abusedetails",
  "relationshipdetails",
  "crisisdetails",
  "apikey",
  "accesstoken",
  "sessiontoken",
  "rawprompt",
  "rawmodelresponse"
]);

const SECRET_PATTERNS = Object.freeze([
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[oprsu]_[A-Za-z0-9]{20,}\b/,
  /\bBearer\s+[A-Za-z0-9._~+\/-]{16,}\b/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:OPENAI_API_KEY|API_KEY|ACCESS_TOKEN|SESSION_TOKEN|PASSWORD)\s*[:=]\s*\S+/i,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
]);

const SESSION_FIELDS = Object.freeze([
  "schemaVersion",
  "sessionId",
  "ownerConfirmed",
  "startedAt",
  "endedAt",
  "calendarDate",
  "runtime",
  "browser",
  "viewport",
  "routes",
  "capabilities",
  "actions",
  "expectedOutcome",
  "actualOutcome",
  "result",
  "issueIds",
  "blockerObservations",
  "restartRequired",
  "rollbackExercised",
  "returnToNextVerified",
  "citationIssue",
  "memoryOrConsentIssue",
  "visualIssue",
  "safetyIssue",
  "dataLossIssue",
  "crossUserIssue",
  "safeErrorCodes",
  "notes",
  "sensitiveContentIncluded",
  "recordedBy",
  "automated",
  "createdAt",
  "recordHash"
]);

const INCIDENT_FIELDS = Object.freeze([
  "schemaVersion",
  "incidentId",
  "sessionId",
  "occurredAt",
  "route",
  "capability",
  "summary",
  "severity",
  "safeErrorCode",
  "reproductionSteps",
  "expectedBehavior",
  "actualBehavior",
  "visualImpact",
  "dataImpact",
  "securityPrivacyImpact",
  "scriptureCitationImpact",
  "safetyImpact",
  "workaround",
  "restartResult",
  "rollbackResult",
  "status",
  "resolutionCommit",
  "ownerConfirmed",
  "dataLoss",
  "crossUserAccess",
  "citationCorruption",
  "unsafeGuidance",
  "protectedVisualRegression",
  "criticalRuntimeFailure",
  "sensitiveContentIncluded",
  "reportedBy",
  "createdAt",
  "updatedAt",
  "recordHash"
]);

function compareOrdinal(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort(compareOrdinal)
        .map((key) => [key, stableValue(value[key])])
    );
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hashRecord(record) {
  const hashable = Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== "recordHash")
  );
  return sha256(stableStringify(hashable));
}

function normalizeFieldAlias(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function assertPrivacySafe(value, location = "record") {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertPrivacySafe(entry, `${location}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      if (PROHIBITED_FIELD_KEYS.includes(normalizeFieldAlias(key))) {
        throw new Error(`Prohibited field at ${location}.`);
      }
      assertPrivacySafe(entry, `${location}.${key}`);
    }
    return;
  }
  if (typeof value === "string" && SECRET_PATTERNS.some((pattern) => pattern.test(value))) {
    throw new Error(`Recognizable secret or personal identifier at ${location}.`);
  }
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function assertExactFields(value, fields, label, allowMissingRecordHash) {
  assertPlainObject(value, label);
  const allowed = new Set(fields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length) throw new Error(`${label} contains unknown fields.`);
  const missing = fields.filter(
    (key) => !(key in value) && !(allowMissingRecordHash && key === "recordHash")
  );
  if (missing.length) throw new Error(`${label} is missing required fields.`);
}

function assertText(value, label, { min = 0, max = 2000 } = {}) {
  if (typeof value !== "string" || value.length < min || value.length > max) {
    throw new Error(`${label} must contain ${min}-${max} characters.`);
  }
}

function assertBoolean(value, label, expected) {
  if (typeof value !== "boolean" || (expected !== undefined && value !== expected)) {
    throw new Error(`${label} has an invalid boolean value.`);
  }
}

function assertIsoTimestamp(value, label) {
  assertText(value, label, { min: 20, max: 40 });
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new Error(`${label} must be an ISO timestamp with a timezone.`);
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) throw new Error(`${label} is not a valid timestamp.`);
  return timestamp;
}

function assertCalendarDate(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must be YYYY-MM-DD.`);
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} is not a valid calendar date.`);
  }
}

function assertIdentifier(value, label, prefix) {
  assertText(value, label, { min: prefix.length + 2, max: 80 });
  if (!new RegExp(`^${prefix}[A-Z0-9_-]+$`).test(value)) {
    throw new Error(`${label} has an invalid identifier format.`);
  }
}

function assertStringArray(value, label, { allowed, min = 0, max = 100, pattern } = {}) {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    throw new Error(`${label} must contain ${min}-${max} entries.`);
  }
  if (value.some((entry) => typeof entry !== "string")) {
    throw new Error(`${label} must contain strings only.`);
  }
  if (new Set(value).size !== value.length) throw new Error(`${label} contains duplicate entries.`);
  if (allowed && value.some((entry) => !allowed.includes(entry))) {
    throw new Error(`${label} contains an unsupported value.`);
  }
  if (pattern && value.some((entry) => !pattern.test(entry))) {
    throw new Error(`${label} contains an invalid value.`);
  }
}

function validateAction(action, index, session) {
  const label = `actions[${index}]`;
  const fields = [
    "actionId",
    "capability",
    "route",
    "expectedBehavior",
    "actualBehavior",
    "result",
    "safeErrorCode",
    "automated"
  ];
  assertExactFields(action, fields, label, false);
  assertText(action.actionId, `${label}.actionId`, { min: 1, max: 80 });
  if (!/^[A-Za-z0-9_-]+$/.test(action.actionId)) throw new Error(`${label}.actionId is invalid.`);
  if (!CAPABILITIES.includes(action.capability) || !session.capabilities.includes(action.capability)) {
    throw new Error(`${label}.capability is invalid or absent from the session.`);
  }
  if (!ROUTES.includes(action.route) || !session.routes.includes(action.route)) {
    throw new Error(`${label}.route is invalid or absent from the session.`);
  }
  assertText(action.expectedBehavior, `${label}.expectedBehavior`, { min: 1, max: 500 });
  assertText(action.actualBehavior, `${label}.actualBehavior`, { min: 1, max: 500 });
  if (!["pass", "issue_found", "blocked", "skipped"].includes(action.result)) {
    throw new Error(`${label}.result is invalid.`);
  }
  if (action.safeErrorCode !== null) {
    assertText(action.safeErrorCode, `${label}.safeErrorCode`, { min: 1, max: 80 });
    if (!/^[A-Z0-9_-]+$/.test(action.safeErrorCode)) {
      throw new Error(`${label}.safeErrorCode is invalid.`);
    }
  }
  assertBoolean(action.automated, `${label}.automated`, false);
}

function validateSessionRecord(input, { allowMissingRecordHash = false } = {}) {
  assertPrivacySafe(input);
  assertExactFields(input, SESSION_FIELDS, "session", allowMissingRecordHash);
  if (input.schemaVersion !== SESSION_SCHEMA_VERSION) throw new Error("Session schema version is invalid.");
  assertIdentifier(input.sessionId, "session.sessionId", "STAB-SESSION-");
  assertBoolean(input.ownerConfirmed, "session.ownerConfirmed", true);
  const startedAt = assertIsoTimestamp(input.startedAt, "session.startedAt");
  const endedAt = assertIsoTimestamp(input.endedAt, "session.endedAt");
  if (endedAt <= startedAt) throw new Error("session.endedAt must be after session.startedAt.");
  assertCalendarDate(input.calendarDate, "session.calendarDate");
  if (input.calendarDate !== input.startedAt.slice(0, 10)) {
    throw new Error("session.calendarDate must match the local date in session.startedAt.");
  }
  if (input.runtime !== "next-canonical") throw new Error("Session runtime must be next-canonical.");
  assertText(input.browser, "session.browser", { min: 2, max: 100 });
  assertText(input.viewport, "session.viewport", { min: 2, max: 100 });
  assertStringArray(input.routes, "session.routes", { allowed: ROUTES, min: 1, max: ROUTES.length });
  assertStringArray(input.capabilities, "session.capabilities", {
    allowed: CAPABILITIES,
    min: 1,
    max: CAPABILITIES.length
  });
  if (!Array.isArray(input.actions) || input.actions.length < 1 || input.actions.length > 100) {
    throw new Error("session.actions must contain 1-100 safe actions.");
  }
  input.actions.forEach((action, index) => validateAction(action, index, input));
  if (new Set(input.actions.map((action) => action.actionId)).size !== input.actions.length) {
    throw new Error("session.actions contains duplicate action IDs.");
  }
  assertText(input.expectedOutcome, "session.expectedOutcome", { min: 1, max: 1000 });
  assertText(input.actualOutcome, "session.actualOutcome", { min: 1, max: 1000 });
  if (!["pass", "issue_found", "blocked"].includes(input.result)) throw new Error("Session result is invalid.");
  assertStringArray(input.issueIds, "session.issueIds", {
    max: 100,
    pattern: /^[A-Z0-9_-]{2,80}$/
  });
  assertStringArray(input.blockerObservations, "session.blockerObservations", {
    allowed: KNOWN_BLOCKER_IDS,
    max: KNOWN_BLOCKER_IDS.length
  });
  [
    "restartRequired",
    "rollbackExercised",
    "returnToNextVerified",
    "citationIssue",
    "memoryOrConsentIssue",
    "visualIssue",
    "safetyIssue",
    "dataLossIssue",
    "crossUserIssue"
  ].forEach((field) => assertBoolean(input[field], `session.${field}`));
  assertStringArray(input.safeErrorCodes, "session.safeErrorCodes", {
    max: 100,
    pattern: /^[A-Z0-9_-]{2,80}$/
  });
  assertText(input.notes, "session.notes", { max: 2000 });
  assertBoolean(input.sensitiveContentIncluded, "session.sensitiveContentIncluded", false);
  if (input.recordedBy !== "owner") throw new Error("Session must be recorded by the owner.");
  assertBoolean(input.automated, "session.automated", false);
  assertIsoTimestamp(input.createdAt, "session.createdAt");
  const computedHash = hashRecord(input);
  if (!allowMissingRecordHash || input.recordHash !== undefined) {
    if (input.recordHash !== computedHash) throw new Error("Session record hash is invalid.");
  }
  return Object.freeze({ ...input, recordHash: computedHash });
}

function validateIncidentRecord(input, { allowMissingRecordHash = false } = {}) {
  assertPrivacySafe(input);
  assertExactFields(input, INCIDENT_FIELDS, "incident", allowMissingRecordHash);
  if (input.schemaVersion !== INCIDENT_SCHEMA_VERSION) throw new Error("Incident schema version is invalid.");
  assertIdentifier(input.incidentId, "incident.incidentId", "STAB-INCIDENT-");
  assertIdentifier(input.sessionId, "incident.sessionId", "STAB-SESSION-");
  assertIsoTimestamp(input.occurredAt, "incident.occurredAt");
  if (!ROUTES.includes(input.route)) throw new Error("Incident route is invalid.");
  if (!CAPABILITIES.includes(input.capability)) throw new Error("Incident capability is invalid.");
  assertText(input.summary, "incident.summary", { min: 1, max: 500 });
  if (!["informational", "low", "medium", "high", "critical"].includes(input.severity)) {
    throw new Error("Incident severity is invalid.");
  }
  assertText(input.safeErrorCode, "incident.safeErrorCode", { min: 1, max: 80 });
  if (!/^[A-Z0-9_-]+$/.test(input.safeErrorCode)) throw new Error("Incident safe error code is invalid.");
  assertStringArray(input.reproductionSteps, "incident.reproductionSteps", { min: 1, max: 20 });
  input.reproductionSteps.forEach((step, index) =>
    assertText(step, `incident.reproductionSteps[${index}]`, { min: 1, max: 300 })
  );
  [
    "expectedBehavior",
    "actualBehavior",
    "visualImpact",
    "dataImpact",
    "securityPrivacyImpact",
    "scriptureCitationImpact",
    "safetyImpact",
    "workaround",
    "restartResult",
    "rollbackResult"
  ].forEach((field) => assertText(input[field], `incident.${field}`, { max: 1000 }));
  if (!["open", "investigating", "resolved"].includes(input.status)) {
    throw new Error("Incident status is invalid.");
  }
  if (input.status === "resolved") {
    if (typeof input.resolutionCommit !== "string" || !/^[a-f0-9]{40}$/.test(input.resolutionCommit)) {
      throw new Error("A resolved incident requires an exact resolution commit.");
    }
  } else if (input.resolutionCommit !== null) {
    throw new Error("An unresolved incident cannot name a resolution commit.");
  }
  assertBoolean(input.ownerConfirmed, "incident.ownerConfirmed", true);
  [
    "dataLoss",
    "crossUserAccess",
    "citationCorruption",
    "unsafeGuidance",
    "protectedVisualRegression",
    "criticalRuntimeFailure"
  ].forEach((field) => assertBoolean(input[field], `incident.${field}`));
  assertBoolean(input.sensitiveContentIncluded, "incident.sensitiveContentIncluded", false);
  if (input.reportedBy !== "owner") throw new Error("Incident must be reported by the owner.");
  assertIsoTimestamp(input.createdAt, "incident.createdAt");
  if (input.updatedAt !== null) assertIsoTimestamp(input.updatedAt, "incident.updatedAt");
  const computedHash = hashRecord(input);
  if (!allowMissingRecordHash || input.recordHash !== undefined) {
    if (input.recordHash !== computedHash) throw new Error("Incident record hash is invalid.");
  }
  return Object.freeze({ ...input, recordHash: computedHash });
}

function resolveRecordPaths(root) {
  const storageRoot = path.resolve(root, ".var", "stabilization");
  return Object.freeze({
    storageRoot,
    sessions: path.join(storageRoot, "sessions"),
    incidents: path.join(storageRoot, "incidents"),
    exports: path.join(storageRoot, "exports")
  });
}

function readInputFile(inputPath) {
  if (typeof inputPath !== "string" || !inputPath.toLowerCase().endsWith(".json")) {
    throw new Error("A JSON input file path is required.");
  }
  const stat = fs.statSync(inputPath);
  if (!stat.isFile() || stat.size > 65_536) throw new Error("Input must be a JSON file no larger than 64 KiB.");
  return JSON.parse(fs.readFileSync(inputPath, "utf8"));
}

function writeJsonAtomically(target, value, { overwrite = false } = {}) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (!overwrite && fs.existsSync(target)) throw new Error("A record with this ID already exists.");
  if (overwrite) {
    fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8" });
    return;
  }
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  fs.renameSync(temporary, target);
}

function persistSession(root, draft) {
  const record = validateSessionRecord(draft, { allowMissingRecordHash: true });
  const locations = resolveRecordPaths(root);
  const target = path.join(locations.sessions, `${record.sessionId}.json`);
  writeJsonAtomically(target, record);
  return Object.freeze({ target, record });
}

function persistIncident(root, draft) {
  const record = validateIncidentRecord(draft, { allowMissingRecordHash: true });
  const locations = resolveRecordPaths(root);
  const target = path.join(locations.incidents, `${record.incidentId}.json`);
  let overwrite = false;
  if (fs.existsSync(target)) {
    const existing = validateIncidentRecord(JSON.parse(fs.readFileSync(target, "utf8")));
    if (existing.createdAt !== record.createdAt) {
      throw new Error("Incident updates must preserve the original createdAt timestamp.");
    }
    overwrite = true;
  }
  writeJsonAtomically(target, record, { overwrite });
  return Object.freeze({ target, record, updated: overwrite });
}

function readRecordDirectory(directory, validator) {
  if (!fs.existsSync(directory)) return [];
  const records = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .sort((left, right) => compareOrdinal(left.name, right.name))
    .map((entry) => validator(JSON.parse(fs.readFileSync(path.join(directory, entry.name), "utf8"))));
  return records;
}

function loadLocalRecords(root) {
  const locations = resolveRecordPaths(root);
  const sessions = readRecordDirectory(locations.sessions, validateSessionRecord);
  const incidents = readRecordDirectory(locations.incidents, validateIncidentRecord);
  const sessionIds = sessions.map((record) => record.sessionId);
  const incidentIds = incidents.map((record) => record.incidentId);
  if (new Set(sessionIds).size !== sessionIds.length) throw new Error("Duplicate session IDs were found.");
  if (new Set(incidentIds).size !== incidentIds.length) throw new Error("Duplicate incident IDs were found.");
  return Object.freeze({ sessions, incidents });
}

function addDays(calendarDate, amount) {
  const date = new Date(`${calendarDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function evaluateStabilization({ sessions, incidents, ownerCloseoutConfirmed = false }) {
  const calendarDays = [...new Set(sessions.map((record) => record.calendarDate))].sort(compareOrdinal);
  const coverageCompleted = [
    ...new Set(sessions.flatMap((record) => record.capabilities))
  ].sort(compareOrdinal);
  const coverageMissing = CAPABILITIES.filter((capability) => !coverageCompleted.includes(capability));
  const blockerObservationsCompleted = [
    ...new Set(sessions.flatMap((record) => record.blockerObservations))
  ].sort(compareOrdinal);
  const blockerObservationsMissing = KNOWN_BLOCKER_IDS.filter(
    (blocker) => !blockerObservationsCompleted.includes(blocker)
  );
  const openIncidents = incidents.filter((incident) => incident.status !== "resolved");
  const openIncidentsBySeverity = Object.fromEntries(
    ["informational", "low", "medium", "high", "critical"].map((severity) => [
      severity,
      openIncidents.filter((incident) => incident.severity === severity).length
    ])
  );
  const disqualifyingIncidents = openIncidents.filter(
    (incident) =>
      incident.severity === "critical" ||
      incident.dataLoss ||
      incident.crossUserAccess ||
      incident.citationCorruption ||
      incident.unsafeGuidance ||
      incident.protectedVisualRegression ||
      incident.criticalRuntimeFailure
  );
  const staticRollbackEvidence =
    coverageCompleted.includes("static_rollback") && sessions.some((session) => session.rollbackExercised);
  const returnToNextEvidence =
    coverageCompleted.includes("return_static_to_next") &&
    sessions.some((session) => session.returnToNextVerified);
  const runtimeVerificationEvidence = coverageCompleted.includes("runtime_verify");
  const recoveryVerificationEvidence = coverageCompleted.includes("recovery_verify");
  const criteria = Object.freeze({
    minimumCalendarDays: calendarDays.length >= MINIMUM_DAYS,
    minimumMeaningfulSessions: sessions.length >= MINIMUM_SESSIONS,
    requiredCapabilityCoverage: coverageMissing.length === 0,
    knownBlockerObservationCoverage: blockerObservationsMissing.length === 0,
    noDisqualifyingIncident: disqualifyingIncidents.length === 0,
    staticRollbackEvidence,
    returnToNextEvidence,
    runtimeVerificationEvidence,
    recoveryVerificationEvidence,
    ownerCloseoutConfirmed
  });
  const mechanicallyReady = Object.entries(criteria)
    .filter(([key]) => key !== "ownerCloseoutConfirmed")
    .every(([, value]) => value);
  let status = "WAITING_OWNER";
  if (disqualifyingIncidents.length) status = "BLOCKED_INCIDENT";
  else if (mechanicallyReady) status = "READY_FOR_CLOSEOUT";
  if (mechanicallyReady && ownerCloseoutConfirmed) status = "PASS";
  return Object.freeze({
    schemaVersion: "teoyube-stabilization-status-1.0.0",
    policyVersion: POLICY_VERSION,
    toolkitVersion: TOOLKIT_VERSION,
    status,
    calendarDaysRecorded: calendarDays.length,
    calendarDates: calendarDays,
    meaningfulSessionsRecorded: sessions.length,
    requiredCalendarDays: MINIMUM_DAYS,
    requiredMeaningfulSessions: MINIMUM_SESSIONS,
    coverageCompleted,
    coverageMissing,
    requiredCapabilityCount: CAPABILITIES.length,
    blockerObservationsCompleted,
    blockerObservationsMissing,
    openIncidentsBySeverity,
    openIncidentCount: openIncidents.length,
    disqualifyingIncidentCount: disqualifyingIncidents.length,
    knownPhase2aBlockers: KNOWN_BLOCKER_IDS,
    nextEligibleDate: calendarDays.length ? addDays(calendarDays[0], MINIMUM_DAYS - 1) : null,
    criteria,
    mechanicallyReady,
    ownerCloseoutRequired: true
  });
}

function statusFromLocalRecords(root) {
  return evaluateStabilization({ ...loadLocalRecords(root), ownerCloseoutConfirmed: false });
}

function verifyFromLocalRecords(root) {
  const status = statusFromLocalRecords(root);
  if (status.status === "READY_FOR_CLOSEOUT") {
    return Object.freeze({ passed: false, gateStatus: "WAITING_OWNER_CLOSEOUT", status });
  }
  return Object.freeze({ passed: false, gateStatus: status.status, status });
}

function exportRedactedAggregate(root) {
  const records = loadLocalRecords(root);
  const status = evaluateStabilization({ ...records, ownerCloseoutConfirmed: false });
  const aggregate = {
    schemaVersion: "teoyube-stabilization-export-1.0.0",
    policyVersion: POLICY_VERSION,
    toolkitVersion: TOOLKIT_VERSION,
    asOf: [...records.sessions, ...records.incidents]
      .map((record) => record.updatedAt || record.createdAt)
      .sort(compareOrdinal)
      .at(-1) || null,
    status,
    sessionRecordHashes: records.sessions.map((record) => record.recordHash).sort(compareOrdinal),
    incidentRecordHashes: records.incidents.map((record) => record.recordHash).sort(compareOrdinal)
  };
  const output = Object.freeze({ ...aggregate, aggregateHash: sha256(stableStringify(aggregate)) });
  const locations = resolveRecordPaths(root);
  const target = path.join(locations.exports, "stabilization-redacted-aggregate.json");
  writeJsonAtomically(target, output, { overwrite: true });
  return Object.freeze({ target, output });
}

module.exports = {
  CAPABILITIES,
  INCIDENT_SCHEMA_VERSION,
  KNOWN_BLOCKER_IDS,
  MINIMUM_DAYS,
  MINIMUM_SESSIONS,
  POLICY_VERSION,
  PROHIBITED_FIELD_KEYS,
  ROUTES,
  SESSION_SCHEMA_VERSION,
  TOOLKIT_VERSION,
  assertPrivacySafe,
  evaluateStabilization,
  exportRedactedAggregate,
  hashRecord,
  loadLocalRecords,
  persistIncident,
  persistSession,
  readInputFile,
  resolveRecordPaths,
  sha256,
  stableStringify,
  statusFromLocalRecords,
  validateIncidentRecord,
  validateSessionRecord,
  verifyFromLocalRecords
};
