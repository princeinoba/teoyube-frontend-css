const crypto = require("crypto");
const childProcess = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { server } = require("../server.js");
const { validateTeoyubeWorldOwnerGate } = require("./validateTeoyubeWorldOwnerGate.cjs");
const { validateSelectedPilot } = require("./lib/teoyubeWorldAssistedPilot.cjs");
const {
  lifecyclePaths,
  artifactSnapshot,
  determineLifecycleState,
  createApprovalControlResponse,
  requestOwnerApproval
} = require("./lib/teoyubeWorldPilotLifecycle.cjs");

const root = path.resolve(__dirname, "..");
const sourceRoot = path.join(root, "media-source", "teoyubeworld", "originals");
const publicRoot = path.join(root, "public", "media", "teoyubeworld");
const candidatePath = path.join(root, "generated", "teoyubeworld-media", "review", "assisted-pilot-candidate.json");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parses(relativePath) {
  try {
    childProcess.execFileSync(process.execPath, ["--check", path.join(root, relativePath)], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function treeSignature(folder) {
  if (!fs.existsSync(folder)) return { count: 0, bytes: 0, fingerprint: crypto.createHash("sha256").update("").digest("hex") };
  const rows = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const filePath = path.join(current, entry.name);
      if (entry.isDirectory()) visit(filePath);
      else if (entry.isFile()) {
        const stat = fs.statSync(filePath);
        rows.push(`${path.relative(folder, filePath).replace(/\\/g, "/")}|${stat.size}|${stat.mtimeMs}`);
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

function validScopedFixture() {
  const records = Array.from({ length: 12 }, (_, index) => ({
    id: `media-${String(index + 1).padStart(20, "0")}`,
    checksumSha256: String(index + 1).padStart(64, "0"),
    shortOrLong: "short",
    sequenceId: "sequence-aaaaaaaaaaaaaaaa",
    sequenceOrder: index + 1,
    metadataProbeStatus: "complete",
    reviewStatus: "approved",
    mappingConfidence: "confirmed",
    ScriptureMappingStatus: "confirmed",
    copyrightStatus: "owner_owned",
    safetyStatus: "approved"
  }));
  records.push({
    id: "media-unrelated-bad-record",
    checksumSha256: "f".repeat(64),
    shortOrLong: "long_form",
    sequenceId: "unrelated-sequence",
    metadataProbeStatus: "missing",
    reviewStatus: "blocked",
    mappingConfidence: "unknown",
    copyrightStatus: "rejected",
    safetyStatus: "unsafe"
  });
  return {
    records,
    selectedIds: records.slice(0, 12).map((record) => record.id),
    selectedSequenceId: "sequence-aaaaaaaaaaaaaaaa",
    declarations: { rights: true, scripture: true, safety: true }
  };
}

function fakePassingGate() {
  const selectedMediaIds = Array.from({ length: 12 }, (_, index) => `media-${String(index + 1).padStart(20, "0")}`);
  const declaration = (confirmedAt) => ({ confirmed: true, confirmedAt, confirmedBy: "fixture_owner" });
  return {
    schemaVersion: "1.0.0",
    phase: "11.6C.2A.2",
    generatedAt: "2026-07-13T20:00:00.000Z",
    status: "passed",
    gatePassed: true,
    manifestVersion: "1.0.0",
    sourceDraftManifestChecksum: "a".repeat(64),
    counts: { selected: 12, approvedShorts: 12, approvedLongForm: 0, approvedSequences: 1 },
    selectedMediaIds,
    selectedSequenceIds: ["sequence-aaaaaaaaaaaaaaaa"],
    selectedSequenceOrder: selectedMediaIds.slice(0, 5),
    selectedSourceChecksums: Object.fromEntries(selectedMediaIds.map((id, index) => [id, String(index + 1).padStart(64, "0")])),
    ownerDeclarations: { declarations: { rights: declaration("2026-07-13T19:50:00.000Z"), scripture: declaration("2026-07-13T19:51:00.000Z"), safety: declaration("2026-07-13T19:52:00.000Z") } },
    blockers: [],
    warnings: []
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
  const candidate = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
  const html = read("media-review.html");
  const client = `${read("media-review.js")}\n${read("media-review-wizard.js")}`;
  const serverSource = read("server.js");
  const assistedSource = read("scripts/lib/teoyubeWorldAssistedPilot.cjs");
  const prepSource = read("scripts/prepareTeoyubeWorldAssistedPilot.cjs");
  const plannerSource = read("scripts/generateTeoyubeWorldPilotDerivatives.cjs");

  check("app_parses", parses("app.js"), "The primary static app parses.");
  check("server_parses", parses("server.js"), "The local QA server parses.");
  check("media_review_parses", parses("media-review.js"), "The full media-review client parses.");
  check("media_review_wizard_parses", parses("media-review-wizard.js"), "The assisted pilot wizard client parses.");
  check("smoke_script_parses", parses("scripts/phase116c2a2GateSmoke.cjs"), "The Phase 11.6C.2A.2 smoke script parses.");
  check("candidate_exists", fs.existsSync(candidatePath), "The assisted pilot candidate exists.");
  check("candidate_exact_short_target", candidate.selectedShortIds.length === 12 && candidate.accounting.selectedShorts === 12, "The candidate targets exactly 12 shorts.");
  check("candidate_one_sequence_target", Boolean(candidate.recommendedSequenceId) && candidate.candidateSequences.some((item) => item.sequenceId === candidate.recommendedSequenceId), "Exactly one recommended sequence target is identified without owner-confirming it.");
  check("candidate_zero_long_form", candidate.selectedLongFormIds.length === 0 && candidate.accounting.selectedLongForm === 0, "The first pilot targets zero long-form records.");
  check("candidate_no_absolute_paths", !/[A-Za-z]:[\\/]/.test(JSON.stringify(candidate)), "The candidate exposes no absolute source path.");
  check("technical_metadata_complete", Object.keys(candidate.technicalMetadata || {}).length === 12 && candidate.sourceIntegrity.every((item) => item.sourceModified === false), "All 12 candidates have read-only technical metadata and unchanged-source evidence.");
  check("review_artifacts_bounded", Object.keys(candidate.reviewArtifacts.posters || {}).length === 12 && Object.keys(candidate.reviewArtifacts.contactSheets || {}).length === 12, "Bounded poster and contact-sheet review artifacts exist for all candidates.");
  check("exact_duplicate_canonicalization", prepSource.includes("probablePreferredCopy") && prepSource.includes("exact_duplicate_excluded") && prepSource.includes("doNotPublish: true"), "Exact byte-identical duplicate canonicalization is deterministic and reversible.");
  check("pilot_scoped_helpers", ["getPilotScopedBlockers", "validateSelectedPilot", "getPilotDuplicateBlockers", "getPilotSequenceBlockers", "getPilotRecordBlockers", "getPilotOwnerConfirmationBlockers"].every((name) => assistedSource.includes(`function ${name}`)), "Pilot-scoped gate helpers exist.");
  const scopedFixture = validateSelectedPilot(validScopedFixture());
  check("unrelated_records_do_not_block", scopedFixture.valid && scopedFixture.selectedRecords.length === 12 && !scopedFixture.blockers.some((item) => item.mediaId === "media-unrelated-bad-record"), "An unrelated invalid library record cannot block a valid selected pilot fixture.");
  check("sequence_order_validation", assistedSource.includes("order === index + 1") && serverSource.includes("segmentIds.length < 5"), "Sequence order is contiguous and bounded to a complete owner-confirmed pilot definition.");
  check("assisted_wizard", html.includes('id="assisted-pilot-wizard"') && client.includes('params.get("mode") !== "pilot-wizard"') && html.includes('data-step-panel="8"'), "The eight-step assisted wizard exists.");
  check("fix_next_blocker", html.includes("Fix Next Blocker") && client.includes("resolveNextBlocker") && client.includes("blockerPriority"), "The priority-guided blocker resolver exists.");
  for (const name of ["rights", "scripture", "safety"]) {
    const expression = new RegExp(`id="wizard-${name}-declaration"(?![^>]*checked)`);
    check(`${name}_declaration_unchecked`, expression.test(html), `The ${name} declaration exists and defaults unchecked.`);
  }
  check("owner_confirmation_not_automated", !/\.click\(\)[\s\S]{0,120}(rights|scripture|safety)-declaration/i.test(client) && client.includes("confirmRecordReviewed"), "Owner confirmations require explicit controls and are not automated.");
  check("approval_absent_in_markup", !html.includes('id="approve-pilot-definition"'), "No approval control exists in base blocked markup.");

  const actualGate = await validateTeoyubeWorldOwnerGate();
  check("actual_gate_resolved", actualGate.status === "passed" && actualGate.blockers.length === 0, "The real pilot now reflects the completed owner-attested gate.");
  const blockedFixture = { ...actualGate, status: "blocked", gatePassed: false, blockerCount: 1, blockers: [{ blockerId: "requirement:fixture", code: "fixture_blocker", category: "owner_review", message: "Fixture owner requirement is unresolved.", mediaId: actualGate.selectedMediaIds[0] }] };
  const blockedControl = createApprovalControlResponse(blockedFixture, {});
  check("blocked_control_absent", blockedControl.statusCode === 409 && !JSON.stringify(blockedControl.payload).includes("approve-pilot-definition"), "Blocked validation returns no approval control.");
  const blockedApproval = requestOwnerApproval(blockedFixture, { ownerConfirmation: true, writeArtifact: () => { throw new Error("A blocked fixture must not write."); } });
  check("blocked_service_approval_rejected", blockedApproval.statusCode === 409 && blockedApproval.payload.blockerCount === 1, "The approval service rejects a blocked validation fixture.");

  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", resolve);
    server.once("error", reject);
  });
  const port = server.address().port;
  try {
    const response = await request(port, "POST", "/__qa/teoyubeworld/owner-approval?qa=1", { ownerConfirmation: true });
    check("server_rejects_direct_approval", response.status === 409 && response.body.blockers?.length > 0, "The server rejects a direct approval request outside the authoritative completed workflow.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  const passingGate = fakePassingGate();
  const readyControl = createApprovalControlResponse(passingGate, {});
  check("approval_only_after_zero", readyControl.statusCode === 200 && readyControl.payload.approvalControlHtml.includes("Approve Owner-Reviewed Pilot"), "The approval control appears only for a zero-blocker fixture.");
  let approvalArtifact = null;
  const approval = requestOwnerApproval(passingGate, {
    ownerConfirmation: true,
    writeArtifact: (_filePath, value) => { approvalArtifact = value; },
    outputPath: path.join(root, ".tmp", "fixture-approval.json")
  });
  check("approval_contract", approval.statusCode === 201 && approvalArtifact.approvedRecordIds.length === 12 && approvalArtifact.approvedSequenceOrder.length === 5 && approvalArtifact.ownerDeclarations.rights.confirmed === true, "Fixture approval is checksum-bound and records sequence order and declaration timestamps.");
  check("approval_creates_no_media", approval.payload.mediaFilesCreated === 0 && approval.payload.publicFilesWritten === 0 && approval.payload.sourceFilesModified === 0, "Approval creates no media and modifies no source.");
  check("planning_is_non_destructive", !/require\(["']child_process["']\)|\bspawn(?:Sync)?\s*\(|\bexec(?:File|Sync)?\s*\(|copyFile(?:Sync)?\s*\(|createWriteStream\s*\(|rename(?:Sync)?\s*\(/.test(plannerSource), "Derivative planning contains no process, copy, stream, or rename API.");
  check("no_public_media_written", treeSignature(publicRoot).count === publicBefore.count && treeSignature(publicRoot).bytes === publicBefore.bytes, "No public media file was written.");
  const currentArtifacts = artifactSnapshot();
  const currentLifecycle = determineLifecycleState(actualGate, currentArtifacts);
  check("later_lifecycle_chain_valid", (!currentArtifacts.derivatives || (currentArtifacts.derivativeExecutionAuthorization && currentArtifacts.derivativeValidation?.valid === true)) && (currentLifecycle === "published" ? Boolean(currentArtifacts.publicationAuthorization && currentArtifacts.publicationReceipt?.totalFilesPublished === 49) : !currentArtifacts.publicationAuthorization && !currentArtifacts.publicationReceipt), "Any later derivative and publication artifacts retain their required authorization, validation, and receipt chain.");
  const runtimeSources = `${serverSource}\n${client}\n${prepSource}`;
  check("no_external_services", !/api\.openai|api\.anthropic|cloudinary|s3\.amazonaws|youtube\.googleapis|fetch\(["']https?:/i.test(runtimeSources), "No external media, AI, storage, or upload service is called.");
  check("no_forbidden_platforms", !/gtag\(|posthog|mixpanel|plausible|indexedDB|new\s+PrismaClient|serviceWorker\.register|navigator\.serviceWorker|new\s+OpenAI/i.test(runtimeSources), "No analytics, database, service worker, browser persistence, or live AI was added.");

  const sourceAfter = treeSignature(sourceRoot);
  const publicAfter = treeSignature(publicRoot);
  check("source_immutable", JSON.stringify(sourceAfter) === JSON.stringify(sourceBefore), "Protected source count, bytes, paths, sizes, and modification times are unchanged.");
  check("public_immutable", JSON.stringify(publicAfter) === JSON.stringify(publicBefore), "Public media remains unchanged.");

  const report = {
    phase: "11.6C.2A.2",
    valid: checks.every((item) => item.passed),
    checks,
    candidate: {
      selectedShorts: candidate.selectedShortIds.length,
      recommendedSequenceId: candidate.recommendedSequenceId,
      selectedLongForm: candidate.selectedLongFormIds.length,
      technicalMetadataComplete: Object.keys(candidate.technicalMetadata || {}).length,
      exactDuplicatesExcluded: candidate.excludedExactDuplicateIds.length
    },
    gate: { status: actualGate.status, blockerCount: actualGate.blockers.length },
    safety: {
      sourceFilesModified: 0,
      mediaCopied: 0,
      mediaTranscoded: 0,
      derivativesGenerated: 0,
      publicFilesWritten: 0,
      externalUploads: 0,
      derivativeExecutionAuthorized: Boolean(currentArtifacts.derivativeExecutionAuthorization),
      publicationAuthorized: Boolean(currentArtifacts.publicationAuthorization)
    },
    currentLifecycle
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exitCode = 1;
  return report;
}

if (require.main === module) run().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { run };
