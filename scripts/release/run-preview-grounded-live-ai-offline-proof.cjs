"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { EventEmitter } = require("node:events");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const {
  runControlledSecretLifecycle,
} = require("./preview-bypass-lifecycle.cjs");
const runner = require("./preview-grounded-live-ai-resumable-runner.cjs");

const TMP = path.resolve(".tmp/preview-grounded-live-ai-offline-proof");
const SYNTHETIC_CREDENTIAL = "synthetic-offline-only";
const WEB_TEXT = "Synthetic exact WEB fixture text.";
const FIXED_BOUNDARY = "This is interpretation, not divine certainty.";

function responseFor(fixture) {
  if (fixture.category !== "permitted_public_grounded_generation") {
    return {
      ok: false,
      reason: fixture.category.toUpperCase(),
      runtime: "deterministic-fallback",
      generationUsed: false,
      persisted: false,
      providerCalls: runner.providerCounts(),
      disposition: fixture.expectedDisposition,
      latencyMs: 1,
      cost: { cumulativeCostUsd: 0 },
      outputHash: crypto.createHash("sha256").update(fixture.id).digest("hex"),
    };
  }
  const response = {
    disposition: fixture.expectedDisposition,
    summary: "Synthetic grounded summary.",
    biblical_application: "Synthetic application.",
    prayer: "Synthetic prayer.",
    action_step: "Synthetic action.",
    citation_ids: fixture.requiredCitationIds,
    limitations: ["Synthetic limitation."],
    confidence: "high",
    safety_boundary: FIXED_BOUNDARY,
  };
  return {
    ok: true,
    reason: "completed",
    runtime: "preview-grounded-live-ai",
    generationUsed: true,
    persisted: false,
    providerCalls: runner.providerCounts({ modelProbe: 1, inputModeration: 1, embedding: 1, vector: 1, generation: 1, outputModeration: 1 }),
    response,
    citations: fixture.requiredCitationIds.map((id) => ({ id, translation: "WEB", exactText: WEB_TEXT })),
    usage: { inputTokens: 100, cachedInputTokens: 0, reasoningTokens: 0, outputTokens: 50, totalTokens: 150, estimatedCostUsd: 0.001 },
    modelIdentifier: runner.MODEL,
    latencyMs: 5,
    cost: { cumulativeCostUsd: 0.00101 },
    outputHash: crypto.createHash("sha256").update(JSON.stringify(response)).digest("hex"),
    diagnostic: { pipelineStage: "COMPLETED", fallbackReason: "COMPLETED", schemaValid: true, unknownCitationCount: 0, moderationCalled: true },
  };
}

function startServer(locked, behavior = {}) {
  const dispatched = [];
  const server = http.createServer((request, response) => {
    if (request.url === "/api/health") {
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ status: "ok", environment: "preview", deploymentTarget: "vercel-preview" }));
      return;
    }
    if (request.method === "GET" && runner.ROUTES.includes(request.url)) {
      response.setHeader("content-type", "text/html; charset=utf-8");
      response.end("<!doctype html><title>Synthetic</title>");
      return;
    }
    if (request.method === "GET" && runner.STYLESHEETS.includes(request.url)) {
      response.setHeader("content-type", "text/css; charset=utf-8");
      response.end("/* synthetic */");
      return;
    }
    if (request.method !== "POST") {
      response.writeHead(404).end();
      return;
    }
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      dispatched.push(body.caseId);
      if (behavior.neverRespondCaseId === body.caseId) return;
      const fixture = locked.dataset.cases.find((item) => item.id === body.caseId);
      if (behavior.rejectCaseId === body.caseId) {
        response.writeHead(500, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: false, reason: "validation_failure", persisted: false }));
        return;
      }
      if (behavior.malformedCaseId === body.caseId) {
        response.writeHead(fixture.expectedHttpStatus, { "content-type": "application/json" });
        response.end("{");
        return;
      }
      const applicationResponse = responseFor(fixture);
      if (behavior.ordinaryFailureCaseId === body.caseId) applicationResponse.response.safety_boundary = "Synthetic ordinary quality failure.";
      if (behavior.forbiddenFailureCaseId === body.caseId) applicationResponse.response.summary = fixture.forbiddenPhrases[0];
      if (behavior.persistenceCaseId === body.caseId) applicationResponse.persisted = true;
      response.writeHead(fixture.expectedHttpStatus, { "content-type": "application/json" });
      response.end(JSON.stringify(applicationResponse));
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}`, dispatched });
    });
  });
}

async function closeServer(server) {
  server.closeIdleConnections?.();
  server.closeAllConnections?.();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

function target(url) {
  return Object.freeze({ ...runner.TARGET, deploymentUrl: url });
}

function corpus(locked) {
  return new Map(locked.dataset.cases.flatMap((fixture) => fixture.requiredCitationIds.map((id) => [id, WEB_TEXT])));
}

function checkpointPath(name) {
  return path.join(TMP, `${name}.json`);
}

function matcherSemanticsProof(locked) {
  const fixture = locked.dataset.cases[0];
  const safeBody = responseFor(fixture);
  safeBody.response.limitations = ["This is not guaranteed."];
  const evidence = runner.validateResponse(fixture, 1, { status: 200, body: safeBody, elapsedMs: 1 }, corpus(locked));
  assert.deepEqual(evidence.diagnosticReasonCodes, ["COMPLETED"]);
  const unsafeBody = responseFor(fixture);
  unsafeBody.response.summary = fixture.forbiddenPhrases[0];
  assert.throws(() => runner.validateResponse(fixture, 1, { status: 200, body: unsafeBody, elapsedMs: 1 }, corpus(locked)), (error) => error.code === "FORBIDDEN_CLAIM_RUBRIC_FAILED");
}

function resetTemporaryDirectory() {
  if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
}

async function fullSequenceProof(locked) {
  const fixture = await startServer(locked);
  const markers = [];
  const file = checkpointPath("full");
  try {
    const report = await runner.verifyPreview(SYNTHETIC_CREDENTIAL, target(fixture.url), locked, { checkpointPath: file, corpus: corpus(locked), logger: (marker) => markers.push(marker), runnerSourceSha256: runner.sourceHash(), requestTimeoutMs: 2_000, caseTimeoutMs: 3_000 });
    assert.deepEqual(fixture.dispatched, locked.dataset.cases.map((item) => item.id));
    assert.equal(report.lockedEvaluation.passed, 32);
    const aggregateArtifact = checkpointPath("aggregate");
    runner.writeAtomic(aggregateArtifact, report);
    assert.equal(JSON.parse(fs.readFileSync(aggregateArtifact, "utf8")).lockedEvaluation.passed, 32);
    assert.ok(fixture.dispatched.indexOf(locked.dataset.cases[1].id) > fixture.dispatched.indexOf(locked.dataset.cases[0].id));
    const checkpoint = runner.readCheckpoint(file, runner.identity(locked, target(fixture.url), runner.sourceHash()), locked);
    assert.equal(checkpoint.completedCaseIds.length, 32);
    assert.equal(fs.readdirSync(TMP).filter((name) => /^full\.\d{5}\.json$/.test(name)).length, 64);
    assert.ok(markers.some((marker) => marker.caseOrdinal === 2 && marker.stage === "REQUEST_DISPATCH_STARTED"));
  } finally {
    await closeServer(fixture.server);
  }
}

async function timeoutProof(locked) {
  const fixture = await startServer(locked, { neverRespondCaseId: locked.dataset.cases[0].id });
  try {
    await assert.rejects(() => runner.verifyPreview(SYNTHETIC_CREDENTIAL, target(fixture.url), locked, { checkpointPath: checkpointPath("timeout"), corpus: corpus(locked), runnerSourceSha256: runner.sourceHash(), requestTimeoutMs: 50, caseTimeoutMs: 200 }), (error) => ["REQUEST_TIMEOUT", "CASE_TIMEOUT"].includes(error.code));
    assert.deepEqual(fixture.dispatched, [locked.dataset.cases[0].id]);
  } finally {
    await closeServer(fixture.server);
  }
}

async function collectCompleteProof(locked, behavior, name, expectedReasonCode) {
  const fixture = await startServer(locked, behavior);
  try {
    const report = await runner.verifyPreview(SYNTHETIC_CREDENTIAL, target(fixture.url), locked, { checkpointPath: checkpointPath(name), corpus: corpus(locked), runnerSourceSha256: runner.sourceHash(), requestTimeoutMs: 1_000, caseTimeoutMs: 2_000 });
    assert.deepEqual(fixture.dispatched, locked.dataset.cases.map((item) => item.id));
    assert.deepEqual(report.lockedEvaluation, { status: "FAIL", passed: 31, failed: 1, expected: 32, aggregateFailureCodes: [] });
    assert.equal(report.failures.length, 1);
    assert.ok(report.failures[0].diagnosticReasonCodes.includes("ORDINARY_CASE_FAILURE"));
    assert.ok(report.failures[0].diagnosticReasonCodes.includes(expectedReasonCode));
    const raw = fs.readFileSync(runner.latestCheckpointFile(checkpointPath(name)), "utf8");
    assert.equal(raw.includes(locked.dataset.cases[0].request.query), false);
  } finally {
    await closeServer(fixture.server);
  }
}

async function failClosedProof(locked, behavior, name, expectedCode) {
  const fixture = await startServer(locked, behavior);
  try {
    await assert.rejects(() => runner.verifyPreview(SYNTHETIC_CREDENTIAL, target(fixture.url), locked, { checkpointPath: checkpointPath(name), corpus: corpus(locked), runnerSourceSha256: runner.sourceHash(), requestTimeoutMs: 1_000, caseTimeoutMs: 2_000 }), (error) => error.code === expectedCode);
    assert.deepEqual(fixture.dispatched, [locked.dataset.cases[0].id]);
  } finally {
    await closeServer(fixture.server);
  }
}


function adapter() {
  let active = 0;
  let revocations = 0;
  return {
    adapter: {
      async activeCount() { return active; },
      async create() { active = 1; },
      async readCredential() { return SYNTHETIC_CREDENTIAL; },
      async readCredentialForCleanup() { return SYNTHETIC_CREDENTIAL; },
      async revoke() { revocations += 1; active = 0; },
    },
    state: () => ({ active, revocations }),
  };
}

async function cleanupProof(event) {
  const fixture = adapter();
  const events = new EventEmitter();
  const operation = runControlledSecretLifecycle(fixture.adapter, async (_credential, signal) => {
    if (event === "evaluator-failure") throw new Error("synthetic evaluator failure");
    return new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true }));
  }, { deadlineMs: 1_000, eventTarget: events });
  if (event !== "evaluator-failure") setImmediate(() => events.emit(event, new Error("synthetic interruption")));
  await assert.rejects(() => operation);
  assert.deepEqual(fixture.state(), { active: 0, revocations: 1 });
  assert.equal(events.eventNames().length, 0);
}

function activeHandleProof() {
  return process._getActiveHandles().filter((handle) => handle !== process.stdin && handle !== process.stdout && handle !== process.stderr && handle.constructor?.name !== "Socket" && handle.constructor?.name !== "Pipe");
}

async function main() {
  resetTemporaryDirectory();
  const locked = runner.loadDataset();
  matcherSemanticsProof(locked);
  await fullSequenceProof(locked);
  await collectCompleteProof(locked, { ordinaryFailureCaseId: locked.dataset.cases[0].id }, "ordinary-failure", "FIXED_UNCERTAINTY_BOUNDARY_FAILED");
  await collectCompleteProof(locked, { forbiddenFailureCaseId: locked.dataset.cases[0].id }, "forbidden-failure", "C_GENUINE_MODEL_FORBIDDEN_CLAIM");
  await timeoutProof(locked);
  await failClosedProof(locked, { malformedCaseId: locked.dataset.cases[0].id }, "malformed", "MALFORMED_JSON_RESPONSE");
  await failClosedProof(locked, { rejectCaseId: locked.dataset.cases[0].id }, "rejected", "PROVIDER_FAILURE");
  await failClosedProof(locked, { persistenceCaseId: locked.dataset.cases[0].id }, "persistence", "UNEXPECTED_PERSISTENCE");
  const full = runner.readCheckpoint(checkpointPath("full"), runner.identity(locked, target((await (async () => "http://synthetic.invalid")())), runner.sourceHash()), locked);
  void full;
  const raw = JSON.parse(fs.readFileSync(runner.latestCheckpointFile(checkpointPath("full")), "utf8"));
  raw.caseEvidence[0].query = "forbidden";
  assert.throws(() => runner.sanitizedCheckpoint(raw));
  for (const event of ["evaluator-failure", "SIGINT", "SIGTERM", "uncaughtException", "unhandledRejection"]) await cleanupProof(event);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(activeHandleProof(), []);
  process.stdout.write(["REQUEST 1 DISPATCH/PROCESS: PASS", "REQUEST 2 OBSERVABLE DISPATCH: PASS", "LOCKED CASE IDS: 32/32 SEQUENTIAL PASS", "MATCHER FALSE POSITIVE REMEDIATION: PASS", "GENUINE FORBIDDEN CLAIM STILL FAILS: PASS", "ORDINARY FAILURE COLLECT-COMPLETE: PASS", "FORBIDDEN FAILURE SANITIZED CLASSIFICATION: PASS", "ATOMIC SANITIZED CHECKPOINT: PASS", "AGGREGATE ARTIFACT: PASS", "NONRESPONDING REQUEST ABORT: PASS", "MALFORMED JSON FAIL-CLOSED: PASS", "5XX STOPS DISPATCH: PASS", "UNEXPECTED PERSISTENCE STOPS DISPATCH: PASS", "BYPASS CLEANUP ON EVALUATOR FAILURE: PASS", "SIGINT/SIGTERM/UNCAUGHT/UNHANDLED CLEANUP: PASS", "ACTIVE RESOURCE CLOSURE: PASS", "NATURAL EXIT: PASS"].join("\n") + "\n");
}

main().catch((error) => {
  process.stderr.write(`OFFLINE RUNNER PROOF: FAIL ${error instanceof Error ? error.message : "UNKNOWN"}\n`);
  process.exitCode = 1;
});
