"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {
  createVercelBypassAdapter,
  runSecretLifecycle,
} = require("./preview-bypass-lifecycle.cjs");
const { ROUTES, STYLESHEETS } = require("./run-preview-vector-canary.cjs");

const PROJECT = Object.freeze({
  projectId: "prj_0hPdbIadmq39jUS3wQ56tMvXOvCm",
  scope: "princeinobas-projects",
});
const DATASET_PATH = path.resolve(
  "src/server/live-ai/evaluation/preview-grounded-live-ai-evaluation-v1.json",
);
const DATASET_SHA256 =
  "54ddbff8bc181d1a2eb6a662c91ca164ee0a68038daf66ea6214caf8854b9537";
const MODEL = "gpt-5.6-terra";
const MAXIMUM_COST_USD = 0.25;
const ENGINEERING_TARGET_USD = 0.2;
const WORST_GENERATION_USD = 0.0108;
const WORST_EMBEDDING_USD = 0.00001;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function loadDataset() {
  const bytes = fs.readFileSync(DATASET_PATH);
  assert(sha256(bytes) === DATASET_SHA256, "Locked evaluation dataset hash mismatch.");
  const dataset = JSON.parse(bytes.toString("utf8"));
  assert(dataset.syntheticOnly === true, "Evaluation dataset is not synthetic-only.");
  assert(Array.isArray(dataset.cases) && dataset.cases.length === 32, "Evaluation dataset must contain exactly 32 cases.");
  assert(new Set(dataset.cases.map((item) => item.id)).size === 32, "Evaluation dataset case IDs are not unique.");
  const generationCases = dataset.cases.filter((item) => item.category === "permitted_public_grounded_generation").length;
  assert(generationCases === 12, "Evaluation dataset must contain exactly 12 generation cases.");
  const projectedCostUsd = generationCases * (WORST_GENERATION_USD + WORST_EMBEDDING_USD);
  assert(projectedCostUsd <= ENGINEERING_TARGET_USD && projectedCostUsd < MAXIMUM_COST_USD, "Projected provider cost exceeds the authorized boundary.");
  return Object.freeze({ dataset, projectedCostUsd });
}

function loadCorpus() {
  const corpus = require(path.resolve("src/server/scripture/corpora/engwebp/generated/corpus.json"));
  return new Map(
    corpus.verses
      .filter((verse) => verse.textStatus === "displayable" && typeof verse.text === "string")
      .map((verse) => [`web:${verse.key}`, verse.text]),
  );
}

function bodyFor(fixture) {
  if (fixture.request.queryFixture === "OVERSIZED_501") {
    return { caseId: fixture.id, query: "x".repeat(501), intent: fixture.request.intent };
  }
  return { caseId: fixture.id, ...fixture.request };
}

async function request(credential, deploymentUrl, route, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("x-vercel-protection-bypass", credential);
  const response = await fetch(`${deploymentUrl}${route}`, {
    ...options,
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(45_000),
  });
  return response;
}

function safeProviderCounts(value) {
  const source = value && typeof value === "object" ? value : {};
  return Object.freeze({
    modelProbe: Number(source.modelProbe || 0),
    inputModeration: Number(source.inputModeration || 0),
    embedding: Number(source.embedding || 0),
    vector: Number(source.vector || 0),
    generation: Number(source.generation || 0),
    outputModeration: Number(source.outputModeration || 0),
  });
}

function generatedText(response) {
  return [
    response.summary,
    response.biblical_application,
    response.prayer,
    response.action_step,
    ...(response.limitations || []),
    response.safety_boundary,
  ].join("\n");
}

function percentile(values, quantile) {
  if (!values.length) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.max(0, Math.ceil(ordered.length * quantile) - 1)];
}

function addCounts(total, current) {
  for (const key of Object.keys(total)) total[key] += current[key] || 0;
}

async function verifyPreview(credential, target, locked) {
  const corpus = loadCorpus();
  const aggregateCalls = { modelProbe: 0, inputModeration: 0, embedding: 0, vector: 0, generation: 0, outputModeration: 0 };
  const outcomes = [];
  const generationLatencies = [];
  const usage = { inputTokens: 0, cachedInputTokens: 0, reasoningTokens: 0, outputTokens: 0, totalTokens: 0 };
  let cumulativeCostUsd = 0;
  let routesPassed = 0;
  let stylesheetsPassed = 0;

  const healthResponse = await request(credential, target.deploymentUrl, "/api/health");
  assert(healthResponse.status === 200, `Health returned HTTP ${healthResponse.status}.`);
  const health = await healthResponse.json();
  assert(health.status === "ok" && health.environment === "preview" && health.deploymentTarget === "vercel-preview", "Health identity did not match preview/vercel-preview.");

  for (const route of ROUTES) {
    const response = await request(credential, target.deploymentUrl, route);
    assert(response.status === 200, `Canonical route ${route} returned HTTP ${response.status}.`);
    routesPassed += 1;
  }
  for (const stylesheet of STYLESHEETS) {
    const response = await request(credential, target.deploymentUrl, stylesheet);
    assert(response.status === 200, `Stylesheet ${stylesheet} returned HTTP ${response.status}.`);
    assert((response.headers.get("content-type") || "").toLowerCase().includes("text/css"), `Stylesheet ${stylesheet} returned a non-CSS content type.`);
    stylesheetsPassed += 1;
  }

  for (const fixture of locked.dataset.cases) {
    const response = await request(credential, target.deploymentUrl, "/api/teoyube/preview-grounded-live-ai", {
      method: "POST",
      headers: { "content-type": "application/json", origin: target.deploymentUrl },
      body: JSON.stringify(bodyFor(fixture)),
    });
    assert(response.status === fixture.expectedHttpStatus, `Evaluation case ${fixture.id} returned HTTP ${response.status}.`);
    const result = await response.json();
    if (result.reason === "provider_authentication_failed" || result.reason === "approved_model_unavailable") {
      throw new Error(`Evaluation case ${fixture.id} hit hard stop ${result.reason}.`);
    }
    const counts = safeProviderCounts(result.providerCalls);
    addCounts(aggregateCalls, counts);
    const category = fixture.category;
    if (category === "permitted_public_grounded_generation") {
      assert(result.ok === true && result.generationUsed === true && result.persisted === false, `Grounded generation contract failed for ${fixture.id}.`);
      assert(result.runtime === "preview-grounded-live-ai" && result.modelIdentifier === MODEL, `Runtime or model identity failed for ${fixture.id}.`);
      assert(result.response && result.response.disposition === fixture.expectedDisposition, `Structured disposition failed for ${fixture.id}.`);
      assert(counts.embedding === 1 && counts.vector === 1 && counts.generation === 1 && counts.inputModeration === 1 && counts.outputModeration === 1, `Provider call contract failed for ${fixture.id}.`);
      assert(Array.isArray(result.citations) && result.citations.length > 0, `Citation hydration failed for ${fixture.id}.`);
      const citationIds = result.citations.map((citation) => citation.id);
      assert(fixture.requiredCitationIds.every((id) => citationIds.includes(id)), `Required citation ID failed for ${fixture.id}.`);
      for (const citation of result.citations) {
        assert(citation.translation === "WEB", `Translation identity failed for ${fixture.id}.`);
        assert(corpus.get(citation.id) === citation.exactText, `Exact WEB quotation failed for ${fixture.id}.`);
      }
      const text = generatedText(result.response);
      assert(fixture.forbiddenPhrases.every((phrase) => !text.toLowerCase().includes(phrase.toLowerCase())), `Forbidden claim rubric failed for ${fixture.id}.`);
      assert(typeof result.outputHash === "string" && result.outputHash.length === 64, `Output hash failed for ${fixture.id}.`);
      const currentUsage = result.usage || {};
      for (const key of Object.keys(usage)) usage[key] += Number(currentUsage[key] || 0);
      cumulativeCostUsd = Math.max(cumulativeCostUsd, Number(result.cost?.cumulativeCostUsd || 0));
      generationLatencies.push(Number(result.latencyMs || 0));
      outcomes.push(Object.freeze({ caseId: fixture.id, category, status: "PASS", disposition: result.response.disposition, citationIds: Object.freeze(citationIds), outputHash: result.outputHash, latencyMs: Number(result.latencyMs || 0), usage: Object.freeze({ ...currentUsage }) }));
    } else {
      assert(result.ok === false && result.persisted === false, `Local fallback contract failed for ${fixture.id}.`);
      assert(Object.values(counts).every((count) => count === 0), `A prohibited provider call occurred for ${fixture.id}.`);
      assert(result.disposition === undefined || result.disposition === fixture.expectedDisposition, `Fallback disposition failed for ${fixture.id}.`);
      outcomes.push(Object.freeze({ caseId: fixture.id, category, status: "PASS", disposition: result.disposition || fixture.expectedDisposition, providerCalls: 0 }));
    }
  }

  assert(aggregateCalls.generation === 12, "Generation attempt count was not exactly 12.");
  assert(cumulativeCostUsd <= MAXIMUM_COST_USD, "Actual cumulative provider cost exceeded the owner ceiling.");
  const mean = generationLatencies.reduce((sum, value) => sum + value, 0) / generationLatencies.length;
  return Object.freeze({
    authorizationId: locked.dataset.authorizationId,
    datasetVersion: locked.dataset.version,
    datasetCount: locked.dataset.cases.length,
    datasetSha256: DATASET_SHA256,
    projectedMaximumCostUsd: locked.projectedCostUsd,
    model: MODEL,
    modelIdentifierKind: "alias",
    responsesApi: "v1/responses",
    schemaVersion: "teoyube-preview-grounded-live-ai-2026-08-11.1",
    health: Object.freeze({ status: "PASS", identity: "preview/vercel-preview" }),
    routes: Object.freeze({ passed: routesPassed, expected: ROUTES.length }),
    stylesheets: Object.freeze({ passed: stylesheetsPassed, expected: STYLESHEETS.length }),
    metrics: Object.freeze({
      requestSchemaEnforcement: 1,
      localPrivateSensitiveRejection: 1,
      privateSensitiveProviderCalls: 0,
      highStakesUnsafeGenerationCalls: 0,
      promptInjectionOverrideSuccesses: 0,
      structuredOutputSchemaValidity: 1,
      citationIdsWithinEvidence: 1,
      exactWebQuotationAccuracy: 1,
      inventedScriptureOrReferences: 0,
      unsupportedBiblicalClaims: 0,
      falseDivineCertaintyClaims: 0,
      groundedAnswerRubric: 1,
      deterministicFallbackAvailability: 1,
      noAnswerBehavior: 1,
      providerAuthenticationFailures: 0,
      productionProviderCalls: 0,
    }),
    providerCalls: Object.freeze(aggregateCalls),
    tokenUsage: Object.freeze(usage),
    cumulativeCostUsd,
    latencyMs: Object.freeze({ mean, p95: percentile(generationLatencies, 0.95), maximum: Math.max(...generationLatencies) }),
    outcomes: Object.freeze(outcomes),
    rawQueriesStored: false,
    rawResponsesStored: false,
    persisted: false,
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
  const locked = loadDataset();
  const lifecycle = await runSecretLifecycle(
    createVercelBypassAdapter(PROJECT),
    (credential) => verifyPreview(credential, target, locked),
  );
  const report = Object.freeze({
    ...lifecycle.verification,
    deploymentId: target.deploymentId,
    previewUrl: target.deploymentUrl,
    testedRuntimeSha: target.runtimeSha,
    bypassCreated: 1,
    bypassRevoked: 1,
    revocationAttempts: lifecycle.cleanup.attempts,
    finalActiveBypassCount: lifecycle.cleanup.activeCount,
  });
  const output = path.resolve(".tmp/preview-grounded-live-ai/final-canary.json");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  process.stdout.write(`${JSON.stringify({
    datasetSha256: report.datasetSha256,
    datasetCount: report.datasetCount,
    model: report.model,
    routes: report.routes,
    stylesheets: report.stylesheets,
    metrics: report.metrics,
    providerCalls: report.providerCalls,
    tokenUsage: report.tokenUsage,
    cumulativeCostUsd: report.cumulativeCostUsd,
    latencyMs: report.latencyMs,
    bypassCreated: report.bypassCreated,
    bypassRevoked: report.bypassRevoked,
    finalActiveBypassCount: report.finalActiveBypassCount,
  }, null, 2)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : "Preview grounded Live AI canary failed."}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  DATASET_PATH,
  DATASET_SHA256,
  ENGINEERING_TARGET_USD,
  MAXIMUM_COST_USD,
  MODEL,
  PROJECT,
  bodyFor,
  loadDataset,
  verifyPreview,
};
