const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { getCanonicalGateSnapshot } = require("./validateTeoyubeWorldOwnerGate.cjs");
const {
  selectedRecordSchemaFields,
  ensureCanonicalStateRevision,
  assertCurrentStateRevision,
  getCanonicalPilotState,
  getCanonicalSequenceState
} = require("./lib/teoyubeWorldCanonicalPilotState.cjs");
const {
  lifecyclePaths,
  artifactSnapshot,
  determineLifecycleState,
  createApprovalControlResponse,
  requestOwnerApproval
} = require("./lib/teoyubeWorldPilotLifecycle.cjs");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function filesUnder(relativePath) {
  const target = path.join(root, relativePath);
  if (!fs.existsSync(target)) return [];
  return fs.readdirSync(target, { recursive: true }).map(String).filter((name) => fs.statSync(path.join(target, name)).isFile());
}

async function run() {
  const server = read("server.js");
  const wizard = read("media-review-wizard.js");
  const html = read("media-review.html");
  const css = read("media-review.css");
  const canonical = read("scripts/lib/teoyubeWorldCanonicalPilotState.cjs");
  const first = await getCanonicalGateSnapshot();
  const second = await getCanonicalGateSnapshot();
  const state = getCanonicalPilotState();
  const sequence = getCanonicalSequenceState(state);

  assert.strictEqual(first.stateRevision, second.stateRevision, "identical persisted state must keep one revision");
  assert.strictEqual(first.blockerCount, second.blockerCount, "identical persisted state must produce one blocker count");
  assert.deepStrictEqual(first.blockersByCategory, second.blockersByCategory, "blocker categories must be deterministic");
  assert.strictEqual(first.blockerCount, first.blockers.length, "reported blocker count must match the canonical list");
  assert.strictEqual(first.serverPort, 4174);
  assert.ok(first.pilotPlanId && first.manifestVersion && first.generatedAt && first.stateRevision);
  assert.strictEqual(state.selectedRecords.length, 12);
  assert.strictEqual(sequence.suggestedSegmentIds.length, 12);
  assert.strictEqual(first.blockersByCategory.technical, 0);
  assert.strictEqual(first.blockersByCategory.duplicate, 0);
  assert.strictEqual(first.blockersByCategory.checksum_source, 0);

  assert.ok(canonical.includes("function getCanonicalPilotState"));
  assert.ok(canonical.includes("function getCanonicalOwnerReviewPatches"));
  assert.ok(canonical.includes("function getCanonicalSequenceState"));
  assert.ok(canonical.includes("function getCanonicalDeclarationState"));
  assert.ok(canonical.includes("function calculateCanonicalPilotBlockers"));
  assert.ok(canonical.includes("function persistCanonicalGateSnapshot"));
  assert.ok(selectedRecordSchemaFields.includes("ownerReviewed") && selectedRecordSchemaFields.includes("translationConfirmed"));
  assert.ok(server.includes("normalizeTranslation") && server.includes("invalid_translation"));
  assert.ok(server.includes("/^Book\\s+\\d+:/i") && server.includes("invalid_scripture_reference"));
  assert.ok(server.includes("authoritativeReviewPort = 4174"));
  assert.ok(server.includes("assertCurrentStateRevision"));
  assert.ok(server.includes("derivative_execution_not_exposed") && server.includes("publication_authorization_not_exposed"));
  assert.ok(wizard.includes("wizard-record-progress") && wizard.includes("completionItem"));
  assert.ok(wizard.includes("wizard-apply-reconfirmation"));
  assert.ok(wizard.includes("previewBulk") && wizard.includes("Fix All Technical Blockers") === false);
  assert.ok(html.includes("Fix All Technical Blockers"));
  assert.ok(html.includes("Apply Owner Reconfirmation"));
  assert.ok(html.includes("Accept Suggested Scripture"));
  assert.ok(!html.includes('id="wizard-reconfirm-watched" type="checkbox" checked'));
  assert.ok(!html.includes('id="wizard-reconfirm-rights" type="checkbox" checked'));
  assert.ok(!html.includes('id="wizard-reconfirm-scripture" type="checkbox" checked'));
  assert.ok(!html.includes('id="wizard-reconfirm-safety" type="checkbox" checked'));
  assert.ok(css.includes("padding-bottom: 7rem") && css.includes("scroll-margin-block: 6rem"));
  assert.ok(css.includes("@media (max-width: 430px)") && css.includes("position: static"));

  const revision = ensureCanonicalStateRevision();
  let staleRejected = false;
  try { assertCurrentStateRevision("stale-revision-fixture"); } catch (error) { staleRejected = error.code === "stale_state_revision"; }
  assert.ok(staleRejected, "stale client revisions must be rejected");
  assert.strictEqual(revision.stateRevision, ensureCanonicalStateRevision().stateRevision);

  const blockedFixture = { ...first, gatePassed: false, status: "blocked", blockerCount: 1, blockers: [{ blockerId: "requirement:fixture", code: "fixture_blocker", category: "owner_review", message: "Fixture blocker", mediaId: state.selectedRecords[0].id }] };
  const blockedControl = createApprovalControlResponse(blockedFixture, {});
  assert.strictEqual(blockedControl.statusCode, 409);
  assert.ok(!blockedControl.payload.approvalControlHtml);
  const fixtureGate = { ...first, gatePassed: true, status: "passed", blockerCount: 0, blockers: [] };
  const readyControl = createApprovalControlResponse(fixtureGate, {});
  assert.strictEqual(readyControl.statusCode, 200);
  assert.ok(readyControl.payload.approvalControlHtml.includes("Approve Owner-Reviewed Pilot"));
  const blockedApproval = requestOwnerApproval(blockedFixture, { ownerConfirmation: true, writeArtifact: () => { throw new Error("must not write"); } });
  assert.strictEqual(blockedApproval.statusCode, 409);

  const lifecycleArtifacts = artifactSnapshot();
  const lifecycleState = determineLifecycleState(first, lifecycleArtifacts);
  const published = lifecycleState === "published";
  assert.ok((!lifecycleArtifacts.publicationAuthorization && !lifecycleArtifacts.publicationReceipt) || (published && lifecycleArtifacts.publicationAuthorization && lifecycleArtifacts.publicationReceipt?.totalFilesPublished === 49), "publication artifacts must be absent before publication or complete in the published state");
  assert.ok(!lifecycleArtifacts.derivatives || (lifecycleArtifacts.derivativeExecutionAuthorization && lifecycleArtifacts.derivativeValidation?.valid === true), "later derivative artifacts require their authorization and validation chain");
  const publicFiles = filesUnder("public/media/teoyubeworld");
  assert.ok(published ? publicFiles.length === 50 && publicFiles.includes(".gitkeep") : publicFiles.length === 1 && publicFiles[0] === ".gitkeep");
  assert.ok(!/\b(?:spawn|execFile|execSync|copyFileSync)\s*\(/.test(canonical));
  assert.ok(!/ffmpeg/i.test(canonical));

  const report = {
    valid: true,
    phase: "11.6C.2A.3",
    stateRevision: first.stateRevision,
    blockerCount: first.blockerCount,
    blockersByCategory: first.blockersByCategory,
    selectedShorts: state.selectedRecords.length,
    suggestedSequenceSegments: sequence.suggestedSegmentIds.length,
    confirmedSequenceSegments: sequence.segmentIds.length,
    approvalControlAbsentWhileBlocked: true,
    currentGateApproved: first.gatePassed && first.blockerCount === 0,
    zeroBlockerApprovalFixturePassed: true,
    staleRevisionRejected: true,
    lifecycleState,
    derivativeExecutionAuthorized: Boolean(lifecycleArtifacts.derivativeExecutionAuthorization),
    publicationAuthorized: Boolean(lifecycleArtifacts.publicationAuthorization),
    mediaCopied: 0,
    mediaTranscoded: 0,
    publicFilesWritten: lifecycleArtifacts.publicationReceipt?.totalFilesPublished || 0
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) run().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { run };
