const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  generatedRoot,
  loadReviewWorkspace,
  applyPatches,
  writeJson
} = require("./lib/teoyubeWorldReviewPatches.cjs");
const {
  lifecyclePaths,
  artifactSnapshot,
  determineLifecycleState,
  fingerprint
} = require("./lib/teoyubeWorldPilotLifecycle.cjs");
const { getCanonicalGateSnapshot } = require("./validateTeoyubeWorldOwnerGate.cjs");

const projectRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(projectRoot, "media-source", "teoyubeworld", "originals");
const pilotRoot = path.join(generatedRoot, "pilot-v1");
const sourceVerificationPath = path.join(pilotRoot, "source-verification.json");
const planRoot = path.join(pilotRoot, "plans");
const derivativePlanPath = path.join(planRoot, "derivative-plan.json");
const derivativePlanMarkdownPath = path.join(planRoot, "derivative-plan.md");

const PROFILES = Object.freeze([
  { id: "card-preview-mp4", kind: "video", suffix: "card-preview.mp4", ratio: 0.28, command: "-vf scale=-2:720 -c:v libx264 -preset medium -crf 24 -movflags +faststart -an" },
  { id: "mobile-preview-mp4", kind: "video", suffix: "mobile-preview.mp4", ratio: 0.18, command: "-vf scale=-2:480 -c:v libx264 -preset medium -crf 26 -movflags +faststart -an" },
  { id: "poster-webp", kind: "poster", suffix: "poster.webp", fixedBytes: 153600, command: "-frames:v 1 -vf scale=-2:900 -c:v libwebp -quality 82" },
  { id: "thumbnail-webp", kind: "thumbnail", suffix: "thumbnail.webp", fixedBytes: 61440, command: "-frames:v 1 -vf scale=480:-2 -c:v libwebp -quality 78" }
]);

function assertNoAbsoluteSourcePaths(value, label) {
  const serialized = JSON.stringify(value);
  if (/[A-Za-z]:[\\/]/.test(serialized)) throw new Error(`${label} contains a disallowed absolute Windows path.`);
}

function checksumFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const input = fs.createReadStream(filePath);
    input.on("error", reject);
    input.on("data", (chunk) => hash.update(chunk));
    input.on("end", () => resolve(hash.digest("hex")));
  });
}

function projectedBytes(record, profile) {
  return profile.fixedBytes || Math.max(262144, Math.ceil(Number(record.fileSizeBytes || 0) * profile.ratio));
}

function outputPathFor(mediaId, suffix) {
  return `generated/teoyubeworld-media/pilot-v1/derivatives/${mediaId}/${suffix}`;
}

function futurePublicPathFor(mediaId, suffix) {
  return `public/media/teoyubeworld/${mediaId}/${suffix}`;
}

function createOperation(record, profile, operationIndex) {
  const outputPath = outputPathFor(record.id, profile.suffix);
  return {
    operationId: `planned-${String(operationIndex + 1).padStart(2, "0")}`,
    mediaId: record.id,
    profile: profile.id,
    kind: profile.kind,
    sourceToken: `<protected-source:${record.id}>`,
    outputPath,
    futurePublicPath: futurePublicPathFor(record.id, profile.suffix),
    projectedBytes: projectedBytes(record, profile),
    commandPreview: `<local-ffmpeg-executable> -hide_banner -nostdin -i <protected-source:${record.id}> ${profile.command} <planned-output:${outputPath}>`,
    executionAuthorized: false,
    commandExecuted: false,
    outputCreated: false
  };
}

async function verifyApprovedSources(approval, recordsById) {
  const rows = [];
  for (const mediaId of approval.approvedRecordIds || []) {
    const record = recordsById.get(mediaId);
    const sourcePath = record?.relativeSourcePath ? path.join(sourceRoot, record.relativeSourcePath) : null;
    const exists = Boolean(sourcePath && fs.existsSync(sourcePath));
    const actualChecksum = exists ? await checksumFile(sourcePath) : null;
    const expectedChecksum = approval.sourceChecksums?.[mediaId] || null;
    rows.push({
      mediaId,
      sourceExists: exists,
      checksumMatches: Boolean(actualChecksum && expectedChecksum && actualChecksum === expectedChecksum),
      expectedChecksumSha256: expectedChecksum,
      actualChecksumSha256: actualChecksum,
      sourceFileSizeBytes: exists ? fs.statSync(sourcePath).size : null,
      sourceReference: `<protected-source:${mediaId}>`
    });
  }
  return rows;
}

async function createApprovedPilotDerivativePlan(options = {}) {
  const gate = options.gate || await getCanonicalGateSnapshot();
  const artifacts = options.artifacts || artifactSnapshot();
  const approval = artifacts.approval;
  if (!gate.gatePassed || gate.blockerCount !== 0) throw new Error("The canonical owner gate is not clear.");
  if (!approval || approval.approvalState !== "owner_approved") throw new Error("A checksum-bound owner approval artifact is required.");
  if (approval.derivativeExecutionAuthorized || approval.publicationAuthorized) throw new Error("The approval artifact has an invalid authorization scope.");
  if ((approval.approvedRecordIds || []).length !== 12 || (approval.approvedSequenceIds || []).length !== 1 || (approval.approvedSequenceOrder || []).length !== 12) {
    throw new Error("The approved pilot must contain 12 records and one 12-segment sequence.");
  }

  const { manifest, sourceChecksum, patches } = loadReviewWorkspace();
  const merged = applyPatches(manifest, patches, sourceChecksum);
  if (!merged.valid) throw new Error("The review patch set is invalid.");
  const recordsById = new Map(merged.manifest.records.map((record) => [record.id, record]));
  const selectedRecords = approval.approvedRecordIds.map((mediaId) => recordsById.get(mediaId));
  if (selectedRecords.some((record) => !record)) throw new Error("An approved record is absent from the canonical manifest.");

  const verification = await verifyApprovedSources(approval, recordsById);
  const failedVerification = verification.filter((row) => !row.sourceExists || !row.checksumMatches);
  const sourceSnapshot = {
    artifactType: "teoyubeworld_approved_pilot_source_verification",
    schemaVersion: "1.0.0",
    phase: "11.6C.2B",
    generatedAt: new Date().toISOString(),
    pilotPlanId: approval.pilotPlanId,
    approvalArtifactChecksum: approval.artifactChecksumSha256,
    approvedRecordCount: approval.approvedRecordIds.length,
    sourceIntegrityPassed: failedVerification.length === 0,
    records: verification,
    sourceFilesModified: 0,
    mediaCopied: 0,
    mediaTranscoded: 0,
    publicFilesWritten: 0
  };
  assertNoAbsoluteSourcePaths(sourceSnapshot, "Source verification snapshot");
  if (failedVerification.length) throw new Error(`Source verification failed for ${failedVerification.map((row) => row.mediaId).join(", ")}.`);

  const operations = selectedRecords.flatMap((record) => PROFILES.map((profile) => ({ record, profile })))
    .map(({ record, profile }, index) => createOperation(record, profile, index));
  const projectedGeneratedBytes = operations.reduce((sum, operation) => sum + operation.projectedBytes, 0);
  const profileCounts = Object.fromEntries(PROFILES.map((profile) => [profile.id, operations.filter((operation) => operation.profile === profile.id).length]));
  const generatedAt = new Date().toISOString();
  const plan = {
    artifactType: "teoyubeworld_derivative_dry_run_plan",
    schemaVersion: "2.0.0",
    phase: "11.6C.2B",
    generatedAt,
    lifecycleState: "derivative_plan_ready",
    mode: "dry-run",
    status: "planned",
    pilotPlanId: approval.pilotPlanId,
    approvalArtifactChecksum: approval.artifactChecksumSha256,
    validationFingerprint: approval.validationFingerprint,
    approvedRecordIds: [...approval.approvedRecordIds],
    approvedSequenceIds: [...approval.approvedSequenceIds],
    approvedSequenceOrder: [...approval.approvedSequenceOrder],
    approvedRecordCount: 12,
    approvedLongFormCount: 0,
    profileCounts,
    plannedCommandCount: operations.length,
    operations,
    projectedGeneratedBytes,
    projectedFuturePublicBytes: projectedGeneratedBytes,
    optionalWebmIncluded: false,
    ffmpegExecutable: "<local-ffmpeg-executable>",
    ffprobeExecutable: "<local-ffprobe-executable>",
    sourceVerificationArtifact: "generated/teoyubeworld-media/pilot-v1/source-verification.json",
    sourceIntegrityPassed: true,
    validationExpectations: ["source_checksum_unchanged", "browser_decode", "dimensions", "duration", "poster_decode", "thumbnail_decode", "no_absolute_source_path"],
    derivativeExecutionAuthorized: false,
    publicationAuthorized: false,
    processExecutionAttempted: false,
    commandsExecuted: 0,
    sourceFilesModified: 0,
    mediaFilesCopied: 0,
    mediaFilesTranscoded: 0,
    derivativesGenerated: 0,
    publicFilesWritten: 0,
    runtimeManifestUpdated: false,
    warning: "Command previews are inert. This plan does not execute FFmpeg, copy or transcode media, update the runtime manifest, or publish files."
  };
  plan.planChecksumSha256 = fingerprint(plan);
  assertNoAbsoluteSourcePaths(plan, "Derivative plan");

  if (options.writeArtifacts !== false) {
    writeJson(sourceVerificationPath, sourceSnapshot);
    writeJson(derivativePlanPath, plan);
    writeJson(lifecyclePaths.derivativePlan, plan);
    fs.mkdirSync(planRoot, { recursive: true });
    fs.writeFileSync(derivativePlanMarkdownPath, [
      "# TeoyubeWorld Approved Pilot Derivative Plan",
      "",
      `- Mode: ${plan.mode}`,
      `- Approved records: ${plan.approvedRecordCount}`,
      `- Approved sequences: ${plan.approvedSequenceIds.length}`,
      `- Card previews: ${profileCounts["card-preview-mp4"]}`,
      `- Mobile previews: ${profileCounts["mobile-preview-mp4"]}`,
      `- Posters: ${profileCounts["poster-webp"]}`,
      `- Thumbnails: ${profileCounts["thumbnail-webp"]}`,
      `- Planned FFmpeg operations: ${plan.plannedCommandCount}`,
      `- Projected generated bytes: ${projectedGeneratedBytes}`,
      "- Commands executed: 0",
      "- Source files modified: 0",
      "- Public files written: 0",
      "",
      "Derivative execution and publication require separate explicit owner authorization."
    ].join("\n") + "\n", "utf8");
  }

  return { plan, sourceSnapshot, lifecycleState: determineLifecycleState(gate, { ...artifacts, derivativePlan: plan }) };
}

async function run() {
  const result = await createApprovedPilotDerivativePlan();
  console.log(JSON.stringify({
    status: result.plan.status,
    lifecycleState: result.lifecycleState,
    approvedRecords: result.plan.approvedRecordCount,
    approvedSequences: result.plan.approvedSequenceIds.length,
    plannedCommandCount: result.plan.plannedCommandCount,
    profileCounts: result.plan.profileCounts,
    projectedGeneratedBytes: result.plan.projectedGeneratedBytes,
    commandsExecuted: result.plan.commandsExecuted,
    sourceFilesModified: result.plan.sourceFilesModified,
    mediaFilesCopied: result.plan.mediaFilesCopied,
    mediaFilesTranscoded: result.plan.mediaFilesTranscoded,
    publicFilesWritten: result.plan.publicFilesWritten
  }, null, 2));
  return result;
}

if (require.main === module) run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

module.exports = {
  PROFILES,
  sourceVerificationPath,
  derivativePlanPath,
  derivativePlanMarkdownPath,
  createApprovedPilotDerivativePlan,
  run
};
