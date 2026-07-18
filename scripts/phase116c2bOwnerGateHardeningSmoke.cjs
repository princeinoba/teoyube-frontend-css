const fs = require("fs");
const path = require("path");
const os = require("os");
const http = require("http");
const crypto = require("crypto");
const { validateTeoyubeWorldOwnerGate } = require("./validateTeoyubeWorldOwnerGate.cjs");
const { createDerivativePlan } = require("./generateTeoyubeWorldPilotDerivatives.cjs");
const { server } = require("../server.js");
const {
  lifecyclePaths,
  lifecycleStates,
  artifactSnapshot,
  createApprovalControlResponse,
  requestOwnerApproval,
  revokeOwnerApproval,
  determineLifecycleState,
  authorizeDerivativeExecution,
  authorizePublication,
  requireDerivativeExecutionAuthorization,
  requirePublicationAuthorization
} = require("./lib/teoyubeWorldPilotLifecycle.cjs");

const root = path.resolve(__dirname, "..");
const sourceRoot = path.join(root, "media-source", "teoyubeworld", "originals");
const publicRoot = path.join(root, "public", "media", "teoyubeworld");

function treeSignature(folder) {
  if (!fs.existsSync(folder)) return { count: 0, bytes: 0, fingerprint: crypto.createHash("sha256").update("").digest("hex") };
  const rows = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (entry.isFile()) {
        const stat = fs.statSync(fullPath);
        rows.push(`${path.relative(folder, fullPath).replace(/\\/g, "/")}|${stat.size}|${stat.mtimeMs}`);
      }
    }
  };
  visit(folder);
  rows.sort();
  return {
    count: rows.length,
    bytes: rows.reduce((sum, row) => sum + Number(row.split("|")[1]), 0),
    fingerprint: crypto.createHash("sha256").update(rows.join("\n")).digest("hex")
  };
}

function request(port, method, pathname, body) {
  return new Promise((resolve, reject) => {
    const payload = body == null ? null : Buffer.from(JSON.stringify(body));
    const req = http.request({
      host: "127.0.0.1",
      port,
      method,
      path: pathname,
      headers: payload ? { "Content-Type": "application/json", "Content-Length": payload.length } : {}
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve({ status: res.statusCode, body: text ? JSON.parse(text) : null, text });
      });
    });
    req.on("error", reject);
    if (payload) req.end(payload); else req.end();
  });
}

function fakePassingGate() {
  const selectedMediaIds = Array.from({ length: 12 }, (_, index) => `media-${String(index + 1).padStart(20, "0")}`);
  return {
    schemaVersion: "1.0.0",
    phase: "11.6C.2B",
    generatedAt: "2026-07-13T12:00:00.000Z",
    status: "passed",
    gatePassed: true,
    manifestVersion: "1.0.0",
    sourceDraftManifestChecksum: "a".repeat(64),
    counts: { selected: 12, approvedShorts: 12, approvedLongForm: 0, approvedSequences: 1 },
    selectedMediaIds,
    selectedSequenceIds: ["sequence-owner-confirmed"],
    selectedSourceChecksums: Object.fromEntries(selectedMediaIds.map((id, index) => [id, String(index + 1).padStart(64, "0")])),
    blockers: [],
    warnings: [],
    outputs: { approvedPilotManifestCreated: false, runtimeManifestCreated: false, derivativesGenerated: 0, filesPublished: 0 },
    safety: { originalsModified: 0, externalUploads: 0, publicMastersCopied: 0 }
  };
}

async function run() {
  const checks = [];
  const check = (id, condition, detail) => {
    checks.push({ id, passed: Boolean(condition), detail });
    if (!condition) throw new Error(`${id}: ${detail}`);
  };

  const sourceBefore = treeSignature(sourceRoot);
  const publicBefore = treeSignature(publicRoot);
  const actualGate = await validateTeoyubeWorldOwnerGate();
  check("actual_gate_approved", actualGate.status === "passed" && actualGate.blockers.length === 0, "The current owner gate is owner-approved with zero blockers.");
  const blockedFixture = { ...actualGate, status: "blocked", gatePassed: false, blockerCount: 1, blockers: [{ blockerId: "requirement:fixture", code: "fixture_blocker", category: "owner_review", message: "Fixture blocker", mediaId: actualGate.selectedMediaIds[0] }] };

  const baseHtml = fs.readFileSync(path.join(root, "media-review.html"), "utf8");
  const clientSource = fs.readFileSync(path.join(root, "media-review.js"), "utf8");
  const serverSource = fs.readFileSync(path.join(root, "server.js"), "utf8");
  const plannerSource = fs.readFileSync(path.join(root, "scripts", "generateTeoyubeWorldPilotDerivatives.cjs"), "utf8");
  check("approval_absent_in_base_html", !baseHtml.includes('id="approve-pilot-definition"') && baseHtml.includes('id="owner-gate-control"'), "Blocked markup contains no approval button or form.");
  check("no_approval_keyboard_shortcut", !/keydown[\s\S]{0,500}approve-pilot-definition|event\.key[\s\S]{0,200}owner-approval/i.test(clientSource), "No approval keyboard shortcut exists.");
  check("no_approval_url_parameter", !/[?&](approve|approval)=|searchParams\.get\(["'](?:approve|approval)/i.test(clientSource + serverSource), "No approval URL parameter exists.");
  check("client_has_no_global_bypass", !/window\.(?:approve|approval|approvePilot)|globalThis\.(?:approve|approval|approvePilot)/i.test(clientSource), "No client-side approval bypass is exposed globally.");

  const blockedControl = createApprovalControlResponse(blockedFixture, {});
  check("blocked_control_absent", blockedControl.statusCode === 409 && !JSON.stringify(blockedControl.payload).includes("approve-pilot-definition"), "Approval control response is absent while blockers exist.");
  const blockedServiceApproval = requestOwnerApproval(blockedFixture, { ownerConfirmation: true, writeArtifact: () => { throw new Error("Blocked approval must not write."); } });
  check("blocked_service_approval_rejected", blockedServiceApproval.statusCode === 409 && blockedServiceApproval.payload.blockerCount === 1, "The server-side approval service rejects a blocked validation fixture.");
  const approvalBefore = fs.readFileSync(lifecyclePaths.approval, "utf8");

  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", resolve);
    server.once("error", reject);
  });
  const port = server.address().port;
  try {
    const controlResponse = await request(port, "GET", "/__qa/teoyubeworld/owner-gate-control?qa=1");
    check("server_approved_control_absent", controlResponse.status === 200 && controlResponse.body.approvalRecorded === true && !controlResponse.text.includes("approve-pilot-definition"), "Server omits a second approval control after owner approval.");
    const approvalResponse = await request(port, "POST", "/__qa/teoyubeworld/owner-approval?qa=1", { ownerConfirmation: true });
    check("direct_approval_rejected", approvalResponse.status === 409 && approvalResponse.body.blockers?.length > 0, "A direct approval request outside the authoritative completed workflow is rejected without rewriting the approval.");
    const executionResponse = await request(port, "POST", "/__qa/teoyubeworld/derivative-execution?qa=1", {});
    check("direct_execution_rejected", executionResponse.status === 409 && executionResponse.body.executed === false && executionResponse.body.commandsExecuted === 0, "Derivative execution is rejected without separate authorization.");
    const publicationResponse = await request(port, "POST", "/__qa/teoyubeworld/publication?qa=1", {});
    check("direct_publication_rejected", publicationResponse.status === 409 && publicationResponse.body.published === false && publicationResponse.body.blockers?.[0]?.code === "publication_execution_not_exposed" && publicationResponse.body.filesPublished === (artifactSnapshot().publicationReceipt?.totalFilesPublished || 0), "Browser publication is rejected and cannot create or repeat the separately authorized publication.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  check("direct_request_preserves_approval", fs.readFileSync(lifecyclePaths.approval, "utf8") === approvalBefore, "Rejected direct requests do not rewrite the canonical approval artifact.");

  const passingGate = fakePassingGate();
  const readyControl = createApprovalControlResponse(passingGate, {});
  check("approval_appears_after_zero_blockers", readyControl.statusCode === 200 && readyControl.payload.blockerCount === 0 && readyControl.payload.approvalControlHtml.includes('id="approve-pilot-definition"'), "Approval markup is emitted only for a passing complete validation.");

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "teoyube-owner-gate-"));
  const approvalPath = path.join(tempRoot, "approval.json");
  const tempPaths = {
    approval: approvalPath,
    derivativePlan: path.join(tempRoot, "plan.json"),
    derivativeExecutionAuthorization: path.join(tempRoot, "execution-authorization.json"),
    derivatives: path.join(tempRoot, "derivatives.json"),
    derivativeValidation: path.join(tempRoot, "derivative-validation.json"),
    publicationPlan: path.join(tempRoot, "publication-plan.json"),
    publicationAuthorization: path.join(tempRoot, "publication-authorization.json"),
    publicationReceipt: path.join(tempRoot, "publication-receipt.json")
  };
  const approval = requestOwnerApproval(passingGate, { ownerConfirmation: true, outputPath: approvalPath, approvedAt: "2026-07-13T12:01:00.000Z" });
  check("approval_artifact_checksum_bound", approval.statusCode === 201 && fs.existsSync(approvalPath) && approval.payload.approvalArtifact.approvedRecordIds.length === 12 && Object.keys(approval.payload.approvalArtifact.sourceChecksums).length === 12, "Approval creates only the checksum-bound pilot-definition artifact.");
  check("approval_has_exact_validation", approval.payload.approvalArtifact.exactValidationResult === passingGate && approval.payload.approvalArtifact.ownerConfirmation.confirmed === true, "Approval records exact validation and explicit owner confirmation.");

  const fakePilotPlan = {
    selectedMediaIds: passingGate.selectedMediaIds,
    blockers: [],
    status: "ready",
    estimatedPublicBytes: 123456,
    estimatedProcessingStorageBytes: 234567
  };
  let processCalls = 0;
  const childProcess = require("child_process");
  const originals = { spawn: childProcess.spawn, spawnSync: childProcess.spawnSync, exec: childProcess.exec, execSync: childProcess.execSync };
  for (const name of Object.keys(originals)) childProcess[name] = () => { processCalls += 1; throw new Error("Planning attempted process execution."); };
  let derivativePlan;
  try {
    derivativePlan = createDerivativePlan(fakePilotPlan);
  } finally {
    Object.assign(childProcess, originals);
  }
  check("planning_process_free", processCalls === 0 && derivativePlan.processExecutionAttempted === false && derivativePlan.commandsExecuted === 0, "Planning executes no FFmpeg, FFprobe, or other process.");
  check("planning_media_free", derivativePlan.publicFilesCopied === 0 && derivativePlan.originalsModified === 0 && derivativePlan.browserFacingDerivativesCreated === 0, "Planning creates no media files and modifies no source files.");
  check("planner_has_no_dangerous_api", !/require\(["']child_process["']\)|\bspawn(?:Sync)?\s*\(|\bexec(?:File|Sync)?\s*\(|copyFile(?:Sync)?\s*\(|createWriteStream\s*\(|rename(?:Sync)?\s*\(/.test(plannerSource), "The planning module calls no process, copy, stream, or rename API.");

  const artifactsWithoutAuthorization = { approval: approval.payload.approvalArtifact, derivativePlan, derivativeExecutionAuthorization: null, derivatives: null, derivativeValidation: null, publicationPlan: null, publicationAuthorization: null, publicationReceipt: null };
  check("lifecycle_states_complete", lifecycleStates.join(",") === "blocked,ready_for_owner_approval,owner_approved,derivative_plan_ready,derivative_execution_authorized,derivatives_generated,derivatives_validated,publication_plan_ready,publication_authorized,published", "Lifecycle state order contains every required non-skippable state, including publication planning.");
  check("plan_state_requires_approval", determineLifecycleState(passingGate, { ...artifactsWithoutAuthorization, approval: null }) === "ready_for_owner_approval", "A derivative plan cannot skip owner approval.");
  check("execution_requires_separate_authorization", requireDerivativeExecutionAuthorization(passingGate, { artifacts: artifactsWithoutAuthorization }).allowed === false && authorizeDerivativeExecution(passingGate, { artifacts: artifactsWithoutAuthorization, ownerConfirmation: false }).statusCode === 409, "Execution remains blocked without a second explicit owner confirmation.");
  check("publication_requires_separate_authorization", requirePublicationAuthorization(passingGate, { artifacts: artifactsWithoutAuthorization }).allowed === false && authorizePublication(passingGate, { artifacts: artifactsWithoutAuthorization, ownerConfirmation: false, sourceChecksumsUnchanged: true, runtimeManifestApproved: true }).statusCode === 409, "Publication remains blocked without validated derivatives and explicit publication authorization.");

  const revoked = revokeOwnerApproval({ paths: tempPaths });
  check("approval_reversible_before_execution", revoked.statusCode === 200 && revoked.payload.revoked === true && !fs.existsSync(approvalPath), "Pilot-definition approval is reversible before derivative execution authorization.");
  fs.rmSync(tempRoot, { recursive: true, force: true });

  const sourceAfter = treeSignature(sourceRoot);
  const publicAfter = treeSignature(publicRoot);
  check("source_unchanged", JSON.stringify(sourceAfter) === JSON.stringify(sourceBefore), "Protected source file count, bytes, names, and mtimes remain unchanged throughout approval and planning checks.");
  check("public_media_unchanged", JSON.stringify(publicAfter) === JSON.stringify(publicBefore), "Planning and approval write nothing into public/media/teoyubeworld.");

  const report = {
    valid: checks.every((item) => item.passed),
    phaseComplete: false,
    gateStatus: actualGate.status,
    checksPassed: checks.filter((item) => item.passed).length,
    checks,
    safety: {
      sourceBefore,
      sourceAfter,
      publicBefore,
      publicAfter,
      approvalMediaFilesCreated: 0,
      planningCommandsExecuted: 0,
      planningPublicFilesWritten: 0
    }
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) run().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { run, treeSignature, fakePassingGate };
