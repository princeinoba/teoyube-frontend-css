"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const evidencePath = path.join(root, "docs/release/vector-holdout-v2-quality-completion.json");
const datasetPath = path.join(root, "docs/release/vector-quality-holdout-v2-dataset.json");
const expectedEvidenceSha256 = "816d3d5dfb8d8130214a8736ab0093bea299b106abad48a8454fd5aed1e13e0d";
const expectedDatasetSha256 = "3e84e225d5fe4faa84f8ade8bbca2e49c4c6d0bcb914584f5f459707f6c2d4f5";
const expectedOutcomeHash = "6add1cb1b51fa05f07ab38658c74023e309d0a7c6a82407dfa17220a8c46f64d";
const lockCommit = "1a31e6d4c600a1b93fe462ce424c335172eb0142";
const qualityCommit = "a68d5ae167daac01c8981e8cb83caae9d135c828";
const authorizationId = "TEOYUBE-AUG21-VECTOR-HOLDOUT-V2-2026-08-09-001";

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const exactKeys = (value, expected) => value && typeof value === "object" && !Array.isArray(value) &&
  JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());
const ancestry = (commit) => {
  try { execFileSync("git", ["merge-base", "--is-ancestor", commit, "HEAD"], { cwd: root }); return true; }
  catch { return false; }
};

function verifyVectorV2PaidEvidence(options = {}) {
  const failures = [];
  if (!fs.existsSync(evidencePath)) return { valid: false, failures: ["V2 completion evidence is missing."] };
  const evidenceBytes = fs.readFileSync(evidencePath);
  if (sha256(evidenceBytes) !== expectedEvidenceSha256) failures.push("V2 completion evidence bytes changed.");
  let parsed;
  try { parsed = JSON.parse(evidenceBytes.toString("utf8")); }
  catch { return { valid: false, failures: ["V2 completion evidence is invalid JSON."] }; }
  const evidence = options.evidenceOverride || parsed;
  if (!exactKeys(evidence, ["schemaVersion", "authorizationId", "generatedAt", "repository", "branch", "remoteStartingCommit", "localSafetyReference", "holdoutV1", "holdoutV2", "diagnostic", "determinism", "provider", "verification", "productionBoundary", "outcome"])) failures.push("V2 completion evidence top-level schema changed.");
  if (!exactKeys(evidence.holdoutV2, ["lockCommit", "datasetHash", "cases", "metrics", "retainedGenuineRankingFailures", "changeManifest"])) failures.push("V2 holdout evidence schema changed.");
  if (!exactKeys(evidence.provider, ["model", "queryEmbeddingOnly", "corpusReembedded", "resultSha256", "costs", "usage"])) failures.push("V2 provider evidence schema changed.");
  if (!exactKeys(evidence.determinism, ["passed", "outcomeHashes"])) failures.push("V2 determinism evidence schema changed.");
  if (evidence.schemaVersion !== 1 || evidence.authorizationId !== authorizationId) failures.push("V2 evidence authorization identity changed.");
  if (evidence.holdoutV2?.lockCommit !== lockCommit || !ancestry(lockCommit)) failures.push("V2 lock commit is not bound in current ancestry.");
  if (!ancestry(qualityCommit)) failures.push("V2 quality source commit is not in current ancestry.");
  const datasetHash = fs.existsSync(datasetPath) ? sha256(fs.readFileSync(datasetPath)) : null;
  if (datasetHash !== expectedDatasetSha256 || evidence.holdoutV2?.datasetHash !== expectedDatasetSha256) failures.push("Locked V2 dataset hash changed or is inconsistent.");
  const hashes = evidence.determinism?.outcomeHashes;
  if (evidence.determinism?.passed !== true || !Array.isArray(hashes) || hashes.length !== 3 || hashes.some((hash) => hash !== expectedOutcomeHash)) failures.push("Three-run deterministic outcome hash binding failed.");
  if (evidence.outcome?.vectorQuality !== "PASS" || evidence.outcome?.activationReadiness !== "QUALITY_PASS") failures.push("V2 quality outcome is not PASS.");
  const cases = evidence.holdoutV2?.cases || {};
  if (cases.total !== 35 || cases.passed !== 35 || cases.failed !== 0) failures.push("Locked V2 case result is not 35/35.");
  const holdoutMetrics = evidence.holdoutV2?.metrics || {};
  const diagnosticMetrics = evidence.diagnostic?.metrics || {};
  for (const [name, value] of [
    ["V2 exact-reference recall@1", holdoutMetrics.exactReferenceRecallAt1],
    ["V2 exact-reference recall@5", holdoutMetrics.exactReferenceRecallAt5],
    ["V2 paraphrase recall@5", holdoutMetrics.paraphraseRecallAt5],
    ["V2 content-type precision", holdoutMetrics.contentTypePrecision],
    ["V2 no-answer precision", holdoutMetrics.noAnswerPrecision],
    ["V2 citation accuracy", holdoutMetrics.citationReferenceAccuracy]
  ]) if (value !== 1) failures.push(`${name} is below its locked threshold.`);
  if (diagnosticMetrics.paraphraseRecallAt5 < 0.95 || evidence.diagnostic?.metricBasedPass !== true) failures.push("Diagnostic paraphrase metric is below 95% or not metric-pass.");
  if (holdoutMetrics.latencyMs?.p95 > 1491.19) failures.push("V2 p95 latency exceeds 1,491.19 ms.");
  const retained = evidence.holdoutV2?.retainedGenuineRankingFailures || [];
  const expectedRanks = new Map([["holdout-para-02", 1], ["holdout-para-04", 2], ["holdout-para-08", 1]]);
  if (retained.length !== expectedRanks.size || retained.some((item) => item.passed !== true || expectedRanks.get(item.id) !== item.rank)) failures.push("Retained genuine failure ranks are not exactly 1, 2 and 1.");
  const costs = evidence.provider?.costs || {};
  if (costs.authorizationAdditionalUsd !== 0.00001208 || costs.authorizationAdditionalUsd > costs.authorizedAdditionalCeilingUsd || costs.authorizedAdditionalCeilingUsd !== 0.005) failures.push("V2 authorization cost is inconsistent or over budget.");
  if (costs.cumulativeUsd !== 0.04042338 || costs.cumulativeUsd > costs.absoluteCumulativeCeilingUsd || costs.absoluteCumulativeCeilingUsd !== 0.25) failures.push("V2 cumulative cost is inconsistent or over budget.");
  const usage = evidence.provider?.usage || {};
  if (usage.providerFailures !== 0 || usage.retries !== 0 || usage.paidGenerationCalls !== 0) failures.push("Provider failure, retry, or generation count is non-zero.");
  if (evidence.provider?.queryEmbeddingOnly !== true || evidence.provider?.corpusReembedded !== false) failures.push("Query-only/no-reembedding boundary changed.");
  return {
    valid: failures.length === 0,
    failures,
    evidenceSha256: sha256(evidenceBytes),
    datasetSha256: datasetHash,
    outcomeHash: expectedOutcomeHash,
    lockCommit,
    qualityCommit,
    metrics: { holdout: holdoutMetrics, diagnostic: diagnosticMetrics },
    costs
  };
}

if (require.main === module) {
  const result = verifyVectorV2PaidEvidence();
  console.log(JSON.stringify({ status: result.valid ? "PASS" : "FAIL", ...result }, null, 2));
  if (!result.valid) process.exitCode = 1;
}

module.exports = { evidencePath, verifyVectorV2PaidEvidence };
