"use strict";

const fs = require("node:fs");
const {
  absolute,
  currentIdentity,
  readJson,
  walk,
  writeJson
} = require("./release-utils.cjs");
const { measureProductionCss } = require("./css-production-budget.cjs");

const policy = readJson("config/release-gate-policy.json");
const budgets = policy.performance;
const identity = currentIdentity();

function bytes(files) {
  return files.reduce((sum, file) => sum + fs.statSync(absolute(file)).size, 0);
}

function maximum(files) {
  return files.reduce((value, file) => Math.max(value, fs.statSync(absolute(file)).size), 0);
}

function check(id, actual, maximumValue, extra = {}) {
  return Object.freeze({
    id,
    actual,
    maximum: maximumValue,
    passed: actual <= maximumValue,
    ...extra
  });
}

const jsFiles = walk(".next/static").filter((file) => file.endsWith(".js"));
const css = measureProductionCss();
const publicFiles = walk("public");
const imageFiles = publicFiles.filter((file) => /\.(png|jpe?g|webp|gif|svg)$/i.test(file));
const mediaFiles = publicFiles.filter((file) => /\.(mp4|webm|mov)$/i.test(file));
const controllerPath = ".tmp/visual-parity/resumable-gate/controller.json";
const controller = fs.existsSync(absolute(controllerPath)) ? readJson(controllerPath) : null;
const retrieval = readJson("docs/testing/retrieval-evaluation-scorecard.json");
const indexManifest = readJson(".var/retrieval/public-index-manifest.json");

const checks = [
  check("next-client-js-total", bytes(jsFiles), budgets.nextClientJsMaximumBytes, { baseline: budgets.nextClientJsBaselineBytes }),
  check("largest-client-chunk", maximum(jsFiles), budgets.largestClientChunkMaximumBytes, { baseline: budgets.largestClientChunkBaselineBytes }),
  ...css.checks,
  check("image-total", bytes(imageFiles), budgets.imageMaximumBytes, { baseline: budgets.imageBaselineBytes }),
  check("media-total", bytes(mediaFiles), budgets.mediaMaximumBytes, { baseline: budgets.mediaBaselineBytes }),
  check("largest-image", maximum(imageFiles), budgets.largestImageMaximumBytes),
  check("largest-media", maximum(mediaFiles), budgets.largestMediaMaximumBytes),
  check("retrieval-p95", retrieval.metrics.hybridLatencyP95Ms, budgets.retrievalP95MaximumMs, { baseline: budgets.retrievalP95BaselineMs }),
  check("active-vector-index", indexManifest.databaseBytes, budgets.activeVectorIndexMaximumBytes)
];

const performanceCurrent = Boolean(
  controller &&
  controller.status === "passed" &&
  controller.identity?.gitCommit === identity.commit &&
  controller.identity?.trackedWorktreeStatus === "" &&
  controller.summary?.completedCells === budgets.requiredPerformanceCells &&
  controller.summary?.measurements === budgets.requiredPerformanceCells &&
  controller.summary?.logicalRuns?.length === 3 &&
  controller.summary.logicalRuns.every(
    (run) => run.maximumReadyMs <= budgets.routeReadinessMaximumMs
  )
);
checks.push(Object.freeze({
  id: "resumable-216-cell-performance",
  actual: controller?.summary?.completedCells || 0,
  maximum: budgets.requiredPerformanceCells,
  passed: performanceCurrent,
  expectedCommit: identity.commit,
  controllerCommit: controller?.identity?.gitCommit || null,
  runs: controller?.summary?.logicalRuns || []
}));

const forbiddenPatterns = [
  "TIG_CALLING_SEEDS",
  "engwebp_usfm.zip",
  "retrieval.sqlite",
  "synthetic-safety-cases",
  "SqliteConsentMemoryStore",
  "OPENAI_API_KEY"
];
const bundleHits = [];
for (const file of jsFiles) {
  const source = fs.readFileSync(absolute(file), "utf8");
  for (const pattern of forbiddenPatterns) {
    if (source.includes(pattern)) bundleHits.push({ file, pattern });
  }
}
checks.push(Object.freeze({
  id: "client-server-bundle-boundary",
  actual: bundleHits.length,
  maximum: 0,
  passed: bundleHits.length === 0,
  hits: bundleHits
}));

const failed = checks.filter((item) => !item.passed);
const result = Object.freeze({
  schemaVersion: 1,
  gateVersion: "teoyube-performance-budget-2026-08-07.1",
  generatedAt: new Date().toISOString(),
  identity,
  policyVersion: policy.policyVersion,
  evidenceType: "synthetic_local_preview",
  checks,
  configuredBudgets: {
    cssProduction: budgets.cssProduction,
    apiP95MaximumMs: budgets.apiP95MaximumMs,
    liveAiFirstApprovedSectionMaximumMs: budgets.liveAiFirstApprovedSectionMaximumMs,
    liveAiCompleteMaximumMs: budgets.liveAiCompleteMaximumMs,
    workspaceGrowthMaximumBytes: budgets.workspaceGrowthMaximumBytes
  },
  failed: failed.map((item) => item.id),
  result: failed.length === 0 ? "PASS" : "BLOCKED"
});
writeJson("artifacts/release-evidence/performance/budgets.json", result);
console.log(`RELEASE PERFORMANCE GATE: ${result.result} (${checks.length} checks; failed ${failed.length})`);
if (failed.length) process.exitCode = 1;
