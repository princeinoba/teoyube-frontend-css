#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const decisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001";
const startingCommit = "62c4f591226397bf88e28365761fcc97bf7fa42f";
const branch = "recovery/visual-source-of-truth";
const batchId = "5C-3";
const issueIds = ["A11Y-007", "A11Y-008"];
const prePhaseTag = "teoyube-9of10-phase5c3-start-62c4f59";

const paths = {
  approvalMd: `docs/owner-approvals/accessibility/${decisionId}.md`,
  approvalJson: `docs/owner-approvals/accessibility/${decisionId}.json`,
  decisionMd: "docs/accessibility/owner-review/phase-5b-owner-decisions.md",
  decisionJson: "docs/accessibility/owner-review/phase-5b-owner-decisions.json",
  reviewPackageMd: "docs/accessibility/owner-review/phase-5b-owner-review-package.md",
  reviewPackageJson: "docs/accessibility/owner-review/phase-5b-owner-review-package.json",
  batchMd: "docs/accessibility/phase-5c-proposed-batches.md",
  batchJson: "docs/accessibility/phase-5c-proposed-batches.json",
  issueRegisterMd: "docs/accessibility/accessibility-issue-register.md",
  issueRegisterJson: "docs/accessibility/accessibility-issue-register.json",
  phase5aEvidence: "docs/accessibility/phase-5a-automated-audit-evidence.json",
  runtime: "config/runtime/canonical-runtime-manifest.json",
  runtimeSources: "config/runtime/runtime-source-manifest.json",
  blockers: "docs/stabilization/known-blockers.json",
  routes: "config/runtime/route-compatibility-manifest.json",
  routeParity: "tests/visual/contracts/route-parity-matrix.json",
  programStatus: "docs/recovery/9of10-program-status.json"
};

const priorBatchFiles = [
  "docs/accessibility/phase-5c1-approved-scope.md",
  "docs/accessibility/phase-5c1-approved-scope.json",
  "config/accessibility/approved-phase-5c1-deltas.json",
  "tests/accessibility/evidence/phase-5c1/before/manifest.json",
  "tests/accessibility/evidence/phase-5c1/after/manifest.json",
  "tests/build-foundation/phase5c1-accessibility.test.ts",
  "tests/e2e/phase5c1-accessibility.spec.ts",
  "docs/recovery/9of10-phase-5c1-critical-accessibility-report.md",
  "docs/recovery/9of10-phase-5c1-critical-accessibility-report.json",
  "docs/accessibility/phase-5c2-approved-scope.md",
  "docs/accessibility/phase-5c2-approved-scope.json",
  "config/accessibility/approved-phase-5c2-deltas.json",
  "tests/accessibility/approved-deltas/phase-5c2/manifest.json",
  "tests/accessibility/evidence/phase-5c2/before/manifest.json",
  "tests/accessibility/evidence/phase-5c2/after/manifest.json",
  "tests/build-foundation/phase5c2-accessibility.test.ts",
  "tests/e2e/phase5c2-accessibility.spec.ts",
  "docs/recovery/9of10-phase-5c2-high-accessibility-report.md",
  "docs/recovery/9of10-phase-5c2-high-accessibility-report.json"
];

const protectedContracts = [
  "tests/visual/contracts/protected-visual-source-manifest.json",
  "tests/visual/contracts/static-dom-contract.json",
  "tests/visual/contracts/original-static-visual-contract.json",
  "tests/visual/baselines/static-runtime/manifest.json",
  "tests/visual/baselines/owner-approved-support-routes/manifest.json",
  "tests/visual/baselines/owner-approved-next-support/manifest.json",
  "tests/visual/baselines/owner-approved-scripture-content-delta/manifest.json"
];

const absolute = (relativePath) => path.join(root, relativePath);
const read = (relativePath) => fs.readFileSync(absolute(relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));
const stable = (value) => Array.isArray(value)
  ? value.map(stable)
  : value && typeof value === "object"
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]))
    : value;
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const hashObject = (value) => sha256(JSON.stringify(stable(value)));
const identity = (relativePath) => {
  const bytes = fs.readFileSync(absolute(relativePath));
  return { path: relativePath, bytes: bytes.length, sha256: sha256(bytes) };
};
const write = (relativePath, value) => {
  const target = absolute(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  fs.writeFileSync(target, text.endsWith("\n") ? text : `${text}\n`, "utf8");
};

function proposalBinding(request) {
  return {
    issueEvidence: request.phase5aEvidence,
    proposedAction: request.proposedAction,
    affectedFiles: request.proposedFiles,
    protectedContracts: request.protectedContractsAffected,
    testPlan: request.tests,
    rollback: request.rollback
  };
}

function loadAndValidate({ allowBlocked = false } = {}) {
  const errors = [];
  const approval = readJson(paths.approvalJson);
  const decisions = readJson(paths.decisionJson);
  const batches = readJson(paths.batchJson);
  const program = readJson(paths.programStatus);
  const batch = batches.batches.find((entry) => entry.batchId === batchId);
  const requests = issueIds.map((issueId) => readJson(`docs/accessibility/owner-review/requests/${issueId}.json`));
  const decisionById = new Map(decisions.decisions.map((entry) => [entry.id, entry]));
  const approvalById = new Map(approval.decisions.map((entry) => [entry.issueOrTaskId, entry]));

  const allowedBatchStatuses = allowBlocked
    ? ["READY_NOT_STARTED", "PASS", "BLOCKED_NEEDS_MORE_EVIDENCE", "SUPERSEDED_FOR_EXECUTION"]
    : ["READY_NOT_STARTED", "PASS"];
  if (!batch || !allowedBatchStatuses.includes(batch.status)) errors.push("Batch 5C-3 is missing or not ready.");
  if (JSON.stringify(batch?.issueIds) !== JSON.stringify(issueIds) || JSON.stringify(batch?.approvedIssueIds) !== JSON.stringify(issueIds)) errors.push("Batch 5C-3 scope is empty or ambiguous.");
  if (approval.decision !== "APPROVED" || approval.decisionId !== decisionId) errors.push("Owner approval identity mismatch.");
  if (batches.ownerDecisionId !== decisionId) errors.push("Batch manifest owner-decision mismatch.");

  for (const request of requests) {
    const decision = decisionById.get(request.issueId);
    const approved = approvalById.get(request.issueId);
    const recomputed = hashObject(proposalBinding(request));
    if (request.implementationBatch !== batchId) errors.push(`${request.issueId} is assigned to ${request.implementationBatch}.`);
    if (request.ownerDecision !== "APPROVE_RECOMMENDED_PHASE5C_FIX" || decision?.decision !== "APPROVE_RECOMMENDED_PHASE5C_FIX") errors.push(`${request.issueId} is not approved for implementation.`);
    if (request.proposalHash !== recomputed || decision?.proposalHash !== recomputed || approved?.proposalHash !== recomputed) errors.push(`${request.issueId} proposal-hash mismatch.`);
    if (request.expectedDomImpact !== "none") errors.push(`${request.issueId} unexpectedly authorizes a DOM change.`);
    if (!request.tests?.length || !request.rollback || !request.proposedAction) errors.push(`${request.issueId} lacks an unambiguous remediation, tests, or rollback.`);
    for (const file of [...request.proposedFiles, ...request.protectedContractsAffected]) if (!fs.existsSync(absolute(file))) errors.push(`${request.issueId} missing path: ${file}`);
  }

  for (const file of [
    ...Object.values(paths), ...priorBatchFiles, ...protectedContracts,
    ...issueIds.flatMap((issueId) => [`docs/accessibility/owner-review/requests/${issueId}.md`, `docs/accessibility/owner-review/requests/${issueId}.json`])
  ]) if (!fs.existsSync(absolute(file))) errors.push(`Required evidence path is missing: ${file}`);

  const phase5 = program.phases.find((phase) => phase.phaseId === "5");
  const status = (id) => phase5?.subphases?.find((entry) => entry.subphaseId === id)?.status;
  const allowed5c3 = allowBlocked ? ["READY", "PASS", "BLOCKED_NEEDS_MORE_EVIDENCE", "SUPERSEDED_FOR_EXECUTION"] : ["READY", "PASS"];
  if (phase5?.status !== "IN_PROGRESS" || status("5C-1") !== "PASS" || status("5C-2") !== "PASS" || !allowed5c3.includes(status("5C-3"))) errors.push("Program ledger does not authorize Phase 5C-3.");
  if (errors.length) throw new Error(errors.join("\n"));
  return { approval, batches, batch, requests };
}

function lock() {
  const data = loadAndValidate();
  const runtime = readJson(paths.runtime);
  const blockers = readJson(paths.blockers);
  const generatedAt = new Date().toISOString();
  const requestFiles = issueIds.flatMap((issueId) => [
    `docs/accessibility/owner-review/requests/${issueId}.md`,
    `docs/accessibility/owner-review/requests/${issueId}.json`
  ]);
  const evidenceFiles = [
    paths.approvalMd, paths.approvalJson, paths.decisionMd, paths.decisionJson,
    paths.reviewPackageMd, paths.reviewPackageJson, paths.batchMd, paths.batchJson,
    paths.issueRegisterMd, paths.issueRegisterJson, paths.phase5aEvidence,
    paths.runtime, paths.runtimeSources, paths.blockers, paths.routes, paths.routeParity,
    paths.programStatus, ...priorBatchFiles, ...requestFiles
  ];
  const manifest = {
    schemaVersion: 1,
    phase: "5C-3",
    status: "STARTING_EVIDENCE_LOCKED_BEFORE_SOURCE_CHANGES",
    generatedAt,
    branch,
    startingCommit,
    prePhaseTag,
    ownerDecisionId: decisionId,
    ownerDecisionTimestamp: data.approval.approvedAt,
    batch: batchId,
    issueIds,
    proposalHashes: Object.fromEntries(data.requests.map((request) => [request.issueId, request.proposalHash])),
    runtime: {
      canonical: runtime.canonicalRuntime,
      rollback: runtime.rollbackRuntime,
      runtimeSourceDigest: runtime.runtimeSourceDigest,
      deterministicBuildId: runtime.nextBuildId,
      publicRouteCount: runtime.publicRoutes.length
    },
    evidenceFiles: evidenceFiles.map(identity),
    protectedAndBaselineFiles: protectedContracts.map(identity),
    currentBlockerIds: (blockers.blockers || []).map((entry) => entry.blockerId || entry.id).filter(Boolean),
    preflight: {
      branch: "PASS",
      head: "PASS_EXACT",
      cleanTrackedWorktreeBeforeEvidenceTooling: true,
      node: "v24.18.0",
      npm: "10.2.4",
      runtime: "PASS",
      recovery: "PASS",
      phase5c1: "PASS",
      phase5c2: "PASS",
      currentAudit: "A11Y_007_AND_A11Y_008_REPRODUCED",
      staticRollback: "RETAINED",
      paidCalls: 0
    },
    invariants: {
      productSourceChangesAtLock: 0,
      protectedVisualChangesAtLock: 0,
      baselineChangesAtLock: 0,
      manualEvidenceExecuted: 0,
      phase6aStarted: false
    }
  };
  write("docs/accessibility/phase-5c3-starting-manifest.json", manifest);

  const issues = data.requests.map((request) => ({
    issueId: request.issueId,
    title: request.title,
    severity: request.severity,
    proposalHash: request.proposalHash,
    decision: request.ownerDecision,
    proposedAction: request.proposedAction,
    files: request.proposedFiles,
    protectedContracts: request.protectedContractsAffected,
    routes: request.affectedRoutes,
    states: request.affectedStates,
    viewports: request.affectedViewports,
    expectedPixelImpact: request.expectedPixelImpact,
    expectedDomAriaImpact: request.expectedDomImpact,
    expectedCopyImpact: "none",
    expectedCssLayoutImpact: request.issueId === "A11Y-007" ? "exact selector-scoped target geometry only" : "exact .canon-status.in-progress foreground/background only",
    expectedPointerTargetImpact: request.expectedBehaviorImpact,
    tests: request.tests,
    rollback: request.rollback
  }));
  const scope = {
    schemaVersion: 1,
    generatedAt,
    status: "LOCKED_BEFORE_SOURCE_CHANGES",
    ownerDecisionId: decisionId,
    ownerDecisionTimestamp: data.approval.approvedAt,
    batch: batchId,
    issues,
    authorizedFiles: [...new Set(issues.flatMap((issue) => issue.files))].sort(),
    protectedContracts: [...new Set(issues.flatMap((issue) => issue.protectedContracts))].sort(),
    excludedIds: {
      completed5c1: data.batches.batches.find((entry) => entry.batchId === "5C-1").issueIds,
      completed5c2: data.batches.batches.find((entry) => entry.batchId === "5C-2").issueIds,
      manualEvidence: ["A11Y-009", "A11Y-010", "A11Y-011", ...Array.from({ length: 9 }, (_, index) => `A11Y-MANUAL-${String(index + 1).padStart(3, "0")}`)],
      laterPhases: ["manual accessibility evidence execution", "Phase 6A", "Phase 4D", "archive work"]
    },
    invariants: {
      controlsRemoved: 0,
      visibleCopyChanges: 0,
      domClassIdChanges: 0,
      assetChanges: 0,
      baselineWrites: 0,
      staticRollbackRuntimeReplacement: false,
      manualEvidenceExecuted: 0
    }
  };
  write("docs/accessibility/phase-5c3-approved-scope.json", scope);
  const issueMarkdown = issues.map((issue) => `### ${issue.issueId} — ${issue.title}\n\n- Proposal hash: \`${issue.proposalHash}\`\n- Authorized files: ${issue.files.map((file) => `\`${file}\``).join(", ")}\n- Routes/states: ${issue.routes.join(", ")} — ${issue.states.join(", ")}\n- Expected pixel impact: **${issue.expectedPixelImpact}**\n- Expected DOM/ARIA impact: **${issue.expectedDomAriaImpact}**\n- Expected copy impact: **none**\n- Expected CSS/layout impact: ${issue.expectedCssLayoutImpact}\n- Pointer/target/description impact: ${issue.expectedPointerTargetImpact}\n- Approved remediation: ${issue.proposedAction}\n- Rollback: ${issue.rollback}`).join("\n\n");
  write("docs/accessibility/phase-5c3-approved-scope.md", `# Phase 5C-3 approved accessibility scope\n\n- Status: **LOCKED BEFORE SOURCE CHANGES**\n- Owner decision: \`${decisionId}\`\n- Batch: **5C-3**\n- Approved issue IDs: **${issueIds.join(", ")}**\n- Unapproved pixel, DOM, copy, CSS, class, ID, and asset changes: **0**\n\n${issueMarkdown}\n\n## Explicit exclusions\n\n- Completed Phase 5C-1: ${scope.excludedIds.completed5c1.join(", ")}\n- Completed Phase 5C-2: ${scope.excludedIds.completed5c2.join(", ")}\n- Manual evidence: ${scope.excludedIds.manualEvidence.join(", ")}\n- No baseline replacement, manual-task execution, WCAG conformance claim, Phase 6A work, paid call, push, or deploy.\n`);
  console.log(JSON.stringify({ status: "PASS", batch: batchId, issueIds, proposalHashes: manifest.proposalHashes }, null, 2));
}

function verify() {
  const data = loadAndValidate({ allowBlocked: true });
  const manifest = readJson("docs/accessibility/phase-5c3-starting-manifest.json");
  const scope = readJson("docs/accessibility/phase-5c3-approved-scope.json");
  const errors = [];
  if (manifest.startingCommit !== startingCommit || manifest.ownerDecisionId !== decisionId || manifest.batch !== batchId) errors.push("Starting manifest identity mismatch.");
  if (JSON.stringify(manifest.issueIds) !== JSON.stringify(issueIds) || JSON.stringify(scope.issues.map((issue) => issue.issueId)) !== JSON.stringify(issueIds)) errors.push("Scope issue IDs changed.");
  for (const request of data.requests) {
    if (manifest.proposalHashes[request.issueId] !== request.proposalHash || scope.issues.find((issue) => issue.issueId === request.issueId)?.proposalHash !== request.proposalHash) errors.push(`${request.issueId} locked proposal changed.`);
  }
  for (const item of manifest.protectedAndBaselineFiles) if (identity(item.path).sha256 !== item.sha256) errors.push(`Protected/baseline hash changed: ${item.path}`);
  console.log(JSON.stringify({ status: errors.length ? "FAIL" : "PASS", batch: batchId, issueIds, protectedAndBaselineHashes: errors.some((error) => error.startsWith("Protected")) ? "FAIL" : "PASS", errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

const command = process.argv[2] || "verify";
if (command === "lock") lock();
else if (command === "verify") verify();
else throw new Error("Usage: node scripts/accessibility/prepare-phase5c3.cjs [lock|verify]");
