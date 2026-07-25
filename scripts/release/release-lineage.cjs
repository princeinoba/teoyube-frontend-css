"use strict";

const fs = require("node:fs");
const {
  absolute,
  git,
  readJson,
  run,
  sha256File
} = require("./release-utils.cjs");
const {
  computeRuntimeSourceIdentity,
  validateRuntimeSourceDigest
} = require("../runtime/runtime-source-identity.cjs");

const CLASSIFICATIONS = Object.freeze({
  RUNTIME_AFFECTING: "RUNTIME_AFFECTING",
  ROUTE_OR_API_AFFECTING: "ROUTE_OR_API_AFFECTING",
  VISUAL_OR_ASSET_AFFECTING: "VISUAL_OR_ASSET_AFFECTING",
  BUILD_OR_DEPENDENCY_AFFECTING: "BUILD_OR_DEPENDENCY_AFFECTING",
  GATE_OR_TEST_AFFECTING: "GATE_OR_TEST_AFFECTING",
  RUNTIME_MANIFEST_METADATA: "RUNTIME_MANIFEST_METADATA",
  OWNER_APPROVAL: "OWNER_APPROVAL",
  EVIDENCE_ARTIFACT: "EVIDENCE_ARTIFACT",
  REPORT_ONLY: "REPORT_ONLY",
  UNKNOWN_BLOCKED: "UNKNOWN_BLOCKED"
});

const ALLOWED_DESCENDANT_CLASSIFICATIONS = new Set([
  CLASSIFICATIONS.RUNTIME_MANIFEST_METADATA,
  CLASSIFICATIONS.OWNER_APPROVAL,
  CLASSIFICATIONS.EVIDENCE_ARTIFACT,
  CLASSIFICATIONS.REPORT_ONLY
]);

const EXACT_OWNER_RECORDS = new Set([
  "docs/owner-approvals/runtime/TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24.md"
]);

const EXACT_EVIDENCE_RECORDS = new Set([
  "docs/recovery/prompt-22-runtime-cutover-candidate.json",
  "docs/recovery/prompt-23a-release-lineage-repair-report.json"
]);

const EXACT_REPORT_RECORDS = new Set([
  "docs/architecture/adr/ADR-006-owner-controlled-local-runtime-cutover.md",
  "docs/architecture/canonical-runtime.md",
  "docs/architecture/release-evidence.md",
  "docs/recovery/prompt-22-runtime-cutover-candidate.md",
  "docs/recovery/prompt-22-runtime-cutover-report.md",
  "docs/recovery/prompt-23a-release-lineage-diagnosis.md",
  "docs/recovery/prompt-23a-release-lineage-diagnosis.json",
  "docs/recovery/prompt-23a-release-lineage-repair-report.md",
  "docs/recovery/prompt-23a-stabilization-status.md",
  "docs/recovery/prompt-23a-stabilization-status.json",
  "docs/recovery/prompt-23a-starting-manifest.json",
  "docs/recovery/prompt-23a-complete-inventory.md",
  "docs/recovery/prompt-23a-complete-inventory.json",
  "docs/recovery/prompt-23a-dependency-graph.md",
  "docs/recovery/prompt-23a-dependency-graph.json",
  "docs/recovery/prompt-23a-owner-approval-package.md",
  "docs/recovery/prompt-23a-owner-approval-package.json",
  "docs/recovery/prompt-23a-i-inventory-under-security-blocker-report.md",
  "docs/recovery/prompt-23a-i-inventory-under-security-blocker-report.json",
  "docs/recovery/prompt-23a-d-build-identity-diagnosis.md",
  "docs/recovery/prompt-23a-d-build-identity-diagnosis.json",
  "docs/recovery/prompt-23a-d-deterministic-build-and-inventory-closeout.md",
  "docs/recovery/prompt-23a-d-deterministic-build-and-inventory-closeout.json",
  "docs/architecture/deterministic-runtime-build-identity.md",
  "docs/recovery/prompt-23a-proposed-archive-manifest.json",
  "docs/recovery/prompt-23a-proposed-delete-manifest.json",
  "docs/recovery/prompt-23a-archive-inventory-report.md",
  "docs/recovery/prompt-23a-archive-inventory-report.json",
  "docs/README.md",
  "docs/architecture/README.md",
  "docs/recovery/README.md"
]);

const RUNTIME_METADATA_PATH = "config/runtime/canonical-runtime-manifest.json";
const RUNTIME_METADATA_KEYS = new Set([
  "ownerConfirmation",
  "cutoverCommit",
  "postCutoverTag",
  "runtimeSourceCommit",
  "runtimeSourceDigest",
  "buildIdGeneratorVersion",
  "buildIdDigestAlgorithm",
  "runtimeSourceManifest",
  "nextBuildId",
  "verifiedAt",
  "gateCPreview"
]);

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function withoutRuntimeMetadata(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !RUNTIME_METADATA_KEYS.has(key))
  );
}

function isRuntimeMetadataOnly(sourceCommit, filePath = RUNTIME_METADATA_PATH) {
  try {
    const before = JSON.parse(git(["show", `${sourceCommit}:${filePath}`]));
    const after = readJson(filePath);
    if (JSON.stringify(withoutRuntimeMetadata(before)) !== JSON.stringify(withoutRuntimeMetadata(after))) {
      return false;
    }
    return (
      after.canonicalRuntime === "next" &&
      after.rollbackRuntime === "static-node" &&
      after.gateCProduction === "CLOSED" &&
      after.publicDeploymentPerformed === false &&
      Object.values(after.featureFlagDefaults || {}).every((enabled) => enabled === false)
    );
  } catch {
    return false;
  }
}

function classifyChangedPath(filePath, options = {}) {
  const normalized = normalizePath(filePath);
  if (normalized === "package.json" || normalized === "package-lock.json") {
    return CLASSIFICATIONS.BUILD_OR_DEPENDENCY_AFFECTING;
  }
  if (
    normalized === "next.config.mjs" ||
    normalized.startsWith("tsconfig") ||
    normalized.startsWith("vitest") ||
    normalized.startsWith("playwright")
  ) {
    return CLASSIFICATIONS.BUILD_OR_DEPENDENCY_AFFECTING;
  }
  if (
    normalized === "index.html" ||
    normalized === "app.js" ||
    normalized === "styles.css" ||
    /^(styles|public|Asset|tests\/visual\/baselines|tests\/visual\/contracts)\//.test(normalized)
  ) {
    return CLASSIFICATIONS.VISUAL_OR_ASSET_AFFECTING;
  }
  if (
    normalized.startsWith("src/app/api/") ||
    normalized.startsWith("src/app/") && /\/(page|route)\.(ts|tsx|js|jsx)$/.test(normalized)
  ) {
    return CLASSIFICATIONS.ROUTE_OR_API_AFFECTING;
  }
  if (
    normalized.startsWith("src/") ||
    normalized.startsWith("scripts/runtime/") ||
    normalized === "config/runtime/runtime-source-manifest.json" ||
    normalized === "config/runtime/route-compatibility-manifest.json" ||
    normalized === "config/runtime/asset-media-compatibility-manifest.json" ||
    normalized === "config/security-headers.json" ||
    normalized === "config/telemetry-event-registry.json" ||
    normalized === "server.js"
  ) {
    return CLASSIFICATIONS.RUNTIME_AFFECTING;
  }
  if (
    normalized.startsWith("tests/") ||
    normalized.startsWith("scripts/release/") ||
    normalized === "config/release-gate-policy.json" ||
    normalized.startsWith(".github/")
  ) {
    return CLASSIFICATIONS.GATE_OR_TEST_AFFECTING;
  }
  if (normalized === RUNTIME_METADATA_PATH) {
    return options.runtimeMetadataOnly === true
      ? CLASSIFICATIONS.RUNTIME_MANIFEST_METADATA
      : CLASSIFICATIONS.RUNTIME_AFFECTING;
  }
  if (EXACT_OWNER_RECORDS.has(normalized)) return CLASSIFICATIONS.OWNER_APPROVAL;
  if (EXACT_EVIDENCE_RECORDS.has(normalized)) return CLASSIFICATIONS.EVIDENCE_ARTIFACT;
  if (EXACT_REPORT_RECORDS.has(normalized)) return CLASSIFICATIONS.REPORT_ONLY;
  return CLASSIFICATIONS.UNKNOWN_BLOCKED;
}

function evaluateLineage(input) {
  const failures = [];
  if (input.runtimeSourceDigestMatches === false) failures.push("runtime_source_digest");
  if (!input.runtimeSourceIsAncestor) failures.push("runtime_source_not_ancestor");
  if (!input.gateExecutionIsDescendant) failures.push("gate_execution_lineage");
  if (!input.evidenceCommitIsDescendant) failures.push("evidence_commit_lineage");
  if (!input.artifactsValid) failures.push("modified_evidence_artifact");

  for (const changed of input.changedPaths || []) {
    if (!ALLOWED_DESCENDANT_CLASSIFICATIONS.has(changed.classification)) {
      failures.push(`disallowed_change:${changed.path}:${changed.classification}`);
    }
    if (
      changed.classification === CLASSIFICATIONS.RUNTIME_MANIFEST_METADATA &&
      !input.runtimeMetadataVerified
    ) {
      failures.push(`runtime_metadata_unverified:${changed.path}`);
    }
    if (changed.boundHashMatches === false) {
      failures.push(`modified_bound_descendant:${changed.path}`);
    }
  }

  const result = failures.length === 0 ? "PASS" : "BLOCKED";
  let evidenceMode = "BLOCKED_UNKNOWN_CHANGE";
  if (result === "PASS") {
    evidenceMode = (input.changedPaths || []).length === 0
      ? "FULL_GATE_EXECUTED_AT_CURRENT_SOURCE"
      : "STRICT_EVIDENCE_ONLY_DESCENDANT_REUSE";
  } else if (
    failures.every((failure) =>
      failure.startsWith("disallowed_change:") ||
      failure.startsWith("runtime_metadata_unverified:")
    )
  ) {
    evidenceMode = "REGENERATION_REQUIRED";
  }
  return Object.freeze({ result, evidenceMode, failures });
}

function commitIsAncestor(ancestor, descendant) {
  return run("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
    allowFailure: true
  }).status === 0;
}

function changedPathsBetween(sourceCommit, currentHead) {
  const output = git(["diff", "--name-only", `${sourceCommit}..${currentHead}`]);
  return output ? output.split(/\r?\n/).filter(Boolean).map(normalizePath) : [];
}

function verifyRepositoryLineage(manifest, options = {}) {
  const currentHead = git(["rev-parse", "HEAD"]);
  const lineage = manifest.lineage || {};
  const runtimeSourceCommit = lineage.runtimeSourceCommit || manifest.source?.commit;
  const gateExecutionCommit = lineage.gateExecutionCommit || manifest.source?.commit;
  const evidenceCommit = lineage.evidenceCommit || gateExecutionCommit;
  const computedRuntimeIdentity = computeRuntimeSourceIdentity();
  let runtimeSourceDigestMatches = false;
  try {
    runtimeSourceDigestMatches =
      validateRuntimeSourceDigest(lineage.runtimeSourceDigest) === computedRuntimeIdentity.digest &&
      lineage.runtimeSourceIdentityVersion === computedRuntimeIdentity.generatorVersion;
  } catch {
    runtimeSourceDigestMatches = false;
  }
  const bound = new Map(
    (lineage.allowedDescendantFiles || []).map((record) => [record.path, record])
  );
  const paths = changedPathsBetween(runtimeSourceCommit, currentHead);
  const runtimeMetadataChanged = paths.includes(RUNTIME_METADATA_PATH);
  const runtimeMetadataOnly = runtimeMetadataChanged
    ? isRuntimeMetadataOnly(runtimeSourceCommit)
    : false;
  let runtimeMetadataVerified = !runtimeMetadataChanged;
  if (runtimeMetadataOnly) {
    const runtimeResult = run(
      process.execPath,
      ["scripts/runtime/verify-runtime-contract.cjs"],
      { allowFailure: true }
    );
    runtimeMetadataVerified = runtimeResult.status === 0;
  }

  const changedPaths = paths.map((filePath) => {
    const classification = classifyChangedPath(filePath, {
      runtimeMetadataOnly: filePath === RUNTIME_METADATA_PATH && runtimeMetadataOnly
    });
    const existing = bound.get(filePath);
    const exists = fs.existsSync(absolute(filePath));
    const sha256 = exists ? sha256File(filePath) : null;
    return {
      path: filePath,
      classification,
      sha256,
      boundHashMatches: existing ? existing.sha256 === sha256 : null
    };
  });

  const evaluation = evaluateLineage({
    runtimeSourceIsAncestor:
      Boolean(runtimeSourceCommit) && commitIsAncestor(runtimeSourceCommit, currentHead),
    gateExecutionIsDescendant:
      Boolean(gateExecutionCommit) &&
      commitIsAncestor(runtimeSourceCommit, gateExecutionCommit) &&
      commitIsAncestor(gateExecutionCommit, currentHead),
    evidenceCommitIsDescendant:
      Boolean(evidenceCommit) &&
      commitIsAncestor(runtimeSourceCommit, evidenceCommit) &&
      commitIsAncestor(evidenceCommit, currentHead),
    artifactsValid: options.artifactsValid === true,
    runtimeMetadataVerified,
    runtimeSourceDigestMatches,
    changedPaths
  });

  return Object.freeze({
    ...evaluation,
    currentHead,
    runtimeSourceCommit,
    gateExecutionCommit,
    evidenceCommit,
    reportCommit: lineage.reportCommit || null,
    runtimeSourceDigest: lineage.runtimeSourceDigest || null,
    computedRuntimeSourceDigest: computedRuntimeIdentity.digest,
    runtimeSourceDigestMatches,
    runtimeMetadataVerified,
    changedPaths
  });
}

function createLineageRecord({ runtimeSourceCommit, gateExecutionCommit }) {
  for (const [role, commit] of Object.entries({
    runtimeSourceCommit,
    gateExecutionCommit
  })) {
    if (!/^[a-f0-9]{40}$/.test(commit || "")) {
      throw new Error(`Release lineage ${role} is invalid.`);
    }
  }
  const runtimeIdentity = computeRuntimeSourceIdentity();
  return {
    schemaVersion: 2,
    policyVersion: "teoyube-strict-release-lineage-2026-07-25.2",
    runtimeSourceCommit,
    runtimeSourceDigest: runtimeIdentity.digest,
    runtimeSourceIdentityVersion: runtimeIdentity.generatorVersion,
    gateExecutionCommit,
    evidenceCommit: null,
    reportCommit: null,
    allowedDescendantFiles: []
  };
}

function bindCurrentHead(manifest, options = {}) {
  const verification = verifyRepositoryLineage(manifest, options);
  if (verification.result !== "PASS") {
    throw new Error(`Cannot bind blocked release lineage: ${verification.failures.join(", ")}`);
  }
  const existing = new Map(
    (manifest.lineage.allowedDescendantFiles || []).map((record) => [record.path, record])
  );
  for (const record of verification.changedPaths) {
    existing.set(record.path, {
      path: record.path,
      classification: record.classification,
      sha256: record.sha256
    });
  }
  const lineage = {
    ...manifest.lineage,
    allowedDescendantFiles: [...existing.values()].sort((left, right) =>
      left.path.localeCompare(right.path)
    )
  };
  if (!lineage.evidenceCommit) lineage.evidenceCommit = verification.currentHead;
  else lineage.reportCommit = verification.currentHead;
  return {
    manifest: { ...manifest, lineage },
    verification
  };
}

module.exports = {
  CLASSIFICATIONS,
  bindCurrentHead,
  classifyChangedPath,
  createLineageRecord,
  evaluateLineage,
  isRuntimeMetadataOnly,
  verifyRepositoryLineage
};
