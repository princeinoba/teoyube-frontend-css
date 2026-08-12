"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {
  createVercelBypassAdapter,
  runControlledSecretLifecycle,
} = require("./preview-bypass-lifecycle.cjs");
const runner = require("./preview-grounded-live-ai-resumable-runner.cjs");
const {
  ROOT_CAUSE_CLASSIFICATIONS,
  assertSanitizedRuntimeEvidence,
  assertSanitizedTrace,
  rootCauseClassification,
  traceLegacyForbiddenClaims,
} = require("./preview-grounded-live-ai-forbidden-claim-trace.cjs");

const AUTHORIZATION_ID = "TEOYUBE-AUG21-LIVE-AI-DIAGNOSTIC-422-ENVELOPE-2026-08-12-001";
const CASE_ID = "public-james-wisdom";
const SPENT_OR_RESERVED_USD = 0.047934;
const DIAGNOSTIC_SAMPLE_RESERVE_USD = 0.01081;
const MAXIMUM_DIAGNOSTIC_SAMPLES = 3;
const DIAGNOSTIC_CEILING_USD = 0.04;
const FINAL_EVALUATION_RESERVE_USD = 0.12972;
const AUTHORIZATION_ADDITIONAL_CEILING_USD = 0.18;
const CUMULATIVE_CEILING_USD = 0.25;
const DIAGNOSTIC_ARTIFACT_PATH = path.resolve(".tmp/preview-grounded-live-ai/evidence-envelope-diagnostic.json");
const APPLICATION_CLASSIFICATIONS = Object.freeze([
  "APPLICATION_RESULT_200",
  "APPLICATION_RESULT_422_EVIDENCE_AVAILABLE",
  "APPLICATION_RESULT_422_EVIDENCE_INSUFFICIENT",
  "TRANSPORT_OR_AUTH_FAILURE",
  "PROVIDER_FAILURE",
  "DIAGNOSTIC_PARSER_FAILURE",
]);
const PROVIDER_FAILURE_REASONS = new Set([
  "OPENAI_API_ERROR", "OPENAI_REFUSAL", "OPENAI_INCOMPLETE_MAX_OUTPUT",
  "OPENAI_INCOMPLETE_CONTENT_FILTER", "STRUCTURED_OUTPUT_MISSING",
  "STRUCTURED_OUTPUT_SCHEMA_INVALID", "LATENCY_TIMEOUT", "COST_CIRCUIT_OPEN",
  "RETRIEVAL_UNAVAILABLE", "EXACT_WEB_HYDRATION_FAILURE", "UNKNOWN_FALLBACK",
]);
const EVIDENCE_REASON_CODES = new Set([
  "THEOLOGICAL_RULE_VIOLATION", "OUTPUT_MODERATION_REJECTION",
  "MODEL_SCRIPTURE_GENERATION_REJECTION", "CITATION_EMPTY", "CITATION_NOT_ALLOWED",
  "CITATION_NOT_RETRIEVED", "INPUT_MODERATION_REJECTION",
]);

function assert(condition, code) {
  if (!condition) throw new Error(code);
}

function code(value, fallback = "NONE") {
  const candidate = typeof value === "string" && value.trim() ? value : fallback;
  return candidate.toUpperCase().replace(/[^A-Z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || fallback;
}

function roundUsd(value) {
  return Math.round((Number(value) + Number.EPSILON) * 1_000_000) / 1_000_000;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function fixture() {
  const bytes = fs.readFileSync(runner.DATASET_PATH);
  assert(sha256(bytes) === runner.DATASET_SHA256, "LOCKED_DATASET_HASH_MISMATCH");
  const dataset = JSON.parse(bytes.toString("utf8"));
  const selected = dataset.cases.find((item) => item.id === CASE_ID);
  assert(selected, "DIAGNOSTIC_CASE_MISSING");
  return Object.freeze(selected);
}

function datasetDefect(selected) {
  if (!Array.isArray(selected.forbiddenPhrases) || selected.forbiddenPhrases.length === 0) return true;
  const normalized = selected.forbiddenPhrases.map((item) => String(item).trim().toLocaleLowerCase("en-US"));
  const query = typeof selected.request?.query === "string" ? selected.request.query.toLocaleLowerCase("en-US") : "";
  return normalized.some((item) => !item) || new Set(normalized).size !== normalized.length ||
    (query.length > 0 && normalized.some((item) => query.includes(item)));
}

function requestContract(deploymentUrl = runner.targetFromEnvironment().deploymentUrl) {
  const requestTarget = new URL("/api/teoyube/preview-grounded-live-ai", deploymentUrl);
  const inspectedOrigin = new URL(deploymentUrl).origin;
  assert(requestTarget.origin === inspectedOrigin, "REQUEST_ORIGIN_MISMATCH");
  const headers = new Headers({ "content-type": "application/json", origin: requestTarget.origin });
  assert(headers.get("origin") === inspectedOrigin, "REQUEST_ORIGIN_MISSING");
  assert(!inspectedOrigin.endsWith("/"), "REQUEST_ORIGIN_TRAILING_SLASH");
  assert(!headers.has("host"), "REQUEST_HOST_OVERRIDE_REJECTED");
  return Object.freeze({
    requestTarget: requestTarget.toString(), origin: inspectedOrigin,
    originPresent: true, originIsNull: false, originHasTrailingSlash: false,
    hostHeaderOverridden: false, redirectMode: "error",
    bypassCredentialScope: "VERCEL_PREVIEW_REQUEST_ONLY",
    bypassEligibleForProviderHeaders: false, bypassEligibleForLogs: false,
    bypassEligibleForArtifacts: false,
  });
}

function providerCallClassification(counts) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (total === 0) return "NONE";
  if (counts.embedding === 1 && counts.vector === 1 && counts.generation === 1 && counts.outputModeration === 1) return "EMBEDDING_VECTOR_GENERATION_AND_MODERATION";
  return "PARTIAL_PROVIDER_PIPELINE";
}

function sanitizedApplicationResult(selected, response, classification, trace, rootClassification) {
  const body = response.body;
  const diagnostic = body && typeof body.diagnostic === "object" && !Array.isArray(body.diagnostic) ? body.diagnostic : {};
  const counts = runner.providerCounts(body?.providerCalls);
  const usage = runner.tokenCounts(body?.usage);
  const estimatedCost = Number.isFinite(body?.usage?.estimatedCostUsd)
    ? roundUsd(Math.max(0, body.usage.estimatedCostUsd) + (counts.embedding > 0 ? 0.00001 : 0))
    : counts.embedding > 0 ? 0.00001 : 0;
  return Object.freeze({
    classification,
    httpStatus: response.status,
    caseId: selected.id,
    applicationReason: code(diagnostic.fallbackReason || body?.reason),
    pipelineStage: code(diagnostic.pipelineStage, "UNKNOWN"),
    responseStatus: code(diagnostic.responseStatus, body?.ok === true ? "COMPLETED" : "FAILED"),
    validatorRuleId: code(diagnostic.validatorRuleId),
    rootCauseClassification: rootClassification,
    sufficientForClassification: rootClassification !== ROOT_CAUSE_CLASSIFICATIONS.unresolved,
    providerCallCountClassification: providerCallClassification(counts),
    providerCalls: counts,
    tokenUsage: usage,
    costUsd: estimatedCost,
    matchTrace: Object.freeze(trace),
  });
}

function interpretDiagnosticResponse(selected, response) {
  assert(response && Number.isInteger(response.status), "DIAGNOSTIC_RESPONSE_SHAPE_REJECTED");
  if (response.status === 401 || response.status === 403 || (response.status >= 300 && response.status < 400)) {
    return sanitizedApplicationResult(selected, { ...response, body: {} }, "TRANSPORT_OR_AUTH_FAILURE", [], ROOT_CAUSE_CLASSIFICATIONS.unresolved);
  }
  if (response.status === 429 || response.status >= 500) {
    return sanitizedApplicationResult(selected, { ...response, body: {} }, "PROVIDER_FAILURE", [], ROOT_CAUSE_CLASSIFICATIONS.unresolved);
  }
  const body = response.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return sanitizedApplicationResult(selected, { ...response, body: {} }, "DIAGNOSTIC_PARSER_FAILURE", [], ROOT_CAUSE_CLASSIFICATIONS.unresolved);
  }
  if (response.status === 200) {
    if (body.ok !== true || !body.response || typeof body.response !== "object") {
      return sanitizedApplicationResult(selected, response, "DIAGNOSTIC_PARSER_FAILURE", [], ROOT_CAUSE_CLASSIFICATIONS.unresolved);
    }
    const trace = assertSanitizedTrace(traceLegacyForbiddenClaims({
      fixture: selected, response: body.response, runtimeValidatorResult: "PASS",
    }));
    const rootClassification = rootCauseClassification(trace, datasetDefect(selected));
    return sanitizedApplicationResult(selected, response, "APPLICATION_RESULT_200", trace, rootClassification);
  }
  if (response.status === 422) {
    if (body.ok !== false || body.persisted !== false) {
      return sanitizedApplicationResult(selected, response, "APPLICATION_RESULT_422_EVIDENCE_INSUFFICIENT", [], ROOT_CAUSE_CLASSIFICATIONS.unresolved);
    }
    const diagnostic = body.diagnostic;
    if (!diagnostic || typeof diagnostic !== "object" || Array.isArray(diagnostic)) {
      return sanitizedApplicationResult(selected, response, "APPLICATION_RESULT_422_EVIDENCE_INSUFFICIENT", [], ROOT_CAUSE_CLASSIFICATIONS.unresolved);
    }
    const reason = code(diagnostic.fallbackReason || body.reason);
    if (PROVIDER_FAILURE_REASONS.has(reason)) {
      return sanitizedApplicationResult(selected, response, "PROVIDER_FAILURE", [], ROOT_CAUSE_CLASSIFICATIONS.unresolved);
    }
    const trace = assertSanitizedRuntimeEvidence(diagnostic.forbiddenClaimEvidence || []);
    const validatorRuleId = code(diagnostic.validatorRuleId);
    const evidenceAvailable = trace.length > 0 ||
      (EVIDENCE_REASON_CODES.has(reason) && validatorRuleId !== "NONE" && validatorRuleId !== "UNKNOWN_THEOLOGICAL_RULE");
    const rootClassification = rootCauseClassification(trace, datasetDefect(selected));
    return sanitizedApplicationResult(
      selected,
      response,
      evidenceAvailable ? "APPLICATION_RESULT_422_EVIDENCE_AVAILABLE" : "APPLICATION_RESULT_422_EVIDENCE_INSUFFICIENT",
      trace,
      rootClassification,
    );
  }
  return sanitizedApplicationResult(selected, response, "TRANSPORT_OR_AUTH_FAILURE", [], ROOT_CAUSE_CLASSIFICATIONS.unresolved);
}

async function diagnose(credential, signal, fetchImpl = fetch, target = runner.targetFromEnvironment(), sampleOrdinal = 1) {
  const selected = fixture();
  const contract = requestContract(target.deploymentUrl);
  const response = await runner.requestJson({
    credential,
    deploymentUrl: new URL(contract.requestTarget).origin,
    route: new URL(contract.requestTarget).pathname,
    options: {
      method: "POST",
      headers: { "content-type": "application/json", origin: contract.origin },
      body: JSON.stringify(runner.bodyFor(selected)),
      redirect: contract.redirectMode,
    },
    parentSignal: signal,
    requestTimeoutMs: runner.MAXIMUM_REQUEST_MS,
    fetchImpl,
    caseId: selected.id,
    caseOrdinal: sampleOrdinal,
  });
  return interpretDiagnosticResponse(selected, response);
}

function failureOutcome(error, sampleOrdinal) {
  const reasonCode = code(error?.code || error?.message, "DIAGNOSTIC_FAILED");
  let classification = "DIAGNOSTIC_PARSER_FAILURE";
  if (["TRANSPORT_OR_AUTH_FAILURE", "UNEXPECTED_REDIRECT_RESPONSE", "NETWORK_REQUEST_FAILURE"].includes(reasonCode)) classification = "TRANSPORT_OR_AUTH_FAILURE";
  if (reasonCode === "PROVIDER_FAILURE") classification = "PROVIDER_FAILURE";
  assert(APPLICATION_CLASSIFICATIONS.includes(classification), "FAILURE_CLASSIFICATION_REJECTED");
  return Object.freeze({ sampleOrdinal, classification, reasonCode, httpStatus: Math.max(0, Number(error?.details?.httpStatus || 0)) });
}

async function runDiagnosticSequence(credential, signal, target, fetchImpl = fetch) {
  const outcomes = [];
  for (let sampleOrdinal = 1; sampleOrdinal <= MAXIMUM_DIAGNOSTIC_SAMPLES; sampleOrdinal += 1) {
    const projectedDiagnostic = roundUsd(sampleOrdinal * DIAGNOSTIC_SAMPLE_RESERVE_USD);
    assert(projectedDiagnostic <= DIAGNOSTIC_CEILING_USD, "DIAGNOSTIC_COST_CEILING_FAILED");
    assert(projectedDiagnostic + FINAL_EVALUATION_RESERVE_USD <= AUTHORIZATION_ADDITIONAL_CEILING_USD, "ADDITIONAL_COST_CEILING_FAILED");
    assert(SPENT_OR_RESERVED_USD + projectedDiagnostic + FINAL_EVALUATION_RESERVE_USD <= CUMULATIVE_CEILING_USD, "CUMULATIVE_COST_CEILING_FAILED");
    let outcome;
    try {
      outcome = await diagnose(credential, signal, fetchImpl, target, sampleOrdinal);
    } catch (error) {
      outcomes.push(failureOutcome(error, sampleOrdinal));
      return Object.freeze({ status: "FAIL_CLOSED", stopReason: outcomes.at(-1).classification, sampleCount: outcomes.length, outcomes: Object.freeze(outcomes), diagnosticReservedUsd: projectedDiagnostic });
    }
    outcomes.push(Object.freeze({ sampleOrdinal, ...outcome }));
    if (["TRANSPORT_OR_AUTH_FAILURE", "PROVIDER_FAILURE", "DIAGNOSTIC_PARSER_FAILURE"].includes(outcome.classification)) {
      return Object.freeze({ status: "FAIL_CLOSED", stopReason: outcome.classification, sampleCount: outcomes.length, outcomes: Object.freeze(outcomes), diagnosticReservedUsd: projectedDiagnostic });
    }
    if (outcome.sufficientForClassification) {
      return Object.freeze({ status: "PASS", stopReason: "SUFFICIENT_CLASSIFICATION", sampleCount: outcomes.length, outcomes: Object.freeze(outcomes), rootCauseClassification: outcome.rootCauseClassification, diagnosticReservedUsd: projectedDiagnostic });
    }
  }
  return Object.freeze({ status: "FAIL_CLOSED", stopReason: "DIAGNOSTIC_CLASSIFICATION_UNRESOLVED_AFTER_THREE_SAMPLES", sampleCount: outcomes.length, outcomes: Object.freeze(outcomes), diagnosticReservedUsd: roundUsd(MAXIMUM_DIAGNOSTIC_SAMPLES * DIAGNOSTIC_SAMPLE_RESERVE_USD) });
}

async function main() {
  const target = runner.targetFromEnvironment();
  const lifecycle = await runControlledSecretLifecycle(
    createVercelBypassAdapter(runner.PROJECT),
    (credential, signal) => runDiagnosticSequence(credential, signal, target),
    { deadlineMs: 150_000 },
  );
  const report = Object.freeze({
    authorizationId: AUTHORIZATION_ID,
    deploymentId: target.deploymentId,
    previewUrl: target.deploymentUrl,
    testedRuntimeSha: target.runtimeSha,
    datasetSha256: runner.DATASET_SHA256,
    ...lifecycle.verification,
    bypassCreated: 1,
    bypassRevoked: 1,
    finalActiveBypassCount: lifecycle.cleanup.activeCount,
    spentOrReservedBeforeAuthorizationUsd: SPENT_OR_RESERVED_USD,
    finalEvaluationReserveUsd: FINAL_EVALUATION_RESERVE_USD,
    rawQueryStored: false,
    rawResponseStored: false,
    persisted: false,
  });
  runner.writeAtomic(DIAGNOSTIC_ARTIFACT_PATH, report);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.status !== "PASS") process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    const reasonCode = code(error instanceof Error ? error.message : "DIAGNOSTIC_FAILED", "DIAGNOSTIC_FAILED");
    process.stderr.write(`${JSON.stringify({ status: "FAIL_CLOSED", reasonCode })}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  APPLICATION_CLASSIFICATIONS, AUTHORIZATION_ADDITIONAL_CEILING_USD,
  AUTHORIZATION_ID, CASE_ID, CUMULATIVE_CEILING_USD, DIAGNOSTIC_CEILING_USD,
  DIAGNOSTIC_SAMPLE_RESERVE_USD, FINAL_EVALUATION_RESERVE_USD,
  MAXIMUM_DIAGNOSTIC_SAMPLES, SPENT_OR_RESERVED_USD, datasetDefect, diagnose,
  fixture, interpretDiagnosticResponse, requestContract, runDiagnosticSequence,
};