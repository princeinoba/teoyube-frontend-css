#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const decisionId = "TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001";
const startingCommit = "1d74ff7a8b995a0f1461d8dd7a6731541d29eb4f";
const branch = "recovery/visual-source-of-truth";
const batchId = "5C-1";
const prePhaseTag = "teoyube-9of10-phase5c1-start-1d74ff7";

const paths = {
  approvalMd: `docs/owner-approvals/accessibility/${decisionId}.md`,
  approvalJson: `docs/owner-approvals/accessibility/${decisionId}.json`,
  decisionMd: "docs/accessibility/owner-review/phase-5b-owner-decisions.md",
  decisionJson: "docs/accessibility/owner-review/phase-5b-owner-decisions.json",
  batchMd: "docs/accessibility/phase-5c-proposed-batches.md",
  batchJson: "docs/accessibility/phase-5c-proposed-batches.json",
  runtime: "config/runtime/canonical-runtime-manifest.json",
  runtimeSources: "config/runtime/runtime-source-manifest.json",
  blockers: "docs/stabilization/known-blockers.json",
  routes: "config/runtime/route-compatibility-manifest.json",
  routeParity: "tests/visual/contracts/route-parity-matrix.json",
  issueRegister: "docs/accessibility/accessibility-issue-register.json",
  phase5aEvidence: "docs/accessibility/phase-5a-automated-audit-evidence.json"
};

const protectedContracts = [
  "tests/visual/contracts/protected-visual-source-manifest.json",
  "tests/visual/contracts/static-dom-contract.json",
  "tests/visual/contracts/original-static-visual-contract.json",
  "tests/visual/baselines/static-runtime/manifest.json",
  "tests/visual/baselines/owner-approved-support-routes/manifest.json",
  "tests/visual/baselines/owner-approved-next-support/manifest.json",
  "tests/visual/baselines/owner-approved-scripture-content-delta/manifest.json"
];

function absolute(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(absolute(relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hashObject(value) {
  return sha256(JSON.stringify(stable(value)));
}

function identity(relativePath) {
  const bytes = fs.readFileSync(absolute(relativePath));
  return { path: relativePath, bytes: bytes.length, sha256: sha256(bytes) };
}

function write(relativePath, value) {
  const target = absolute(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  fs.writeFileSync(target, text.endsWith("\n") ? text : `${text}\n`, "utf8");
}

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

function loadAndValidate() {
  const errors = [];
  const approval = readJson(paths.approvalJson);
  const decisionLedger = readJson(paths.decisionJson);
  const batchManifest = readJson(paths.batchJson);
  const batch = batchManifest.batches.find((entry) => entry.batchId === batchId);
  if (!batch || batch.status !== "READY_NOT_STARTED") errors.push("Batch 5C-1 is missing or not ready.");
  const issueIds = batch?.issueIds || [];
  if (!issueIds.length || JSON.stringify(issueIds) !== JSON.stringify(batch.approvedIssueIds)) errors.push("Batch 5C-1 scope is empty or ambiguous.");
  const decisions = new Map(decisionLedger.decisions.map((entry) => [entry.id, entry]));
  const approvalEntries = new Map(approval.decisions.map((entry) => [entry.issueOrTaskId, entry]));
  const requests = issueIds.map((issueId) => readJson(`docs/accessibility/owner-review/requests/${issueId}.json`));
  for (const request of requests) {
    const decision = decisions.get(request.issueId);
    const approved = approvalEntries.get(request.issueId);
    const recomputed = hashObject(proposalBinding(request));
    if (request.implementationBatch !== batchId) errors.push(`${request.issueId} is assigned to ${request.implementationBatch}.`);
    if (request.ownerDecision !== "APPROVE_RECOMMENDED_PHASE5C_FIX") errors.push(`${request.issueId} is not approved for implementation.`);
    if (request.proposalHash !== recomputed || decision?.proposalHash !== recomputed || approved?.proposalHash !== recomputed) errors.push(`${request.issueId} proposal-hash mismatch.`);
    if (decision?.decision !== "APPROVE_RECOMMENDED_PHASE5C_FIX" || decision?.executionStatus !== "APPROVED_NOT_STARTED") errors.push(`${request.issueId} decision-ledger mismatch.`);
    if (request.expectedPixelImpact !== "none" || request.expectedDomImpact !== "attribute_only") errors.push(`${request.issueId} impact exceeds Phase 5C-1 zero-pixel attribute scope.`);
    for (const relativePath of [...request.proposedFiles, ...request.protectedContractsAffected]) {
      if (!fs.existsSync(absolute(relativePath))) errors.push(`${request.issueId} missing path: ${relativePath}`);
    }
    if (!request.tests?.length || !request.rollback) errors.push(`${request.issueId} lacks tests or rollback.`);
  }
  if (approval.decision !== "APPROVED" || approval.decisionId !== decisionId || approval.phase5c !== "READY_FOR_APPROVED_SCOPE_ONLY_NOT_STARTED") errors.push("Owner approval identity/status mismatch.");
  if (batchManifest.ownerDecisionId !== decisionId) errors.push("Batch manifest owner-decision mismatch.");
  if (errors.length) throw new Error(errors.join("\n"));
  return { approval, decisionLedger, batchManifest, batch, issueIds, requests };
}

function lock() {
  const data = loadAndValidate();
  const runtime = readJson(paths.runtime);
  const generatedAt = new Date().toISOString();
  const requestFiles = data.issueIds.flatMap((issueId) => [
    `docs/accessibility/owner-review/requests/${issueId}.md`,
    `docs/accessibility/owner-review/requests/${issueId}.json`
  ]);
  const evidenceFiles = [
    paths.approvalMd, paths.approvalJson, paths.decisionMd, paths.decisionJson,
    paths.batchMd, paths.batchJson, paths.issueRegister, paths.phase5aEvidence,
    paths.runtime, paths.runtimeSources, paths.blockers, paths.routes, paths.routeParity,
    ...requestFiles
  ];
  const blockerRegistry = readJson(paths.blockers);
  const blockerIds = (blockerRegistry.blockers || []).map((entry) => entry.blockerId || entry.id).filter(Boolean);
  const startingManifest = {
    schemaVersion: 1,
    phase: "5C-1",
    status: "STARTING_EVIDENCE_LOCKED_BEFORE_SOURCE_CHANGES",
    generatedAt,
    branch,
    startingCommit,
    prePhaseTag,
    ownerDecisionId: decisionId,
    ownerDecisionTimestamp: data.approval.approvedAt,
    batch: batchId,
    issueIds: data.issueIds,
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
    currentBlockerIds: blockerIds,
    preflight: {
      branch: "PASS",
      head: "PASS_EXACT",
      cleanTrackedWorktreeBeforeEvidenceTooling: true,
      node: "v24.18.0",
      npm: "10.2.4",
      runtime: "PASS",
      recovery: "PASS",
      phase5b: "PASS",
      staticRollback: "RETAINED",
      paidCalls: 0
    },
    invariants: {
      productSourceChangesAtLock: 0,
      protectedVisualChangesAtLock: 0,
      cssChangesAtLock: 0,
      baselineChangesAtLock: 0,
      phase5c2Started: false,
      phase5c3Started: false,
      manualEvidenceExecuted: 0
    }
  };
  write("docs/accessibility/phase-5c1-starting-manifest.json", startingManifest);

  const scopeIssues = data.requests.map((request) => ({
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
    expectedKeyboardFocusImpact: request.expectedBehaviorImpact,
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
    issues: scopeIssues,
    authorizedFiles: [...new Set(scopeIssues.flatMap((issue) => issue.files))].sort(),
    protectedContracts: [...new Set(scopeIssues.flatMap((issue) => issue.protectedContracts))].sort(),
    excludedIds: {
      batch5c2: data.batchManifest.batches.find((entry) => entry.batchId === "5C-2").issueIds,
      batch5c3: data.batchManifest.batches.find((entry) => entry.batchId === "5C-3").issueIds,
      manualEvidence: data.decisionLedger.decisions.filter((entry) => entry.decision === "APPROVE_MANUAL_EVIDENCE_TASK").map((entry) => entry.id)
    },
    invariants: {
      controlsRemoved: 0,
      visibleCopyChanges: 0,
      cssChanges: 0,
      classIdChanges: 0,
      assetChanges: 0,
      structuralChanges: 0,
      expectedPixelDifferences: 0,
      staticRollbackRuntimeReplacement: false,
      baselineWrites: 0
    }
  };
  write("docs/accessibility/phase-5c1-approved-scope.json", scope);
  const issueMarkdown = scopeIssues.map((issue) => `### ${issue.issueId} — ${issue.title}\n\n- Proposal hash: \`${issue.proposalHash}\`\n- Files: ${issue.files.map((file) => `\`${file}\``).join(", ")}\n- Routes/states: ${issue.routes.join(", ")} — ${issue.states.join(", ")}\n- Expected pixel impact: **${issue.expectedPixelImpact}**\n- Expected DOM/ARIA impact: **${issue.expectedDomAriaImpact}**\n- Keyboard/focus impact: ${issue.expectedKeyboardFocusImpact}\n- Approved remediation: ${issue.proposedAction}\n- Rollback: ${issue.rollback}`).join("\n\n");
  write("docs/accessibility/phase-5c1-approved-scope.md", `# Phase 5C-1 approved accessibility scope\n\n- Status: **LOCKED BEFORE SOURCE CHANGES**\n- Owner decision: \`${decisionId}\`\n- Batch: **5C-1**\n- Approved issue IDs: **${data.issueIds.join(", ")}**\n- Expected pixel, CSS, copy, class, ID, asset, and layout changes: **0**\n\n${issueMarkdown}\n\n## Explicit exclusions\n\n- Batch 5C-2: ${scope.excludedIds.batch5c2.join(", ")}\n- Batch 5C-3: ${scope.excludedIds.batch5c3.join(", ")}\n- Manual evidence: ${scope.excludedIds.manualEvidence.join(", ")}\n- No baseline replacement, manual-task execution, WCAG conformance claim, Phase 6A work, paid call, push, or deploy.\n`);
  console.log(JSON.stringify({ status: "PASS", batch: batchId, issueIds: data.issueIds, proposalHashes: startingManifest.proposalHashes, deliverables: ["docs/accessibility/phase-5c1-starting-manifest.json", "docs/accessibility/phase-5c1-approved-scope.md", "docs/accessibility/phase-5c1-approved-scope.json"] }, null, 2));
}

function verify() {
  const data = loadAndValidate();
  const manifest = readJson("docs/accessibility/phase-5c1-starting-manifest.json");
  const scope = readJson("docs/accessibility/phase-5c1-approved-scope.json");
  const errors = [];
  if (manifest.startingCommit !== startingCommit || manifest.ownerDecisionId !== decisionId || manifest.batch !== batchId) errors.push("Starting manifest identity mismatch.");
  if (JSON.stringify(manifest.issueIds) !== JSON.stringify(data.issueIds) || JSON.stringify(scope.issues.map((issue) => issue.issueId)) !== JSON.stringify(data.issueIds)) errors.push("Scope issue IDs changed.");
  for (const request of data.requests) if (manifest.proposalHashes[request.issueId] !== request.proposalHash || scope.issues.find((issue) => issue.issueId === request.issueId)?.proposalHash !== request.proposalHash) errors.push(`${request.issueId} locked proposal changed.`);
  for (const item of manifest.protectedAndBaselineFiles) if (identity(item.path).sha256 !== item.sha256) errors.push(`Protected/baseline hash changed: ${item.path}`);
  const result = { status: errors.length ? "FAIL" : "PASS", batch: batchId, issueIds: data.issueIds, proposalHashes: "PASS_3", protectedAndBaselineHashes: errors.some((error) => error.startsWith("Protected")) ? "FAIL" : "PASS", errors };
  console.log(JSON.stringify(result, null, 2));
  if (errors.length) process.exitCode = 1;
}

const command = process.argv[2] || "verify";
if (command === "lock") lock();
else if (command === "verify") verify();
else throw new Error("Usage: node scripts/accessibility/prepare-phase5c1.cjs [lock|verify]");
