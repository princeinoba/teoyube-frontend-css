import fieldPolicy from "../../../config/research-field-policy.json";
import { getResearchEventDefinition } from "./research-event-registry";
import {
  ResearchBoundaryError,
  type RecordResearchEventCommand,
  type ResearchEventRecord
} from "./research-contracts";

const prohibitedFields = new Set(fieldPolicy.prohibitedFields.map((field) => field.toLowerCase()));
const allowedRecordFields = new Set(fieldPolicy.allowedFields);
const prohibitedValuePatterns = fieldPolicy.prohibitedValuePatterns.map((pattern) => ({
  id: pattern.id,
  expression: new RegExp(pattern.expression, pattern.flags)
}));
const sourceIdPattern = new RegExp(fieldPolicy.sourceIdPattern);

const commandFields = new Set([
  "envelopeToken", "eventId", "eventName", "taskId", "timestamp", "route", "capability",
  "result", "completionStatus", "moderatorRescueCount", "safeIssueCode", "sourceIds",
  "scenarioId", "accessibilityMode", "rating", "durationBucket"
]);

const resultValues = new Set(["success", "partial", "failure", "withdrawn", "stopped", "not_applicable"]);
const completionValues = new Set(["started", "completed", "failed", "withdrawn", "deleted", "stopped"]);
const accessibilityValues = new Set(["not_volunteered", "keyboard", "screen_reader", "zoom_reflow", "reduced_motion", "multiple"]);
const durationValues = new Set(["under_30s", "30s_to_2m", "2m_to_5m", "over_5m", "not_measured"]);
const safeToken = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/;

function assertPlainObject(value: unknown, safeCode: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new ResearchBoundaryError(safeCode);
  }
}

function scanProhibited(value: unknown, path = "root"): void {
  if (Array.isArray(value)) {
    if (value.length > fieldPolicy.maximumArrayItems) {
      throw new ResearchBoundaryError("research_array_limit_exceeded");
    }
    value.forEach((item, index) => scanProhibited(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (prohibitedFields.has(key.toLowerCase())) {
        throw new ResearchBoundaryError("research_prohibited_field");
      }
      scanProhibited(nested, `${path}.${key}`);
    }
    return;
  }
  if (typeof value !== "string") return;
  if (path === "root.envelopeToken") {
    if (value.length < 64 || value.length > 2048 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) throw new ResearchBoundaryError("research_envelope_malformed");
    return;
  }
  if (/^root\.(?:schemaVersion|studyVersion|eventVersion|timestamp|eventHash|previousEventHash|deletionKey|eventId|studyId|participantId|sessionId|taskId|retentionClass)$/.test(path)
    || /^root\.(?:consentRecordIds|sourceIds)\[\d+\]$/.test(path)) {
    return;
  }
  if (value.length > fieldPolicy.maximumStringLength) {
    throw new ResearchBoundaryError("research_string_limit_exceeded");
  }
  for (const pattern of prohibitedValuePatterns) {
    pattern.expression.lastIndex = 0;
    if (pattern.expression.test(value)) {
      throw new ResearchBoundaryError(`research_prohibited_value_${pattern.id}_${path.replace(/[^A-Za-z0-9]+/g, "_")}`);
    }
  }
}

function assertKnownFields(value: Record<string, unknown>, allowed: ReadonlySet<string>): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new ResearchBoundaryError("research_unknown_field");
    }
  }
}

function assertToken(value: unknown, safeCode: string, nullable = false): void {
  if (nullable && value === null) return;
  if (typeof value !== "string" || !safeToken.test(value)) {
    throw new ResearchBoundaryError(safeCode);
  }
}

function assertStringArray(value: unknown, safeCode: string): asserts value is readonly string[] {
  if (!Array.isArray(value) || value.length > fieldPolicy.maximumArrayItems || value.some((item) => typeof item !== "string")) {
    throw new ResearchBoundaryError(safeCode);
  }
}

export function validateRecordResearchEventCommand(value: unknown): RecordResearchEventCommand {
  scanProhibited(value);
  assertPlainObject(value, "research_command_invalid");
  assertKnownFields(value, commandFields);
  const definition = getResearchEventDefinition(String(value.eventName ?? ""));

  for (const key of ["eventId", "eventName", "taskId", "route", "capability", "scenarioId", "durationBucket"]) {
    assertToken(value[key], `research_${key}_invalid`);
  }
  if (typeof value.timestamp !== "string" || !Number.isFinite(Date.parse(value.timestamp))) {
    throw new ResearchBoundaryError("research_timestamp_invalid");
  }
  if (!resultValues.has(String(value.result))) throw new ResearchBoundaryError("research_result_invalid");
  if (!completionValues.has(String(value.completionStatus))) throw new ResearchBoundaryError("research_completion_invalid");
  if (!accessibilityValues.has(String(value.accessibilityMode))) throw new ResearchBoundaryError("research_accessibility_mode_invalid");
  if (!durationValues.has(String(value.durationBucket))) throw new ResearchBoundaryError("research_duration_bucket_invalid");
  if (!Number.isInteger(value.moderatorRescueCount) || Number(value.moderatorRescueCount) < 0 || Number(value.moderatorRescueCount) > 20) {
    throw new ResearchBoundaryError("research_rescue_count_invalid");
  }
  assertToken(value.safeIssueCode, "research_issue_code_invalid", true);
  assertStringArray(value.sourceIds, "research_source_ids_invalid");
  if (value.sourceIds.some((sourceId) => !sourceIdPattern.test(sourceId))) {
    throw new ResearchBoundaryError("research_source_id_invalid");
  }
  if (value.rating !== null && (!Number.isInteger(value.rating) || Number(value.rating) < fieldPolicy.rating.minimum || Number(value.rating) > fieldPolicy.rating.maximum)) {
    throw new ResearchBoundaryError("research_rating_invalid");
  }
  if (definition.ratingRequired && value.rating === null) throw new ResearchBoundaryError("research_rating_required");
  if (!definition.ratingRequired && value.rating !== null) throw new ResearchBoundaryError("research_rating_not_allowed");

  return value as unknown as RecordResearchEventCommand;
}

export function validateResearchEventRecord(value: unknown): ResearchEventRecord {
  scanProhibited(value);
  assertPlainObject(value, "research_record_invalid");
  assertKnownFields(value, allowedRecordFields);
  if (value.schemaVersion !== "1.0.0") throw new ResearchBoundaryError("research_schema_version_invalid");
  getResearchEventDefinition(String(value.eventName ?? ""));
  for (const key of [
    "studyVersion", "eventId", "eventName", "eventVersion", "studyId", "participantId", "sessionId",
    "taskId", "route", "capability", "scenarioId", "retentionClass", "deletionKey", "cohort", "eventHash"
  ]) {
    assertToken(value[key], `research_record_${key}_invalid`);
  }
  assertToken(value.safeIssueCode, "research_record_issue_code_invalid", true);
  assertToken(value.previousEventHash, "research_record_previous_hash_invalid", true);
  assertStringArray(value.consentRecordIds, "research_record_consent_ids_invalid");
  assertStringArray(value.sourceIds, "research_record_source_ids_invalid");
  if (value.sourceIds.some((sourceId) => !sourceIdPattern.test(sourceId))) throw new ResearchBoundaryError("research_source_id_invalid");
  if (typeof value.timestamp !== "string" || !Number.isFinite(Date.parse(value.timestamp))) throw new ResearchBoundaryError("research_timestamp_invalid");
  return value as unknown as ResearchEventRecord;
}

export function assertNoProhibitedResearchData(value: unknown): void {
  scanProhibited(value);
}
