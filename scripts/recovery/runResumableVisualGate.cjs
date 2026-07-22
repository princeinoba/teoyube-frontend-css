"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const {
  artifactBudgetBytes,
  atomicWriteJson,
  checkpointMatches,
  computeGateIdentity,
  controllerSchemaVersion,
  directoryStats,
  hashPaths,
  identitiesMatch,
  readJsonIfPresent,
  thresholdMs,
  workspaceRoot,
} = require("./resumableVisualGateState.cjs");

const visualRunner = path.join(workspaceRoot, "scripts", "recovery", "runVisualParitySuite.cjs");
const stateRoot = path.join(workspaceRoot, ".tmp", "visual-parity", "resumable-gate");
const controllerPath = path.join(stateRoot, "controller.json");
const requiredLogicalRuns = 3;
const interRunQuiescenceMs = 30_000;

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

async function runVisualMode(mode, environment = {}) {
  const child = spawn(process.execPath, [visualRunner, mode], {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      ...environment,
      TEOYUBE_GATE_REQUIRE_FRESH: "1",
      TEOYUBE_NPM_VERSION: environment.TEOYUBE_NPM_VERSION || process.env.TEOYUBE_NPM_VERSION,
    },
    stdio: "inherit",
    windowsHide: true,
  });
  const result = await waitForExit(child);
  if (result.signal) throw new Error(`${mode} was interrupted by ${result.signal}.`);
  return result.code ?? 1;
}

function createController(identity) {
  const timestamp = new Date().toISOString();
  return {
    schemaVersion: controllerSchemaVersion,
    gateSequenceId: `prompt17s-${identity.gitCommit.slice(0, 12)}-${timestamp.replace(/[-:.TZ]/g, "")}`,
    identity,
    thresholdMs,
    artifactBudgetBytes,
    requiredLogicalRuns,
    consecutivePasses: 0,
    totalAttempts: 0,
    currentRun: null,
    runs: [],
    startedAt: timestamp,
    updatedAt: timestamp,
    status: "in_progress",
  };
}

function persistController(controller) {
  controller.updatedAt = new Date().toISOString();
  atomicWriteJson(controllerPath, controller);
}

function archiveInvalidController(controller, reason) {
  if (!controller) return;
  const invalidatedDirectory = path.join(stateRoot, "invalidated");
  fs.mkdirSync(invalidatedDirectory, { recursive: true });
  atomicWriteJson(
    path.join(invalidatedDirectory, `${Date.now()}-${controller.gateSequenceId || "unknown"}.json`),
    { reason, invalidatedAt: new Date().toISOString(), controller },
  );
}

function createRun(controller) {
  controller.totalAttempts += 1;
  const runOrdinal = controller.consecutivePasses + 1;
  const runId = `${controller.gateSequenceId}-attempt-${controller.totalAttempts}-run-${runOrdinal}`;
  const runRoot = path.join(stateRoot, runId);
  const run = {
    runId,
    runOrdinal,
    attempt: controller.totalAttempts,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    completedAt: null,
    checkpointPath: path.join(runRoot, "checkpoint.json"),
    resultPath: path.join(runRoot, "result.json"),
    identityPath: path.join(runRoot, "identity.json"),
    parityInterruptionPath: path.join(runRoot, "parity-interrupted.json"),
    performance: null,
    parity: null,
    artifactRetention: null,
  };
  fs.mkdirSync(runRoot, { recursive: true });
  atomicWriteJson(run.identityPath, controller.identity);
  controller.currentRun = run;
  controller.runs.push(run);
  persistController(controller);
  return run;
}

function preserveFailedRun(controller, run, reason) {
  run.status = "failed";
  run.completedAt = new Date().toISOString();
  run.failureReason = reason;
  const checkpoint = readJsonIfPresent(run.checkpointPath);
  run.performance = checkpoint
    ? {
        completedCells: checkpoint.completedCellIds?.length || 0,
        failureCount: checkpoint.failures?.length || 0,
        nextCellId: checkpoint.nextCellId || null,
      }
    : { completedCells: 0, failureCount: 0, nextCellId: null };
  controller.consecutivePasses = 0;
  controller.currentRun = null;
  persistController(controller);
}

function validatePerformanceResult(result, identity, run) {
  if (!result || !checkpointMatches(result, identity, run.runId, run.runOrdinal)) {
    throw new Error(`Run ${run.runId} result identity is missing or stale.`);
  }
  if (result.status !== "passed" || result.completedCellIds?.length !== 72 || result.results?.length !== 72) {
    throw new Error(`Run ${run.runId} did not produce a complete passing 72-cell result.`);
  }
  if ((result.failures || []).length > 0) throw new Error(`Run ${run.runId} retained a failed cell.`);
  const maximum = Math.max(...result.results.flatMap((row) => [row.static.performance.readyMs, row.next.performance.readyMs]));
  if (maximum > thresholdMs) throw new Error(`Run ${run.runId} maximum ${maximum} ms exceeds ${thresholdMs} ms.`);
  return maximum;
}

function compactParityEvidence() {
  const inputs = [
    ".tmp/visual-parity/next-preview",
    ".tmp/visual-parity/shell-owner-review",
    ".tmp/visual-parity/today-owner-review",
    ".tmp/visual-parity/search-owner-review",
    ".tmp/visual-parity/canon-owner-review",
    ".tmp/visual-parity/promise-table-owner-review",
    ".tmp/visual-parity/calling-owner-review",
    ".tmp/visual-parity/prayer-journey-owner-review",
    ".tmp/visual-parity/journal-testimony-book-owner-review",
    ".tmp/visual-parity/remaining-retained-owner-review",
  ].filter((entry) => fs.existsSync(path.join(workspaceRoot, entry)));
  if (inputs.length === 0) return { sha256: null, files: 0, bytes: 0, inputs: [] };
  return { ...hashPaths(inputs), inputs };
}

function removePassingRunnerArtifacts() {
  for (const relativePath of [
    ".tmp/visual-parity/playwright-results",
    ".tmp/visual-parity/report",
  ]) {
    const absolute = path.resolve(workspaceRoot, relativePath);
    const allowedRoot = path.resolve(workspaceRoot, ".tmp", "visual-parity");
    if (!absolute.startsWith(`${allowedRoot}${path.sep}`)) {
      throw new Error(`Refusing artifact cleanup outside ${allowedRoot}: ${absolute}`);
    }
    fs.rmSync(absolute, { recursive: true, force: true });
  }
}

function removePassingCandidateEvidence(inputs) {
  const candidateRoot = path.resolve(workspaceRoot, ".tmp", "visual-parity");
  for (const relativePath of inputs) {
    const absolute = path.resolve(workspaceRoot, relativePath);
    if (!absolute.startsWith(`${candidateRoot}${path.sep}`) || absolute.startsWith(`${stateRoot}${path.sep}`)) {
      throw new Error(`Refusing candidate cleanup outside the disposable parity root: ${absolute}`);
    }
    fs.rmSync(absolute, { recursive: true, force: true });
  }
}

function enforceArtifactBudget(run) {
  removePassingCandidateEvidence(run.parity?.evidence?.inputs || []);
  removePassingRunnerArtifacts();
  const runRoot = path.dirname(run.checkpointPath);
  const retained = directoryStats(runRoot);
  const activeParityOutput = directoryStats(path.join(workspaceRoot, ".tmp", "visual-parity"));
  if (activeParityOutput.bytes > artifactBudgetBytes) {
    throw new Error(`Active parity output retained ${activeParityOutput.bytes} bytes, over the ${artifactBudgetBytes}-byte budget.`);
  }
  return {
    budgetBytes: artifactBudgetBytes,
    retainedBytes: retained.bytes,
    retainedFiles: retained.files,
    activeParityOutputBytes: activeParityOutput.bytes,
    passingPlaywrightTraceAndReportRetention: "deleted after compact hashes/results were recorded",
    passingCandidateRetention: "deleted after compact evidence hashes were recorded",
    baselineRetention: "unchanged in canonical baseline roots",
  };
}

async function completeRun(controller, run) {
  const currentIdentity = computeGateIdentity();
  if (!identitiesMatch(controller.identity, currentIdentity) || currentIdentity.trackedWorktreeStatus) {
    throw new Error("Gate identity changed or the tracked worktree became dirty; refusing to continue this logical run.");
  }
  const checkpoint = readJsonIfPresent(run.checkpointPath);
  if (checkpoint?.results?.some((result) => result.passed === false)) {
    preserveFailedRun(controller, run, "A failed cell was recorded; failed logical runs are not resumable.");
    return false;
  }

  if (!run.performance?.passed) {
    const code = await runVisualMode("gate-audit", {
      TEOYUBE_RESUMABLE_GATE: "1",
      TEOYUBE_GATE_IDENTITY_PATH: run.identityPath,
      TEOYUBE_GATE_CHECKPOINT_PATH: run.checkpointPath,
      TEOYUBE_GATE_RESULT_PATH: run.resultPath,
      TEOYUBE_GATE_RUN_ID: run.runId,
      TEOYUBE_GATE_RUN_ORDINAL: String(run.runOrdinal),
      TEOYUBE_GATE_ARTIFACT_BUDGET_BYTES: String(artifactBudgetBytes),
      TEOYUBE_NPM_VERSION: controller.identity.npmVersion,
    });
    if (code !== 0) {
      const incomplete = readJsonIfPresent(run.checkpointPath);
      if (incomplete?.results?.some((result) => result.passed === false)) {
        preserveFailedRun(controller, run, `Canonical performance audit exited ${code} after recording a failed cell.`);
        return false;
      }
      run.performance = {
        passed: false,
        incomplete: true,
        completedCells: incomplete?.completedCellIds?.length || 0,
        nextCellId: incomplete?.nextCellId || null,
        segmentCount: incomplete?.segments?.length || 0,
        lastExitCode: code,
      };
      persistController(controller);
      throw new Error(`Canonical audit segment exited ${code} without a failed cell; rerun the same command to resume ${run.runId}.`);
    }
    const result = readJsonIfPresent(run.resultPath);
    const maximumReadyMs = validatePerformanceResult(result, controller.identity, run);
    run.performance = {
      passed: true,
      completedCells: 72,
      maximumReadyMs,
      resumed: (result.segments || []).length > 1,
      segmentCount: (result.segments || []).length,
      resultSha256: crypto.createHash("sha256").update(fs.readFileSync(run.resultPath)).digest("hex"),
    };
    persistController(controller);
  }

  if (!run.parity?.passed) {
    const parityInterruptionPath = run.parityInterruptionPath || path.join(path.dirname(run.checkpointPath), "parity-interrupted.json");
    fs.rmSync(parityInterruptionPath, { force: true });
    const parityCode = await runVisualMode("next", {
      TEOYUBE_NPM_VERSION: controller.identity.npmVersion,
      TEOYUBE_PARITY_INTERRUPTION_MARKER: parityInterruptionPath,
      TEOYUBE_PARITY_RUN_ID: run.runId,
    });
    if (parityCode !== 0) {
      const interruption = readJsonIfPresent(parityInterruptionPath);
      if (interruption?.schemaVersion === "teoyube-parity-interruption-1" && interruption.runId === run.runId) {
        run.parity = {
          passed: false,
          incomplete: true,
          interruptionSignal: interruption.signal || "unknown",
          interruptedAt: interruption.occurredAt || new Date().toISOString(),
          lastExitCode: parityCode,
        };
        persistController(controller);
        throw new Error(`Canonical parity was interrupted by ${run.parity.interruptionSignal}; rerun the same command to resume ${run.runId}.`);
      }
      preserveFailedRun(controller, run, `Canonical visual/DOM/class/asset/functional parity exited ${parityCode}.`);
      return false;
    }
    const evidence = compactParityEvidence();
    run.parity = {
      passed: true,
      visual: "PASS",
      domClass: "PASS",
      asset: "PASS",
      functional: "PASS",
      command: "node scripts/recovery/runVisualParitySuite.cjs next",
      evidence,
      completedAt: new Date().toISOString(),
    };
    persistController(controller);
  }

  const closingIdentity = computeGateIdentity();
  if (!identitiesMatch(controller.identity, closingIdentity) || closingIdentity.trackedWorktreeStatus) {
    throw new Error("Gate identity changed before logical-run closure; the run cannot be promoted.");
  }
  run.artifactRetention = enforceArtifactBudget(run);
  run.status = "passed";
  run.completedAt = new Date().toISOString();
  controller.consecutivePasses += 1;
  controller.currentRun = null;
  persistController(controller);
  console.log(`Logical run ${run.runOrdinal}/${requiredLogicalRuns} passed; maximum readiness ${run.performance.maximumReadyMs} ms.`);
  return true;
}

async function waitForRunQuiescence(controller) {
  if (controller.currentRun) return;
  const previousRun = controller.runs.at(-1);
  const context = previousRun ? `after ${previousRun.status} ${previousRun.runId}` : "before the first cold logical run";
  console.log(`Waiting ${interRunQuiescenceMs} ms for browser/server and command-host activity to quiesce ${context}.`);
  await new Promise((resolve) => setTimeout(resolve, interRunQuiescenceMs));
  const currentIdentity = computeGateIdentity();
  if (!identitiesMatch(controller.identity, currentIdentity) || currentIdentity.trackedWorktreeStatus) {
    throw new Error("Gate identity changed during inter-run quiescence; refusing to start another logical run.");
  }
}

async function main() {
  fs.mkdirSync(stateRoot, { recursive: true });
  const identity = computeGateIdentity();
  if (identity.nodeVersion !== "v24.18.0" || identity.npmVersion !== "10.2.4") {
    throw new Error(`Locked toolchain mismatch: Node ${identity.nodeVersion}; npm ${identity.npmVersion}.`);
  }
  if (identity.trackedWorktreeStatus) {
    throw new Error(`Tracked worktree must be clean before the gate:\n${identity.trackedWorktreeStatus}`);
  }

  let controller = readJsonIfPresent(controllerPath);
  if (controller && (controller.schemaVersion !== controllerSchemaVersion || !identitiesMatch(controller.identity, identity))) {
    archiveInvalidController(controller, "Git, Node/npm, audit, threshold, baseline, or build identity changed.");
    controller = null;
  }
  if (!controller) {
    controller = createController(identity);
    persistController(controller);
  }

  while (controller.consecutivePasses < requiredLogicalRuns) {
    await waitForRunQuiescence(controller);
    const run = controller.currentRun || createRun(controller);
    const passed = await completeRun(controller, run);
    if (!passed) {
      throw new Error(`Logical run ${run.runId} failed; the consecutive pass count reset to zero.`);
    }
  }

  controller.status = "passed";
  controller.completedAt = new Date().toISOString();
  controller.summary = {
    logicalRuns: controller.runs.filter((run) => run.status === "passed").slice(-requiredLogicalRuns).map((run) => ({
      runId: run.runId,
      runOrdinal: run.runOrdinal,
      maximumReadyMs: run.performance.maximumReadyMs,
      resumed: run.performance.resumed,
      segmentCount: run.performance.segmentCount,
      performanceResultSha256: run.performance.resultSha256,
      parityEvidenceSha256: run.parity.evidence.sha256,
      retainedBytes: run.artifactRetention.retainedBytes,
    })),
    completedCells: requiredLogicalRuns * 72,
    measurements: requiredLogicalRuns * 72,
    thresholdMs,
  };
  persistController(controller);
  console.log(JSON.stringify(controller.summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
