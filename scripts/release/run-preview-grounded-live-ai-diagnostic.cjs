"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  createVercelBypassAdapter,
  runSecretLifecycle,
} = require("./preview-bypass-lifecycle.cjs");
const {
  DATASET_PATH,
  DATASET_SHA256,
  PROJECT,
  bodyFor,
} = require("./run-preview-grounded-live-ai-canary.cjs");
const crypto = require("node:crypto");

const CASE_ID = "public-james-wisdom";
const PRIOR_RESERVED_COST_USD = 0.01081;
const DIAGNOSTIC_WORST_CASE_COST_USD = 0.01081;
const FINAL_EVALUATION_WORST_CASE_COST_USD = 0.12972;
const AUTHORIZATION_CEILING_USD = 0.25;
const DIAGNOSTIC_FIELDS = Object.freeze([
  "caseId",
  "pipelineStage",
  "fallbackReason",
  "providerCalled",
  "moderationCalled",
  "retrievalResultCount",
  "eligibleEvidenceCount",
  "responseStatus",
  "refusalPresent",
  "incompleteReason",
  "schemaValid",
  "citationCount",
  "unknownCitationCount",
  "validatorRuleId",
  "inputTokens",
  "outputTokens",
  "reasoningTokens",
  "latencyMs",
  "costUsd",
  "outputSha256",
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function lockedFixture() {
  const bytes = fs.readFileSync(DATASET_PATH);
  assert(sha256(bytes) === DATASET_SHA256, "Locked evaluation dataset hash mismatch.");
  const dataset = JSON.parse(bytes.toString("utf8"));
  const fixture = dataset.cases.find((item) => item.id === CASE_ID);
  assert(fixture, "The locked diagnostic fixture is absent.");
  return Object.freeze(fixture);
}

function sanitizedDiagnostic(value) {
  assert(value && typeof value === "object" && !Array.isArray(value), "Sanitized diagnostic envelope is absent.");
  const keys = Object.keys(value).sort();
  assert(
    JSON.stringify(keys) === JSON.stringify([...DIAGNOSTIC_FIELDS].sort()),
    "Diagnostic envelope contains an unexpected field.",
  );
  assert(value.caseId === CASE_ID, "Diagnostic case identity mismatch.");
  assert(typeof value.pipelineStage === "string" && /^[A-Z_]+$/.test(value.pipelineStage), "Invalid diagnostic stage.");
  assert(typeof value.fallbackReason === "string" && /^[A-Z_]+$/.test(value.fallbackReason), "Invalid diagnostic reason.");
  assert(typeof value.validatorRuleId === "string" && /^[A-Z0-9_]+$/.test(value.validatorRuleId), "Invalid diagnostic validator rule.");
  assert(value.outputSha256 === "none" || /^[a-f0-9]{64}$/.test(value.outputSha256), "Invalid diagnostic output hash.");
  const serialized = JSON.stringify(value);
  for (const forbidden of [
    "query",
    "prompt",
    "scriptureText",
    "responseText",
    "prayerText",
    "rawProviderResponse",
    "credential",
    "bypass",
    "environmentVariable",
  ]) assert(!serialized.includes(forbidden), `Forbidden diagnostic field or content marker: ${forbidden}.`);
  return Object.freeze({ ...value });
}

async function diagnose(credential, target) {
  const fixture = lockedFixture();
  const headers = new Headers({
    "content-type": "application/json",
    origin: target.deploymentUrl,
    "x-vercel-protection-bypass": credential,
  });
  const response = await fetch(
    `${target.deploymentUrl}/api/teoyube/preview-grounded-live-ai`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(bodyFor(fixture)),
      redirect: "follow",
      signal: AbortSignal.timeout(45_000),
    },
  );
  assert(response.status === 200 || response.status === 422, `Diagnostic request returned HTTP ${response.status}.`);
  const body = await response.json();
  const diagnostic = sanitizedDiagnostic(body.diagnostic);
  assert(
    body.reason !== "provider_authentication_failed" &&
      body.reason !== "approved_model_unavailable",
    "Diagnostic request reached an authentication or model-access hard stop.",
  );
  return Object.freeze({
    caseId: CASE_ID,
    httpStatus: response.status,
    diagnostic,
  });
}

async function main() {
  const target = Object.freeze({
    ...PROJECT,
    deploymentId: process.env.TEOYUBE_PREVIEW_DEPLOYMENT_ID,
    deploymentUrl: process.env.TEOYUBE_PREVIEW_DEPLOYMENT_URL,
    runtimeSha: process.env.TEOYUBE_PREVIEW_RUNTIME_SHA,
  });
  assert(target.deploymentId && /^dpl_/.test(target.deploymentId), "Preview deployment ID is required.");
  assert(target.deploymentUrl && /^https:\/\//.test(target.deploymentUrl), "Preview deployment URL is required.");
  assert(target.runtimeSha && /^[a-f0-9]{40}$/.test(target.runtimeSha), "Preview runtime SHA is required.");
  const conservativeCumulativeCostUsd =
    PRIOR_RESERVED_COST_USD +
    DIAGNOSTIC_WORST_CASE_COST_USD +
    FINAL_EVALUATION_WORST_CASE_COST_USD;
  assert(
    conservativeCumulativeCostUsd <= AUTHORIZATION_CEILING_USD,
    "The diagnostic request would exceed the cumulative owner ceiling.",
  );
  const lifecycle = await runSecretLifecycle(
    createVercelBypassAdapter(PROJECT),
    (credential) => diagnose(credential, target),
  );
  const report = Object.freeze({
    authorizationId: "TEOYUBE-AUG21-LIVE-AI-422-RECONCILIATION-2026-08-12-001",
    datasetSha256: DATASET_SHA256,
    deploymentId: target.deploymentId,
    previewUrl: target.deploymentUrl,
    testedRuntimeSha: target.runtimeSha,
    priorReservedCostUsd: PRIOR_RESERVED_COST_USD,
    diagnosticWorstCaseCostUsd: DIAGNOSTIC_WORST_CASE_COST_USD,
    finalEvaluationWorstCaseCostUsd: FINAL_EVALUATION_WORST_CASE_COST_USD,
    conservativeCumulativeCostUsd,
    ...lifecycle.verification,
    bypassCreated: 1,
    bypassRevoked: 1,
    revocationAttempts: lifecycle.cleanup.attempts,
    finalActiveBypassCount: lifecycle.cleanup.activeCount,
    rawQueriesStored: false,
    rawResponsesStored: false,
    persisted: false,
  });
  const output = path.resolve(".tmp/preview-grounded-live-ai/diagnostic.json");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  process.stdout.write(`${JSON.stringify({
    caseId: report.caseId,
    httpStatus: report.httpStatus,
    diagnostic: report.diagnostic,
    conservativeCumulativeCostUsd: report.conservativeCumulativeCostUsd,
    bypassCreated: report.bypassCreated,
    bypassRevoked: report.bypassRevoked,
    finalActiveBypassCount: report.finalActiveBypassCount,
  }, null, 2)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : "Preview diagnostic failed."}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  AUTHORIZATION_CEILING_USD,
  CASE_ID,
  DIAGNOSTIC_WORST_CASE_COST_USD,
  FINAL_EVALUATION_WORST_CASE_COST_USD,
  PRIOR_RESERVED_COST_USD,
  diagnose,
  sanitizedDiagnostic,
};
